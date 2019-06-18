import { scanNode } from './scan';

const pubkey = process.argv[2];
if (pubkey) {
  scanNode(pubkey);
} else {
  console.error('Requires pubkey as first and only argument');
  process.exit(1);
}
