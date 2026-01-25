import * as StellarSdk from '@stellar/stellar-sdk';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const CONTRACT_ID = process.env.SOROBAN_CONTRACT_ID!;
const PLATFORM_SECRET = process.env.PLATFORM_SECRET_KEY!;

// Platform wallet for merchant settlements (receives XLM, settles INR via UPI)
export const PLATFORM_MERCHANT_WALLET = 'GAGN723GV7ASYX3VTXXEEJA3BDYI3HDWCXCDBYMJFTIK7TL5PJPV77LZ';

export const server = new StellarSdk.rpc.Server(RPC_URL);
export const horizonServer = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

export async function createStellarAccount() {
  const keypair = StellarSdk.Keypair.random();
  const publicKey = keypair.publicKey();
  const secretKey = keypair.secret();

  try {
    await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
  } catch (error) {
    console.error('Friendbot funding failed:', error);
  }

  return { publicKey, secretKey };
}

export async function registerUniversalId(username: string, address: string) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return 'tx_' + Math.random().toString(36).substring(7);
}

export async function resolveUniversalId(username: string): Promise<string | null> {
  return null;
}

export interface PaymentOptions {
  memo?: string;
  memoType?: 'text' | 'id' | 'hash';
}

export async function sendPayment(
  fromSecret: string, 
  toAddress: string, 
  amount: string,
  options?: PaymentOptions
) {
  const sourceKeypair = StellarSdk.Keypair.fromSecret(fromSecret);
  const sourceAccount = await horizonServer.loadAccount(sourceKeypair.publicKey());

  const txBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: toAddress,
        asset: StellarSdk.Asset.native(),
        amount: amount,
      })
    )
    .setTimeout(30);

  // Add memo if provided (shows purpose on Stellar Explorer)
  if (options?.memo) {
    const memoText = options.memo.substring(0, 28); // Stellar memo max 28 chars
    txBuilder.addMemo(StellarSdk.Memo.text(memoText));
  }

  const transaction = txBuilder.build();
  transaction.sign(sourceKeypair);
  
  const result = await horizonServer.submitTransaction(transaction);
  return result.hash;
}

export async function sendMerchantPayment(
  fromSecret: string,
  amount: string,
  merchantName: string
) {
  const memo = `PAY:${merchantName.substring(0, 20)}`;
  return sendPayment(fromSecret, PLATFORM_MERCHANT_WALLET, amount, { memo });
}

export async function getBalances(address: string) {
  try {
    const account = await horizonServer.loadAccount(address);
    return account.balances.map(b => ({
      asset: b.asset_type === 'native' ? 'XLM' : b.asset_code,
      balance: b.balance,
    }));
  } catch (error) {
    console.error('Balance fetch failed:', error);
    return [];
  }
}
