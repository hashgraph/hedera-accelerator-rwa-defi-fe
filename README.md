# 🏙️ Hedera RWA DeFi Accelerator – Frontend

Welcome to the frontend of the **Hedera RWA DeFi Accelerator** – a reference dApp for building, managing, and interacting with tokenized real estate assets on Web3. This is the user interface layer for a modular REIT system that models real estate as on-chain assets, designed with composability, investor accessibility, and DeFi integration in mind.

Powered by Hedera's [Asset Tokenization Studio](https://hedera.com/asset-tokenization-studio). 

> 💡 This project is a **reference architecture** for tokenizing real-world assets (RWAs) on Hedera. It is not intended to run on mainnet or represent real financial instruments. 

<br>

![Buildings](https://plum-famous-crane-874.mypinata.cloud/ipfs/bafybeia63a5ltcwsnkvoeydgd4n3pdsdrufgxrubjeyumrcdvz3qpvogv4?pinataGatewayToken=k5WJ6L2sEo6eMgjWXh4IlXiOGh-nNFBl-FqHTFnm6wt1cpPkgtpB0PfDVv0Lu9kF)


---

## Demo

See a demo of current functionality and workflow here: 
<br>
<a href="https://plum-famous-crane-874.mypinata.cloud/ipfs/bafybeigcorypgjhw2uwq6ytzylwfj3lpted47amc73lbhzej43q4g3gx7y?pinataGatewayToken=k5WJ6L2sEo6eMgjWXh4IlXiOGh-nNFBl-FqHTFnm6wt1cpPkgtpB0PfDVv0Lu9kF">
  <img src="https://plum-famous-crane-874.mypinata.cloud/ipfs/bafybeic5iuvpeux2ehwnyqpq4rh5bq5pw7oromojuj34fm7ceh2ybvhxra?pinataGatewayToken=k5WJ6L2sEo6eMgjWXh4IlXiOGh-nNFBl-FqHTFnm6wt1cpPkgtpB0PfDVv0Lu9kF" alt="Watch the video" width="300">
</a>


## 📦 Features

This frontend is structured around the idea that **each building is a unique NFT-backed identity**, with attached metadata, tokenized ownership, and integrated DeFi flows.

### ✅ Core Building Blocks

- **🧱 Building NFTs (ERC-721 + Metadata)**
  - Unique NFT for each property with IPFS-backed metadata
  - Editable and freezable attributes (e.g. year built, COPE data)

- **💸 Tokenized Ownership (ERC-1400 & ERC-3643)**
  - Regulated fungible tokens for shareholding
  - Geo and cap-based transfer restrictions

- **💰 Vaults (ERC-4626 & ERC-7540)**
  – Stake building token
  - Real yield and streaming revenue distribution
  - Async vaults for smoother high-volume DeFi integrations

- **🔁 Autocompounders**
  - Automatic reinvestment of yield
  - Growth of token holdings without manual claiming

- **🏛️ DAO Governance (tbc)** 
  - Proposals, voting, and treasury management
  - Multi-role controls for admin, investor, auditor

    ![Proposals](https://plum-famous-crane-874.mypinata.cloud/ipfs/bafkreibp2226etstgg3ow65ty55oizdzkbjeneeezhvuaef3acutwa3dwe?pinataGatewayToken=k5WJ6L2sEo6eMgjWXh4IlXiOGh-nNFBl-FqHTFnm6wt1cpPkgtpB0PfDVv0Lu9kF)

- **📈 Pricing & Liquidity**
  - Add a liquidity pool to each building, and easily swap USDC for regulated building tokens

    ![Trade](https://plum-famous-crane-874.mypinata.cloud/ipfs/bafybeicgdslfvsvyjkr5e57grhbwozutano23ork6atc24u7pyxns3tykq?pinataGatewayToken=k5WJ6L2sEo6eMgjWXh4IlXiOGh-nNFBl-FqHTFnm6wt1cpPkgtpB0PfDVv0Lu9kF)

    ![Liquidity](https://plum-famous-crane-874.mypinata.cloud/ipfs/bafkreidshil34qqmq4w674cz3yw2chdsduwvcalws6ekp6zetjxbf4caoe?pinataGatewayToken=k5WJ6L2sEo6eMgjWXh4IlXiOGh-nNFBl-FqHTFnm6wt1cpPkgtpB0PfDVv0Lu9kF)



- **🏗️ Slices**
  - Curated investment baskets (eg. luxury, regional, hi-rise..)
  - Built for diversification and tailored exposure

    ![Slice](https://plum-famous-crane-874.mypinata.cloud/ipfs/bafybeib2map22yetpxe3ivt6rswhf63fazbp6f6q7xjw5nvj66vfkhdue4?pinataGatewayToken=k5WJ6L2sEo6eMgjWXh4IlXiOGh-nNFBl-FqHTFnm6wt1cpPkgtpB0PfDVv0Lu9kF)

---

## 🧭 Directory Overview

The frontend follows a modular structure built on **Next.js**:

```
app/                → Page routing
  └── admin/        → Admin tools
  └── building/     → Individual building views, interactions
  └── dash/         → Dashboard and analytics
  └── explorer/     → Browse buildings and slices
  └── slices/       → Slice management
components/         → All reusable UI elements
hooks/              → Web3 data hooks
services/           → IPFS, and contract interaction logic
consts/             → Token, building, slice constants
utils/              → Date helpers
```

---

## 🚀 Getting Started

### 1. Install dependencies

```
yarn install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in the following:

```
WALLETCONNECT_ID=
PINATA_API_KEY=
PINATA_API_SECRET=
HEDERA_NETWORK=testnet
```

You’ll also want your **Treasury account**, **Private key**, and **Contract addresses** (from the backend / deploy scripts).

### 3. Run the app

```
yarn dev
```

## 🧪 Testing

This repository uses Jest for testing:

```
yarn test
```

---

## 🔓 Connect Wallets

This app supports:
- MetaMask (for EVM-compatible accounts)
- HashPack (for native Hedera integration via WalletConnect)

Features like **building creation**, **governance updates** and **vault deposits** are available once authenticated.

---

## 📊 Key Workflows

### 🏢 Deploy a New Building
- Mint a building NFT with metadata URI and Building Token
- Create a vault, treasury and governance
- Add building to slices

  ![Building Management View](https://plum-famous-crane-874.mypinata.cloud/ipfs/bafkreibk4oepzvsh2l2e6il5zt5fnhgnjmny5ass6ructw23hn4dj3ln7m?pinataGatewayToken=k5WJ6L2sEo6eMgjWXh4IlXiOGh-nNFBl-FqHTFnm6wt1cpPkgtpB0PfDVv0Lu9kF)


### 📥 Add Revenue / 📤 Record Expenses
- Push USDC into building treasury
- Trigger real-yield distributions via vaults
- Submit and approve expenses via multisig/DAO

  ![Payments](https://plum-famous-crane-874.mypinata.cloud/ipfs/bafkreieat5cacew45pfphuoazlrqdomokwsun4wrjqffdha2az6ll4rtx4?pinataGatewayToken=k5WJ6L2sEo6eMgjWXh4IlXiOGh-nNFBl-FqHTFnm6wt1cpPkgtpB0PfDVv0Lu9kF)

### 💸 Trade & Stake
- Swap building tokens for USDC (AMM)
- Stake tokens into vaults for streaming rewards
- Let autocompounders grow your stake over time

  ![Staking](https://plum-famous-crane-874.mypinata.cloud/ipfs/bafybeihjoq2qkwb4idaxl4owj7gn6x65yjngqueukuvhimct7gkqenmftq?pinataGatewayToken=k5WJ6L2sEo6eMgjWXh4IlXiOGh-nNFBl-FqHTFnm6wt1cpPkgtpB0PfDVv0Lu9kF) 

  ![Staking](https://plum-famous-crane-874.mypinata.cloud/ipfs/bafkreid4g3uhgqdgl6tdc672isujmdy7qhwt3gf56bnazijku7bzxwg4im?pinataGatewayToken=k5WJ6L2sEo6eMgjWXh4IlXiOGh-nNFBl-FqHTFnm6wt1cpPkgtpB0PfDVv0Lu9kF)

---

## 🧠 Architectural Philosophy

This project uses **Ethereum-compatible standards** like:

- ERC-721 for unique buildings
- ERC-1400/ERC-3643 for compliant fungible shares - Powered by Hedera's Asset Tokenization Studio.
- ERC-4626 and ERC-7540 for flexible DeFi vaults

---

## 🛠️ Dev Resources

Backend Code:
 - [Hedera RWA DeFI Accelerator Backend Repository](https://github.com/hashgraph/accelerator-defi-eip)

Blog Series on Tokenized Real Estate:
- [How Would We Build a REIT Today Using Web3 Technologies?](https://hedera.com/blog/how-would-we-build-a-reit-today-using-web3-technologies)
- [How Is Tokenization Changing The Way We Invest? ](https://hedera.com/blog/how-is-tokenization-changing-the-way-we-invest)
- [How can we model a building in Web3?](https://hedera.com/blog/how-can-we-model-a-building-in-web3)
- [How can we model a building in Web3? (continued)](https://hedera.com/blog/how-can-we-model-a-building-in-web3-continued)
- [Reimagining REIT Cashflows: Managing Revenue and Expenses in Web3](https://hedera.com/blog/reimagining-reit-cashflows)

Other Resources:
- [ERC-3643](https://www.erc3643.org/)
- [ERC-7540 Draft Standard](https://eips.ethereum.org/EIPS/eip-7540)
- [Pinata IPFS Docs](https://docs.pinata.cloud)

---

## 🤝 Contributing

This is an open-source reference implementation. If you want to contribute:

- Create components for new building phases (eg insurance)
- Improve UX 
- Help index building metadata for advanced filtering

PRs are welcome!

---

## ⚠️ Disclaimer

This dApp is for demonstration and educational purposes only. It is **not a financial product**, and no real assets are managed or sold via this platform.

- No audits have been done on this code base.
- No warranties.
- This code is 'in progress', and is intended for demonstration and/or start of your project. you need to do your own QA & Audits before using this.


---

## 💬 Questions?

Feel free to open an issue or reach out via the [Hedera Discord](https://hedera.com/discord). We’d love your feedback as we shape the RWA stack for Web3.
