import * as StellarSdk from '@stellar/stellar-sdk';

const { Server } = StellarSdk.rpc;

const SOROBAN_RPC_URL    = process.env.SOROBAN_RPC_URL    || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.STELLAR_NETWORK_PASSPHRASE || StellarSdk.Networks.TESTNET;
const CONTRACT_ID        = process.env.ESCROW_CONTRACT_ID || 'CAGMD6PBDSOSB2NDOE5ZGYCWH74EOBJFHM627WTGLZZF66DBRUFWYSPT';
const TOKEN_CONTRACT_ID  = process.env.TOKEN_CONTRACT_ID  || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
// Arbiter is the platform admin wallet
const ARBITER_ADDRESS    = process.env.STELLAR_ADMIN_ADDRESS || '';

const server = new Server(SOROBAN_RPC_URL);

export type EscrowStatus = 'Funded' | 'Delivered' | 'Released' | 'Disputed' | 'Refunded';

export interface EscrowData {
  escrow_id:   string;
  client:      string;
  freelancer:  string;
  token:       string;
  amount:      bigint;
  funded:      boolean;
  delivered:   boolean;
  released:    boolean;
  disputed:    boolean;
  cancelled:   boolean;
  arbiter:     string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a numeric DB escrow_id to the on-chain String key format.
 * The contract stores escrow_id as a Soroban String (e.g. "38").
 */
function toScStr(env_str: string): StellarSdk.xdr.ScVal {
  return StellarSdk.xdr.ScVal.scvString(Buffer.from(env_str, 'utf8'));
}

async function buildAndPrepareTransaction(
  sourcePublicKey: string,
  method: string,
  args: StellarSdk.xdr.ScVal[]
): Promise<StellarSdk.Transaction> {
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const account  = await server.getAccount(sourcePublicKey);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: '1000000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .setTimeout(300)
    .addOperation(contract.call(method, ...args))
    .build();

  const prepared = await server.prepareTransaction(tx);
  return prepared as StellarSdk.Transaction;
}

async function signAndSubmitTransaction(
  transaction: StellarSdk.Transaction,
  keypair: StellarSdk.Keypair
): Promise<{ hash: string; result?: StellarSdk.xdr.ScVal }> {
  transaction.sign(keypair);

  const sendRes = await server.sendTransaction(transaction);

  if (sendRes.status === 'ERROR') {
    throw new Error(`Transaction failed: ${sendRes.errorResult?.toXDR('base64') || 'Unknown error'}`);
  }

  let getRes = await server.getTransaction(sendRes.hash);
  while (getRes.status === 'NOT_FOUND') {
    await new Promise(r => setTimeout(r, 1000));
    getRes = await server.getTransaction(sendRes.hash);
  }

  if (getRes.status !== 'SUCCESS') {
    throw new Error(`Transaction failed with status: ${getRes.status}`);
  }

  return { hash: sendRes.hash, result: getRes.returnValue };
}

// ── Contract Functions (matching deployed ABI exactly) ────────────────────────

/**
 * create(escrow_id: String, client: Address, freelancer: Address, amount: i128, token_id: Address, arbiter: Address)
 */
export async function createEscrow(
  clientSecret:      string,
  clientAddress:     string,
  freelancerAddress: string,
  amount:            bigint,
  escrowIdStr:       string,   // pass the DB row ID or a unique string
): Promise<{ txHash: string; escrowId: string }> {
  if (!ARBITER_ADDRESS) throw new Error('STELLAR_ADMIN_ADDRESS not set in env — required as arbiter');

  const keypair = StellarSdk.Keypair.fromSecret(clientSecret);

  const args = [
    toScStr(escrowIdStr),
    new StellarSdk.Address(clientAddress).toScVal(),
    new StellarSdk.Address(freelancerAddress).toScVal(),
    StellarSdk.nativeToScVal(amount, { type: 'i128' }),
    new StellarSdk.Address(TOKEN_CONTRACT_ID).toScVal(),
    new StellarSdk.Address(ARBITER_ADDRESS).toScVal(),
  ];

  const tx = await buildAndPrepareTransaction(clientAddress, 'create', args);
  const { hash } = await signAndSubmitTransaction(tx, keypair);

  return { txHash: hash, escrowId: escrowIdStr };
}

/**
 * fund(escrow_id: String)  — called by client after create
 */
export async function fundEscrow(
  escrowIdStr:  string,
  clientSecret: string,
): Promise<string> {
  const keypair       = StellarSdk.Keypair.fromSecret(clientSecret);
  const clientAddress = keypair.publicKey();

  const tx = await buildAndPrepareTransaction(clientAddress, 'fund', [toScStr(escrowIdStr)]);
  const { hash } = await signAndSubmitTransaction(tx, keypair);
  return hash;
}

/**
 * deliver(escrow_id: String)  — called by freelancer
 */
export async function deliverEscrow(
  escrowIdStr:    string,
  sellerSecret:   string,
): Promise<string> {
  const keypair       = StellarSdk.Keypair.fromSecret(sellerSecret);
  const sellerAddress = keypair.publicKey();

  const tx = await buildAndPrepareTransaction(sellerAddress, 'deliver', [toScStr(escrowIdStr)]);
  const { hash } = await signAndSubmitTransaction(tx, keypair);
  return hash;
}

/**
 * release_funds(escrow_id: String)  — called by client to pay freelancer
 */
export async function releaseEscrow(
  escrowIdStr:  string,
  buyerSecret:  string,
): Promise<string> {
  const keypair      = StellarSdk.Keypair.fromSecret(buyerSecret);
  const buyerAddress = keypair.publicKey();

  const tx = await buildAndPrepareTransaction(buyerAddress, 'release_funds', [toScStr(escrowIdStr)]);
  const { hash } = await signAndSubmitTransaction(tx, keypair);
  return hash;
}

/**
 * dispute(escrow_id: String, caller: Address)  — client or freelancer
 */
export async function disputeEscrow(
  escrowIdStr:   string,
  callerSecret:  string,
): Promise<string> {
  const keypair       = StellarSdk.Keypair.fromSecret(callerSecret);
  const callerAddress = keypair.publicKey();

  const args = [
    toScStr(escrowIdStr),
    new StellarSdk.Address(callerAddress).toScVal(),
  ];

  const tx = await buildAndPrepareTransaction(callerAddress, 'dispute', args);
  const { hash } = await signAndSubmitTransaction(tx, keypair);
  return hash;
}

/**
 * resolve(escrow_id: String, pay_freelancer: bool)  — arbiter only
 */
export async function resolveEscrow(
  escrowIdStr:    string,
  arbiterSecret:  string,
  payFreelancer:  boolean,
): Promise<string> {
  const keypair        = StellarSdk.Keypair.fromSecret(arbiterSecret);
  const arbiterAddress = keypair.publicKey();

  const args = [
    toScStr(escrowIdStr),
    StellarSdk.nativeToScVal(payFreelancer, { type: 'bool' }),
  ];

  const tx = await buildAndPrepareTransaction(arbiterAddress, 'resolve', args);
  const { hash } = await signAndSubmitTransaction(tx, keypair);
  return hash;
}

/**
 * cancel_escrow(escrow_id: String)  — client only, before release
 */
export async function refundEscrow(
  escrowIdStr:  string,
  buyerSecret:  string,
): Promise<string> {
  const keypair      = StellarSdk.Keypair.fromSecret(buyerSecret);
  const buyerAddress = keypair.publicKey();

  const tx = await buildAndPrepareTransaction(buyerAddress, 'cancel_escrow', [toScStr(escrowIdStr)]);
  const { hash } = await signAndSubmitTransaction(tx, keypair);
  return hash;
}

/**
 * get_escrow(escrow_id: String)  — read-only simulation
 */
export async function getEscrow(escrowIdStr: string): Promise<EscrowData | null> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    // Use a well-known funded account for simulation
    const account = await server.getAccount(ARBITER_ADDRESS || 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF').catch(() => null);
    if (!account) return null;

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .setTimeout(30)
      .addOperation(contract.call('get_escrow', toScStr(escrowIdStr)))
      .build();

    const simRes = await server.simulateTransaction(tx);

    if ('result' in simRes && simRes.result) {
      const raw = StellarSdk.scValToNative(simRes.result.retval);
      return {
        escrow_id:  raw.escrow_id,
        client:     raw.client,
        freelancer: raw.freelancer,
        token:      raw.token,
        amount:     BigInt(raw.amount),
        funded:     raw.funded,
        delivered:  raw.delivered,
        released:   raw.released,
        disputed:   raw.disputed,
        cancelled:  raw.cancelled,
        arbiter:    raw.arbiter,
      };
    }
    return null;
  } catch (e) {
    console.error('Get escrow error:', e);
    return null;
  }
}

export async function getCurrentLedger(): Promise<number> {
  try {
    const health = await server.getHealth();
    return health.latestLedger || 0;
  } catch {
    return 0;
  }
}

export function calculateDeadlineLedger(daysFromNow: number): bigint {
  const ledgersPerDay = 17280;
  return BigInt(Math.floor(daysFromNow * ledgersPerDay));
}
