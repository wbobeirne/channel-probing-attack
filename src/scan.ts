import {
  MAX_PAYMENT_SIZE,
  initNode,
  makeRandomHash,
} from './util';

// myChannelId is the channel ID we have to connect us to the scanChannelId
// scanChannelId is the channel ID of the channel we want to know the balance of
export async function scanChannel(
  myChannelId: string,
  scanChannelId: string,
) {
  // Grab some initial data and make sure everything came back OK
  const node = await initNode();
  const myChannels = (await node.listChannels()).channels;
  const myChannel = myChannels.find(c => c.chanId === myChannelId);
  const channel = await node.getChanInfo({ chanId: scanChannelId });

  if (!myChannel) {
    throw new Error(`You have no channel with ID '${myChannelId}'`);
  }
  if (!channel) {
    throw new Error(`Unknown channel with ID '${scanChannelId}'`);
  }

  // Determine the max we can scan, and who's the "receiver"
  const max = Math.min(
    parseInt(channel.capacity, 10),
    parseInt(myChannel.localBalance, 10),
    MAX_PAYMENT_SIZE,
  );
  const destPubkey = myChannel.remotePubkey === channel.node1Pub
    ? channel.node2Pub
    : channel.node1Pub;

  // Loop send bogus payments until we find the balance
  let low = 0;
  let high = max;

  console.log(`Beginning scan of channel ${scanChannelId}, max scannable ${max} satoshis...`);
  while (high - low > 1) {
    const testAmount = Math.ceil((low + high) / 2);
    console.log(`Probing with a ${testAmount} sat payment...`);

    const res = await node.sendPaymentSync({
      destString: destPubkey,
      amt: testAmount.toString(),
      paymentHashString: makeRandomHash(),
      outgoingChanId: myChannel.chanId,
      finalCltvDelta: 144,
    });
    const err = res.paymentError;

    // Depending on the error, raise or lower the amount. The route note having
    // enough capacity comes in many shapes and sizes of error, so we have to
    // check for a few types here.
    if (err.includes('UnknownPaymentHash')) {
      console.log('Amount was too low, raising lower bound...');
      low = testAmount;
    } else if (
      err.includes('unable to find a path') ||
      err.includes('insufficient') ||
      err.includes('TemporaryChannelFailure')
    ) {
      console.log('Amount was too high, lowering upper bound...');
      high = testAmount;
    } else {
      throw new Error(`Unknown error occured when trying to scan: ${err}`);
    }
  }

  console.log(`Balance for channel ${scanChannelId} is between ${low} and ${high} satoshis!`);
  if (high === max) {
    console.log(`NOTE: The balance exceeds the height we were able to scan, so it may be larger than ${max} satoshis`);
  }
}

