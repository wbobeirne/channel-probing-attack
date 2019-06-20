import createLnRpc from '@radar/lnrpc';
import crypto from 'crypto';
import env from './env';

// Constants
export const MAX_CHANNEL_SIZE = 16777215;
export const MAX_PAYMENT_SIZE = 4294967;

// Creates a node RPC interface client
export function initNode() {
  return createLnRpc({
    server: env.LND_GRPC_URL,
    cert: new Buffer(env.LND_TLS_CERT, 'base64').toString('ascii'),
    macaroon: new Buffer(env.LND_MACAROON, 'base64').toString('hex'),
  });
}

// Generates a random hash that can be used for a fake payment hash
export function makeRandomHash() {
  return crypto.randomBytes(32).toString('hex');
}

// Logs only if we have a flag set
export function debugLog(...args: any) {
  if (process.env.DEBUG) {
    console.debug('[DEBUG]', ...args);
  }
}