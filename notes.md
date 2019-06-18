# Channel probing notes

* Precise balance of channels is kept secret to preserve privacy
* Has the downside of making routing slightly less efficient to promote privacy

* How the attack works:
  * A and B have a channel with an unknown balance
  * We open a channel with A, and make a payment through B
  * Naive approach, increment payment 1 sat at a time until it fails to route
  * To make the attack costless, we create "fake" invoices from B that A cannot detect until they try to route with B, who will reject it
  * This can be extended to _any_ node connected to A, not just B

* What makes it easy to perform?
  * Nodes don't normally reject channels since they generally want liquidity, so anyone can open a channel
  * Hub nodes are well connected, meaining you don't need to open that many channels to get great connectivity

* What makes it difficult to perform?
  * They must have the max channel size available in BTC to scan the max size of a channel (0.16... btc)
  * They must pay the on chain fees to open and close the channel for scanning, at lowest ~2000 sats
  * MAX_PAYMENT_ALLOWED means you can't scan channels that are over 25% of the max size
  * If you want to parallelize, you need MAX_PAYMENT_ALLOWED for each channel you simultaneously open

* Why is this bad? Having full understanding of balances allows us to reverse engineer which payments were made, deanonymizing LN payments

* What can we do against it?
  * Have channels above the payment limit (Assumes payment limit will never meet channel limit)
  * Obfuscate routing failure errors (Bad hash looks the same as can't route)
  * Add some randomness to dropping routing requests
  * Heuristically reject suspicious requests
  * Allowing negative balances, routing beyond your capacity, using other methods
