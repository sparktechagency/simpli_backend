/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Shippo } from 'shippo';
// import config from '../config';

// console.log('Shippo API Key:', config.shippo.api_key);

// if (!config.shippo.api_key) {
//   throw new Error('Shippo API key is not defined in the configuration.');
// }
// const shippo = new Shippo({ apiKeyHeader: config.shippo.api_key as string });

// export default shippo;

import { Shippo } from 'shippo';
import config from '../config';

// 1. Validate the key exists
const key = config.shippo.api_key;
if (!key) {
  throw new Error('Shippo API Key is missing!');
}

// 2. We use 'apiKey' because v2.15.0 requires it at runtime.
// 3. We use 'as any' to stop the TypeScript compiler from blocking the build.
const shippo = new Shippo({
  apiKey: key,
} as any);

export default shippo;
