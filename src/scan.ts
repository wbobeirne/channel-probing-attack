import {
  MAX_PAYMENT_SIZE,
  initNode,
  makeRandomHash,
} from './util';
import { ChannelEdge } from '@radar/lnrpc';

function debugLog(...args: any) {
  if (process.env.DEBUG) {
    console.debug(...args);
  }
}

export async function scanNode(pubKey: string) {
  // Initialize some data we'll need for the scan
  const node = await initNode();
  const myPubKey = (await node.getInfo()).identityPubkey;
  const nodeInfo = await node.getNodeInfo({ pubKey });

  // Throw if the node we're trying to scan has no channels
  if (!nodeInfo.channels.length) {
    throw new Error(`Node ${pubKey} has no channels!`);
  }

  // Pluck our channel out from the list of channels
  let ourChannel: ChannelEdge;
  const channels = nodeInfo.channels.filter(c => {
    if (c.node1Pub === myPubKey || c.node2Pub === myPubKey) {
      ourChannel = c;
      return false;
    }
    return true;
  });

  // Get our channel's local balance
  const myChannels = (await node.listChannels()).channels;
  let localBalance = '0';
  myChannels.forEach(c => {
    if (ourChannel.channelId == c.chanId) {
      localBalance = c.localBalance;
    }
  })

  // Throw if we don't have a channel, or there are no other channels
  if (!ourChannel) {
    throw new Error(`Node ${pubKey} has no channel with our node!`);
  }
  if (!channels.length) {
    throw new Error(`Node ${pubKey} has no other channels!`);
  }

  // Create a function to scan an individual channel
  const getChannelBalance = async (channel: ChannelEdge) => {
    const startTime = Date.now();
    const theirPubKey = pubKey === channel.node1Pub ? channel.node2Pub : channel.node1Pub;

    // Set upper and lower bounds for the scan. Upper is the smallest of
    // 1) their channel capacity, 2) our channel's local balance, 3) the max payment size
    const max = Math.min(
      parseInt(channel.capacity, 10),
      parseInt(localBalance, 10),
      MAX_PAYMENT_SIZE,
    );
    let low = 0;
    let high = max;
  
    while (high - low > 1) {
      const testAmount = Math.ceil((low + high) / 2);
      debugLog(`[${theirPubKey}] Scanning with a ${testAmount} sat payment`);
      const res = await node.sendPaymentSync({
        destString: theirPubKey,
        amt: testAmount.toString(),
        paymentHashString: makeRandomHash(),
        outgoingChanId: ourChannel.channelId,
        finalCltvDelta: 144,
      });
      const err = res.paymentError;
  
      if (!err) {
        return {
          pubkey: theirPubKey,
          error: 'They accepted the payment. Uh oh.',
          time: Date.now() - startTime,
        };
      }
  
      debugLog(`[${theirPubKey}] ${testAmount} sat payment returned error ${res.paymentError}`);

      if (err.includes('UnknownPaymentHash')) {
        low = testAmount;
      } else if (
        err.includes('unable to find a path') ||
        err.includes('insufficient') ||
        err.includes('TemporaryChannelFailure')
      ) {
        high = testAmount;
      } else {
        return {
          pubkey: theirPubKey,
          error: `Unknown error occured in sendPaymentSync - ${res.paymentError}`,
          time: Date.now() - startTime,
        };
      }
    }
  
    return {
      pubkey: theirPubKey,
      balance: low,
      time: Date.now() - startTime,
      max: max,
    };
  }
  
  // Run the scan function on each channel, update stdout on each completion
  let numScanned = 0;
  process.stdout.write(`Scanning ${channels.length} channels, ${numScanned}/${channels.length} complete...`);
  const balances = await Promise.all(
    channels.map(async c => {
      const res = await getChannelBalance(c);
      numScanned++;
      process.stdout.write(`\rScanning ${channels.length} channels, ${numScanned}/${channels.length} complete...`);
      return res;
    })
  );

  console.log('Scan complete! Results:')
  balances.forEach(b => {
    if (b.error) {
      // console.log(`[${b.pubkey}] Error: ${b.error.split(':')[0]}`);
      console.log(`[${b.pubkey}] Error: ${b.error}`);
    } else if (b.balance === b.max) {
      console.log(`[${b.pubkey}] Balance: ${b.balance}+ sats, balance exceeds maximum scannable amount (${b.time}ms)`)
    } else {
      console.log(`[${b.pubkey}] Balance: ${b.balance} sats (${b.time}ms)`);
    }
  });
}
