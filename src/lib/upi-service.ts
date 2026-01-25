export interface UPIDetails {
  pa: string;
  pn: string;
  mc?: string;
  tid?: string;
  tr?: string;
  tn?: string;
  am?: string;
  cu?: string;
  mode?: string;
}

export interface ParsedUPIQR {
  merchantName: string;
  merchantUpiId: string;
  amount?: number;
  transactionNote?: string;
  merchantCategory?: string;
  isValid: boolean;
  rawData?: string;
}

export function parseUPIQRCode(qrData: string): ParsedUPIQR {
  const result: ParsedUPIQR = {
    merchantName: '',
    merchantUpiId: '',
    isValid: false,
    rawData: qrData,
  };

  try {
    const trimmedData = qrData.trim();
    
    // Handle direct UPI ID (contains @)
    if (!trimmedData.toLowerCase().startsWith('upi://') && trimmedData.includes('@')) {
      result.merchantUpiId = trimmedData;
      result.merchantName = trimmedData.split('@')[0];
      result.isValid = true;
      return result;
    }

    // Handle UPI URL format
    if (trimmedData.toLowerCase().startsWith('upi://')) {
      // Parse UPI URL - handle both upi://pay? and upi://? formats
      const queryStart = trimmedData.indexOf('?');
      if (queryStart === -1) {
        return result;
      }
      
      const queryString = trimmedData.substring(queryStart + 1);
      const params = new URLSearchParams(queryString);

      result.merchantUpiId = params.get('pa') || '';
      result.merchantName = decodeURIComponent(params.get('pn') || '') || params.get('pa')?.split('@')[0] || 'Merchant';
      result.merchantCategory = params.get('mc') || undefined;
      
      const amount = params.get('am');
      if (amount) {
        result.amount = parseFloat(amount);
      }
      
      result.transactionNote = decodeURIComponent(params.get('tn') || '') || undefined;
      result.isValid = !!result.merchantUpiId && result.merchantUpiId.includes('@');
      
      return result;
    }

    // Try to extract UPI ID from any text containing @
    const upiMatch = trimmedData.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9]+)/);
    if (upiMatch) {
      result.merchantUpiId = upiMatch[1];
      result.merchantName = upiMatch[1].split('@')[0];
      result.isValid = true;
      return result;
    }

  } catch (error) {
    console.error('UPI QR parsing error:', error);
  }

  return result;
}

export async function simulateUPISettlement(
  merchantUpiId: string,
  merchantName: string,
  amountINR: number
): Promise<{
  success: boolean;
  utrNumber: string;
  settlementTime: string;
  message: string;
}> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const utrNumber = `UTR${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  return {
    success: true,
    utrNumber,
    settlementTime: new Date().toISOString(),
    message: `₹${amountINR.toLocaleString('en-IN')} credited to ${merchantName} (${merchantUpiId}) via partner settlement`,
  };
}

export function generateUPIDeepLink(params: {
  pa: string;
  pn: string;
  am?: number;
  tn?: string;
  cu?: string;
}): string {
  const upiUrl = new URL('upi://pay');
  upiUrl.searchParams.set('pa', params.pa);
  upiUrl.searchParams.set('pn', params.pn);
  if (params.am) upiUrl.searchParams.set('am', params.am.toString());
  if (params.tn) upiUrl.searchParams.set('tn', params.tn);
  upiUrl.searchParams.set('cu', params.cu || 'INR');
  
  return upiUrl.toString();
}
