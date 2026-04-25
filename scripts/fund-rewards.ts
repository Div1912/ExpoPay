import * as StellarSdk from '@stellar/stellar-sdk';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const SOROBAN_RPC_URL    = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.STELLAR_NETWORK_PASSPHRASE || StellarSdk.Networks.TESTNET;

const TOKEN_CONTRACT_ID   = process.env.TOKEN_CONTRACT_ID   || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
const STAKING_CONTRACT_ID = process.env.STAKING_CONTRACT_ID || '';
const POOL_CONTRACT_ID    = process.env.POOL_CONTRACT_ID    || '';
const ADMIN_SECRET        = process.env.STELLAR_ADMIN_SECRET || '';

if (!ADMIN_SECRET)        throw new Error('STELLAR_ADMIN_SECRET missing in .env');
if (!STAKING_CONTRACT_ID) throw new Error('STAKING_CONTRACT_ID missing in .env');
if (!POOL_CONTRACT_ID)    throw new Error('POOL_CONTRACT_ID missing in .env');

const server = new StellarSdk.rpc.Server(SOROBAN_RPC_URL);
const admin  = StellarSdk.Keypair.fromSecret(ADMIN_SECRET);

async function waitForTx(hash: string) {
    let res = await server.getTransaction(hash);
    while (res.status === 'NOT_FOUND') {
        await new Promise(r => setTimeout(r, 2000));
        res = await server.getTransaction(hash);
    }
    if (res.status !== 'SUCCESS') throw new Error(`Transaction failed: ${res.status}`);
    return res as StellarSdk.rpc.Api.GetSuccessfulTransactionResponse;
}

async function simulateBalance(contractId: string, address: string): Promise<bigint> {
    const contract = new StellarSdk.Contract(contractId);
    const account  = await server.getAccount(admin.publicKey());
    const tx = new StellarSdk.TransactionBuilder(account, {
        fee: '100000',
        networkPassphrase: NETWORK_PASSPHRASE,
    })
    .addOperation(contract.call(
        'balance',
        new StellarSdk.Address(address).toScVal()
    ))
    .setTimeout(60)
    .build();

    const sim = await server.simulateTransaction(tx);
    if ('error' in sim) {
        console.warn(`balance() simulation error: ${sim.error}`);
        return 0n;
    }
    const result = (sim as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse).result;
    if (!result) return 0n;
    const val = StellarSdk.scValToNative(result.retval);
    return BigInt(val);
}

async function callContract(
    contractId: string,
    method: string,
    args: StellarSdk.xdr.ScVal[],
    label: string
) {
    console.log(`\n→ ${label}`);
    const contract = new StellarSdk.Contract(contractId);
    const account  = await server.getAccount(admin.publicKey());

    let tx = new StellarSdk.TransactionBuilder(account, {
        fee: '1000000',
        networkPassphrase: NETWORK_PASSPHRASE,
    })
    .addOperation(contract.call(method, ...args))
    .setTimeout(300)
    .build();

    const prepared = await server.prepareTransaction(tx);
    prepared.sign(admin);
    const sendRes = await server.sendTransaction(prepared);

    if (sendRes.status === 'ERROR') {
        throw new Error(`${label} failed: ${sendRes.errorResult?.toXDR('base64')}`);
    }

    await waitForTx(sendRes.hash);
    console.log(`✓ ${label} — tx: ${sendRes.hash}`);
}

async function run() {
    console.log(`Admin:   ${admin.publicKey()}`);
    console.log(`Token:   ${TOKEN_CONTRACT_ID}`);
    console.log(`Staking: ${STAKING_CONTRACT_ID}`);
    console.log(`Pool:    ${POOL_CONTRACT_ID}\n`);

    // 1. Check admin's EXPO balance
    const adminBalance = await simulateBalance(TOKEN_CONTRACT_ID, admin.publicKey());
    console.log(`Admin EXPO balance: ${adminBalance} stroops (${Number(adminBalance) / 1e7} EXPO)`);

    if (adminBalance <= 0n) {
        console.error('\n❌ Admin has 0 EXPO tokens. Cannot fund reward pools.');
        console.error('You need to transfer EXPO tokens to the admin address:');
        console.error(`  ${admin.publicKey()}`);
        console.error('\nIf this is your EXPO token contract, use the token admin/minter key to mint tokens first.');
        process.exit(1);
    }

    // 2. Split balance: 40% staking, 40% pool, keep 20% buffer for fees
    const safeAmount  = (adminBalance * 40n) / 100n;
    const stakingFund = safeAmount;
    const poolFund    = safeAmount;

    console.log(`Will fund staking pool: ${stakingFund} stroops (${Number(stakingFund) / 1e7} EXPO)`);
    console.log(`Will fund XLM pool:     ${poolFund} stroops (${Number(poolFund) / 1e7} EXPO)`);

    // 3. Fund staking reward pool
    await callContract(
        STAKING_CONTRACT_ID,
        'fund_rewards',
        [StellarSdk.nativeToScVal(stakingFund, { type: 'i128' })],
        `Fund staking reward pool`
    );

    // 4. Fund XLM pool reward pool
    await callContract(
        POOL_CONTRACT_ID,
        'fund_rewards',
        [StellarSdk.nativeToScVal(poolFund, { type: 'i128' })],
        `Fund XLM pool reward pool`
    );

    // 5. Verify new reward pools
    const stakingPool = await simulateBalance(TOKEN_CONTRACT_ID, STAKING_CONTRACT_ID);
    const poolPool    = await simulateBalance(TOKEN_CONTRACT_ID, POOL_CONTRACT_ID);

    console.log('\n======================================================');
    console.log('✅ REWARD POOLS FUNDED!');
    console.log(`Staking contract EXPO balance: ${Number(stakingPool) / 1e7} EXPO`);
    console.log(`Pool contract EXPO balance:    ${Number(poolPool) / 1e7} EXPO`);
    console.log('Users can now stake and deposit without errors.');
    console.log('======================================================\n');
}

run().catch(e => {
    console.error('\n❌ Fatal error:', e.message ?? e);
    process.exit(1);
});
