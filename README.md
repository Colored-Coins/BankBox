<h1 align="center">
  <br>
      <img src="https://raw.github.com/oleiba/BankBox/master/assets/logo.png" alt="ColoredCoins" height=100>
  <br>
  BankBox
  <br>
  <br>
</h1>

<h4 align="center">ColoredCoins desktop wallet application for digital currency issuance and management.</h4>

**BankBox** is a desktop client of the [ColoredCoins protocol](https://github.com/Colored-Coins/Colored-Coins-Protocol-Specification) on top of the Bitcoin blockchain.<br>
It utilizes [ColoredCoins full-node](https://github.com/Colored-Coins/Full-Node), which in its turn is dependant on [Bitcoin-Core](https://bitcoin.org/en/bitcoin-core/), the Bitcoin reference client.<br>
It downloads and maintains a copy of the blockchain **locally**, coupled with parsed ColoredCoins assets layer of ColoredCoins colored transactions - so it keeps the protocol true **peer-to-peer** with no dependance on external servers.

**Note:** A ColoredCoins transaction, just as any other Bitcoin transaction, require some Bitcoins to be transferred with it.
Since the BankBox gives full control to the user, it's up to the BankBox client to finance the ColoredCoins transactions.

If you would like to deep dive to our programmatic Node.js (and browser) API for issuance and transfer of digital assets, go to [Getting started with ColoredCoins SDK](https://github.com/Colored-Coins/ColoredCoins-docs/blob/master/getting_started.md).

The architecture of this desktop wallet can be illustrated with the following layers sketch:

<p align="center">
    <img src="https://raw.github.com/oleiba/BankBox/master/assets/architecture.png">
</p>

## Prerequisites

* [Bitcoin-Core](https://bitcoin.org/en/bitcoin-core/)
* [Redis](https://redis.io/)<br>

Windows installer will download these dependencies for you, but for other OS they should be installed separately.

## Install

<b>Download the latest version of BankBox from the
[GitHub releases](https://github.com/Colored-Coins/BankBox/releases) page </b> (currently available for windows)

### OR

You can run from source.<br>
First you need to download the prerequisites mentioned above, and then use the instructions in the ["How to Contribute"](#how-to-contribute) section.

## Screenshots

<p align="center">
  <img src="https://raw.github.com/oleiba/BankBox/master/assets/screenshot-dashboard.jpg" alt="screenshot-dashboard" height="500">
</p>
<p align="center">
  <img src="https://raw.github.com/oleiba/BankBox/master/assets/screenshot-transaction.jpg" alt="screenshot-transaction" height="500">
</p>

## Configuration

BankBox comes with default properties - such as the Bitcoin network (mainnet or testnet), default transaction fee and the configuration for the ColoredCoins full-node server, Bitcoin-Core daemon and Redis. <br>
BankBox `properties.conf` can be found and edited in: <br>
`%APPDATA%\BankBox` (windows) <br>
ColoredCoins full-node `properties.conf`: <br>
`%APPDATA%\coloredcoins-full-node` (windows)

## How to Contribute

### Get the code

```sh
$ git clone https://github.com/Colored-Coins/BankBox.git
$ cd BankBox
$ npm install
```

### Run the app

```sh
$ npm start
```

### Watch the code

Restart the app automatically every time code changes. Useful during development.

```sh
$ npm run watch
```

### Package the app

Builds app binaries. Currently, only Windows is available.

```sh
$ npm run package -- [options]
```

For `[options]` the following optional arguments are available:

- `--sign` - Sign the application
- `--package=[type]` - Package single output type.
  - `exe` - Windows installer
  - `portable` - Windows portable app
  - `all` - All available package options

## License

[AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)


