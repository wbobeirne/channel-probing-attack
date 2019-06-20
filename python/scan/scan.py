import math
import rpc_pb2 as ln
from scan.util import MAX_PAYMENT_SIZE, init_node, make_random_hash

# my_channel_id is the channel ID we have to connect us to the scanChannelId
# scan_channel_id is the channel ID of the channel we want to know the balance of
def scan_channel(my_channel_id: int, scan_channel_id: int):
    # Grab some initial data and make sure everything came back OK
    node = init_node()
    my_channels = node.ListChannels(ln.ListChannelsRequest()).channels
    my_channel = [c for c in my_channels if c.chan_id == my_channel_id][0]
    channel = node.GetChanInfo(ln.ChanInfoRequest(chan_id=scan_channel_id))

    if not my_channel:
        raise Exception(f'You have no channel with ID "{my_channel_id}"')
    if not channel:
        raise Exception(f'Unknown channel with ID "{scan_channel_id}"')

    # Determine the max we can scan, and who's the "receiver"
    maximum = min(
        int(channel.capacity),
        int(my_channel.local_balance),
        MAX_PAYMENT_SIZE,
    )
    dest_pubkey = channel.node2_pub if my_channel.remote_pubkey == channel.node1_pub else channel.node2_pub

    # Loop send bogus payments until we find the balance
    low = 0
    high = maximum

    print(f'Beginning scan of channel {scan_channel_id}, max scannable {maximum} satoshis...')
    while high - low > 1:
        test_amount = math.ceil((low + high) / 2)
        print(f'Probing with a {test_amount} sat payment...')

        res = node.SendPaymentSync(ln.SendRequest(
            dest_string=dest_pubkey,
            amt=test_amount,
            payment_hash_string=make_random_hash(),
            outgoing_chan_id=my_channel.chan_id,
            final_cltv_delta=144,
        ))
        err = res.payment_error

        # Depending on the error, raise or lower the amount. The route note having
        # enough capacity comes in many shapes and sizes of error, so we have to
        # check for a few types here.
        if 'UnknownPaymentHash' in err:
            print('Amount was too low, raising lower bound...')
            low = test_amount
        elif 'unable to find a path' in err or \
                'insufficient' in err or \
                'TemporaryChannelFailure' in err:
            print('Amount was too high, lowering upper bound...')
            high = test_amount
        else:
            raise Exception(f'Unknown error occured when trying to scan: {err}')

    print(f'Balance for channel ${scan_channel_id} is between {low} and {high} satoshis!')
    if high == maximum:
        print(f'NOTE: The balance exceeds the height we were able to scan, so it may be larger than {maximum} satoshis')

