# Channel Probing Attack

This repo has a quick minimal implementation of a channel probing attack. Given a node M that you control, you can determine the balance between any two nodes A and B that you have a channel open with A.

For context on channel probing attacks, please read https://eprint.iacr.org/2019/328.pdf or read the slides in this repo.

## Setup

To run this, you'll need Node 8+ and your own LND node. First install the dependencies:

```
npm install
# OR #
yarn
```

Then we need to setup the connection to our node. Copy the `.env.example` file to `.env`:

```
cp .env.example .env
```

And fill it out with the necessary information.

## Running

This project provides two command line utilities, use `npm run` or `yarn run` to run either.

### `scan-channel`

Scans a single channel and returns its balance. Can error out if either node in the channel 

Example:

```
npm run scan-channel
```

### `scan-all-channels`

