import * as StellarSdk from '@stellar/stellar-sdk';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const SOROBAN_RPC_URL = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.STELLAR_NETWORK_PASSPHRASE || StellarSdk.Networks.TESTNET;
const TOKEN_CONTRACT_ID = process.env.TOKEN_CONTRACT_ID || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

const server = new StellarSdk.rpc.Server(SOROBAN_RPC_URL);

async function deployContract(wasmPath: string, keypair: StellarSdk.Keypair): Promise<string> {
    console.log(`\nDeploying from ${wasmPath}...`);
    const wasm = fs.readFileSync(wasmPath);
    let account = await server.getAccount(keypair.publicKey());

    // 1. Upload Wasm
    console.log('Uploading WASM...');
    let tx = new StellarSdk.TransactionBuilder(account, {
        fee: '1000000',
        networkPassphrase: NETWORK_PASSPHRASE,
    })
    .addOperation(StellarSdk.Operation.uploadContractWasm({ wasm }))
    .setTimeout(300)
    .build();

    let prepared = await server.prepareTransaction(tx);
    prepared.sign(keypair);
    let sendRes = await server.sendTransaction(prepared);

    if (sendRes.status === 'ERROR') {
        throw new Error(`Upload failed: ${sendRes.errorResult?.toXDR('base64')}`);
    }

    let getRes = await server.getTransaction(sendRes.hash);
    while (getRes.status === 'NOT_FOUND') {
        await new Promise(r => setTimeout(r, 2000));
        getRes = await server.getTransaction(sendRes.hash);
    }

    if (getRes.status !== 'SUCCESS') {
        throw new Error(`Upload transaction failed: ${getRes.status}`);
    }

    let wasmId;
    if (getRes.returnValue) {
        wasmId = getRes.returnValue.value().toString('hex');
    } else {
        throw new Error('Failed to retrieve wasmId');
    }
    console.log(`Wasm ID: ${wasmId}`);

    // 2. Create Contract
    console.log('Creating contract instance...');
    account = await server.getAccount(keypair.publicKey());
    
    // In @stellar/stellar-sdk 14.x
    const salt = crypto.randomBytes(32);
    
    tx = new StellarSdk.TransactionBuilder(account, {
        fee: '1000000',
        networkPassphrase: NETWORK_PASSPHRASE,
    })
    .addOperation(StellarSdk.Operation.createCustomContract({
        address: new StellarSdk.Address(keypair.publicKey()),
        wasmHash: Buffer.from(wasmId, 'hex'),
        salt: salt
    }))
    .setTimeout(300)
    .build();

    prepared = await server.prepareTransaction(tx);
    prepared.sign(keypair);
    sendRes = await server.sendTransaction(prepared);

    if (sendRes.status === 'ERROR') {
        throw new Error(`Create failed: ${sendRes.errorResult?.toXDR('base64')}`);
    }

    getRes = await server.getTransaction(sendRes.hash);
    while (getRes.status === 'NOT_FOUND') {
        await new Promise(r => setTimeout(r, 2000));
        getRes = await server.getTransaction(sendRes.hash);
    }

    if (getRes.status !== 'SUCCESS') {
        throw new Error(`Create transaction failed: ${getRes.status}`);
    }

    // Parse the new contract ID from the result
    const contractIdStr = StellarSdk.Address.fromScAddress(getRes.returnValue.address()).toString();
    console.log(`Contract Deployed: ${contractIdStr}`);
    
    return contractIdStr;
}

async function initializeContract(contractId: string, method: string, args: StellarSdk.xdr.ScVal[], keypair: StellarSdk.Keypair) {
    console.log(`Initializing contract ${contractId}...`);
    const contract = new StellarSdk.Contract(contractId);
    let account = await server.getAccount(keypair.publicKey());
    
    let tx = new StellarSdk.TransactionBuilder(account, {
        fee: '100000',
        networkPassphrase: NETWORK_PASSPHRASE,
    })
    .addOperation(contract.call(method, ...args))
    .setTimeout(300)
    .build();

    let prepared = await server.prepareTransaction(tx);
    prepared.sign(keypair);
    let sendRes = await server.sendTransaction(prepared);

    if (sendRes.status === 'ERROR') {
        throw new Error(`Init failed: ${sendRes.errorResult?.toXDR('base64')}`);
    }

    let getRes = await server.getTransaction(sendRes.hash);
    while (getRes.status === 'NOT_FOUND') {
        await new Promise(r => setTimeout(r, 2000));
        getRes = await server.getTransaction(sendRes.hash);
    }

    if (getRes.status !== 'SUCCESS') {
        throw new Error(`Init transaction failed: ${getRes.status}`);
    }
    console.log('Contract initialized successfully.');
}

async function run() {
    console.log('Generating deployer account...');
    const deployer = StellarSdk.Keypair.random();
    
    console.log(`Deployer Public Key: ${deployer.publicKey()}`);
    console.log(`Deployer Secret: ${deployer.secret()}`);
    console.log('Funding from Friendbot...');
    
    await fetch(`https://friendbot.stellar.org?addr=${deployer.publicKey()}`);
    
    try {
        // Staking
        const stakingContractId = await deployContract(
            path.join(process.cwd(), 'contracts/staking/target/wasm32-unknown-unknown/release/soroban_staking_contract.wasm'),
            deployer
        );
        
        await initializeContract(
            stakingContractId,
            'initialize',
            [
                new StellarSdk.Address(deployer.publicKey()).toScVal(), // admin
                new StellarSdk.Address(TOKEN_CONTRACT_ID).toScVal()     // token
            ],
            deployer
        );
        
        // Pool
        const poolContractId = await deployContract(
            path.join(process.cwd(), 'contracts/pool/target/wasm32-unknown-unknown/release/soroban_pool_contract.wasm'),
            deployer
        );
        
        await initializeContract(
            poolContractId,
            'initialize',
            [
                new StellarSdk.Address(deployer.publicKey()).toScVal(), // admin
                new StellarSdk.Address(TOKEN_CONTRACT_ID).toScVal()     // token
            ],
            deployer
        );
        
        console.log('\n======================================================');
        console.log('DEPLOYMENT COMPLETE!');
        console.log('Please copy these values and paste them into the chat:');
        console.log(`STAKING_CONTRACT_ID=${stakingContractId}`);
        console.log(`POOL_CONTRACT_ID=${poolContractId}`);
        console.log(`STELLAR_ADMIN_ADDRESS=${deployer.publicKey()}`);
        console.log(`STELLAR_ADMIN_SECRET=${deployer.secret()}`);
        console.log('======================================================\n');
        
    } catch (e) {
        console.error('Deployment error:', e);
    }
}

run();
