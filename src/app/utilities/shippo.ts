import { Shippo } from 'shippo';
import config from '../config';
const shippo = new Shippo({ apiKeyHeader: config.shippo.api_key as string });

export default shippo;
