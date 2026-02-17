import { Shippo } from 'shippo';
import config from '../config';

console.log('Shippo API Key:', config.shippo.api_key);

const shippo = new Shippo({ apiKeyHeader: config.shippo.api_key as string });

export default shippo;
