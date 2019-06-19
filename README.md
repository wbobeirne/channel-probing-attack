# Channel Probing Attack

This repo has a quick minimal implementation of a channel probing attack. Given a node M that you control, you can determine the balance between any two nodes A and B that you have a channel open with A.

For context on channel probing attacks, please read https://eprint.iacr.org/2019/328.pdf or read the slides in this repo.

## Setup

To run this, you'll need Node 8+ and your own LND node. First install the dependencies:

```sh
npm install
# OR #
yarn
```

Then we need to setup the connection to our node. Copy the `.env.example` file to `.env`:

```sh
cp .env.example .env
```

And fill it out with the necessary information. You most commonly can find the TLS cert in `~/.lnd` and the macaroons in `~/.lnd/data/chain/bitcoin/mainnet/admin.macaroon`. You can just run `base64` on them to get the correct values.

## Running

Our basic command here can be run with
```sh
npm run scan-channel [my-channel-id] [scan-channel-id]
# OR #
yarn run scan-channel [my-channel-id] [scan-channel-id]
```

You can get the first argument by running `lncli listchannels` and choosing one of your channels. You can then get the second argument by running `lncli getnodeinfo [pubkey]` using your channel counterparty's pubkey, and choosing one of their channels to scan.

You should try to choose a channel that you have a larger `local_balance` than the channel you want to scan's capacity, otherwise you may not get 

## Make it Better

Implement a command that, given a node's pubkey you have a channel open with, scans all of the channels connected to that node. Try to run as much as possible in parallel, and try to improve the scan's binary search algorithm.