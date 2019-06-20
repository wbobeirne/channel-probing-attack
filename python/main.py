import sys
import os
from scan.scan import scan_channel

os.environ["GRPC_SSL_CIPHER_SUITES"] = 'HIGH+ECDSA'

if len(sys.argv) >= 3:
  my_channel_id = int(sys.argv[1])
  scan_channel_id = int(sys.argv[2])
  scan_channel(my_channel_id, scan_channel_id)
else:
  print('Missing arguments, should be "main.py [mychannelid] [scanchannelid]"')
  sys.exit(1)