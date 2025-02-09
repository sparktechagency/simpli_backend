import paypal from 'paypal-rest-sdk';
import dotenv from 'dotenv';

dotenv.config();

interface PayPalConfig {
  mode: 'sandbox' | 'live';
  client_id: string;
  client_secret: string;
}

const paypalConfig: PayPalConfig = {
  mode: (process.env.PAYPAL_MODE as 'sandbox' | 'live') || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID || '',
  client_secret: process.env.PAYPAL_CLIENT_SECRET || '',
};

if (!paypalConfig.client_id || !paypalConfig.client_secret) {
  throw new Error(
    '🚨 PayPal Client ID or Secret is missing from environment variables.',
  );
}

paypal.configure(paypalConfig);

export default paypal;
