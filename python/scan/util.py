import rpc_pb2_grpc as lnrpc
import grpc
import random
from base64 import b64decode
from scan.env import DEBUG, LND_GRPC_URL, LND_MACAROON, LND_TLS_CERT

MAX_CHANNEL_SIZE = 16777215
MAX_PAYMENT_SIZE = 4294967

# Creates an LND RPC interface
def init_node():
    def metadata_callback(context, callback):
        callback([('macaroon', b64decode(LND_MACAROON).hex())], None)

    # build ssl credentials using the cert the same as before
    cert_creds = grpc.ssl_channel_credentials(b64decode(LND_TLS_CERT))

    # now build meta data credentials
    auth_creds = grpc.metadata_call_credentials(metadata_callback)

    # combine the cert credentials and the macaroon auth credentials
    # such that every call is properly encrypted and authenticated
    combined_creds = grpc.composite_channel_credentials(cert_creds, auth_creds)

    # finally pass in the combined credentials when creating a channel
    channel = grpc.secure_channel(LND_GRPC_URL, combined_creds)
    return lnrpc.LightningStub(channel)

# Generates a random hash that can be used for a fake payment hash
def make_random_hash():
    return hex(random.getrandbits(256)).rstrip("L").lstrip("0x")

# Logs only if we have a flag set
def debug_log(log: str):
    if DEBUG:
        print(f"[DEBUG] {log}")
