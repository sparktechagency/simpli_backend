import axios from 'axios';
import config from '../config';

const getPayPalAccessToken = async () => {
  const response = await axios.post(
    `${config.paypal.base_url}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      auth: {
        username: config.paypal.client_id as string,
        password: config.paypal.client_secret as string,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );
  return response.data.access_token;
};

export default getPayPalAccessToken;
