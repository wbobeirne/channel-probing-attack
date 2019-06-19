import { scanChannel } from './scan';

const myChannelId = process.argv[2];
const scanChannelId = process.argv[3];

if (myChannelId && scanChannelId) {
  scanChannel(myChannelId, scanChannelId);
} else {
  console.error('Missing arguments, should be "scan-channel [mychannelid] [scanchannelid]"');
}