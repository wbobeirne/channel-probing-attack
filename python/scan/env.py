import os
from dotenv import load_dotenv

load_dotenv()

DEBUG = os.getenv('DEBUG')
LND_GRPC_URL = os.getenv('LND_GRPC_URL')
LND_MACAROON = os.getenv('LND_MACAROON')
LND_TLS_CERT = os.getenv('LND_TLS_CERT')
