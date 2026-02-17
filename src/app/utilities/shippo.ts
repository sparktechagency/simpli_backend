import { Shippo } from 'shippo';
import config from '../config';

console.log('Shippo API Key:', config.shippo.api_key);

if (!config.shippo.api_key) {
  throw new Error('Shippo API key is not defined in the configuration.');
}
const shippo = new Shippo({ apiKeyHeader: config.shippo.api_key as string });

export default shippo;
