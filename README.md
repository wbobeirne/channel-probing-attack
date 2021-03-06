# Channel Probing Attack

This repo has a quick minimal implementation of a channel probing attack. Given a node M that you control, you can determine the balance between any two nodes A and B that you have a channel open with A.

For context on channel probing attacks, please read https://eprint.iacr.org/2019/328.pdf or [read the slides associated with this project](https://docs.google.com/presentation/d/1_Xmga_mHYqO0jOmXXA30nd38UI12T5okbJOnf8YU6Uw/edit?usp=sharing).

## Setup

To run this, you'll need _either_ NodeJS 8+ _or_ Python 3+ and your own LND node.

### Environment variables

We need to setup the connection to our node. Copy the `.env.example` file to `.env`:

```sh
cp .env.example .env
```

And fill it out with the necessary information. You most commonly can find the TLS cert in `~/.lnd` and the macaroons in `~/.lnd/data/chain/bitcoin/mainnet/admin.macaroon`. You can just run `base64` on them to get the correct values.

### Node / TypeScript

Go into the `node` directory and install the dependencies:

```sh
cd node

npm install
# OR #
yarn
```

### Python

Setup venv and install the dependencies

```sh
cd python
virtualenv -p python3 venv
source venv/bin/activate
pip install -r requirements.txt
```


## Running

Our basic command here can be run with either Node or Python
```sh
# Node
npm run scan-channel [my-channel-id] [scan-channel-id]

# Python
python main.py [my-channel-id] [scan-channel-id]
```

You can get the first argument by running `lncli listchannels` and choosing one of your channels. You can then get the second argument by running `lncli getnodeinfo [pubkey]` using your channel counterparty's pubkey, and choosing one of their channels to scan.

You should try to choose a channel that you have a larger `local_balance` than the channel you want to scan's capacity, otherwise you may not get 

## Make it Better

Implement a command that, given a node's pubkey you have a channel open with, scans all of the channels connected to that node. Also try to improve the scan's binary search algorithm to get through the scans faster.

A couple of hints:
* [GetNodeInfo](https://api.lightning.community/#getnodeinfo) comes back with a `channels` array as of LND v0.7.0-beta-rc1, much easier to deal with than `node.describeGraph`.
* What are the most common states for a channel's balance to be in? 🤔
