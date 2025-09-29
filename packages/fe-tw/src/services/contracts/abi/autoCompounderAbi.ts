export const autoCompounderAbi = [
   {
      inputs: [
         {
            internalType: "contract RewardsVault4626",
            name: "_vault",
            type: "address",
         },
         {
            internalType: "string",
            name: "_name",
            type: "string",
         },
         {
            internalType: "string",
            name: "_symbol",
            type: "string",
         },
         {
            internalType: "uint256",
            name: "_minimumClaimThreshold",
            type: "uint256",
         },
         {
            internalType: "contract IUniswapV2Router02",
            name: "_uniswapRouter",
            type: "address",
         },
         {
            internalType: "address",
            name: "_intermediateToken",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "_maxSlippage",
            type: "uint256",
         },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
   },
   {
      inputs: [],
      name: "InsufficientBalance",
      type: "error",
   },
   {
      inputs: [],
      name: "InvalidAmount",
      type: "error",
   },
   {
      inputs: [],
      name: "InvalidNewOwner",
      type: "error",
   },
   {
      inputs: [],
      name: "InvalidReceiver",
      type: "error",
   },
   {
      inputs: [],
      name: "InvalidSlippage",
      type: "error",
   },
   {
      inputs: [],
      name: "InvalidSwapPath",
      type: "error",
   },
   {
      inputs: [],
      name: "NotOwner",
      type: "error",
   },
   {
      inputs: [],
      name: "ReentrancyGuardReentrantCall",
      type: "error",
   },
   {
      inputs: [],
      name: "SwapFailed",
      type: "error",
   },
   {
      inputs: [],
      name: "TransferFailed",
      type: "error",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "owner",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "spender",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "value",
            type: "uint256",
         },
      ],
      name: "Approval",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: false,
            internalType: "uint256",
            name: "totalAssetsReinvested",
            type: "uint256",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "swapCount",
            type: "uint256",
         },
      ],
      name: "AutoCompound",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "assets",
            type: "uint256",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "shares",
            type: "uint256",
         },
      ],
      name: "Deposit",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "previousOwner",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "newOwner",
            type: "address",
         },
      ],
      name: "OwnershipTransferred",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "rewardToken",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
         },
      ],
      name: "RewardsClaimed",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "rewardToken",
            type: "address",
         },
         {
            indexed: false,
            internalType: "address[]",
            name: "newPath",
            type: "address[]",
         },
      ],
      name: "SwapPathUpdated",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "fromToken",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "toToken",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
         },
      ],
      name: "TokenSwapped",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "value",
            type: "uint256",
         },
      ],
      name: "Transfer",
      type: "event",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "user",
            type: "address",
         },
      ],
      name: "getUserReward",
      outputs: [
         {
            internalType: "address[]",
            name: "tokens",
            type: "address[]",
         },
         {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "shares",
            type: "uint256",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "assets",
            type: "uint256",
         },
      ],
      name: "Withdraw",
      type: "event",
   },
   {
      inputs: [],
      name: "ASSET",
      outputs: [
         {
            internalType: "contract IERC20",
            name: "",
            type: "address",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "DECIMALS",
      outputs: [
         {
            internalType: "uint8",
            name: "",
            type: "uint8",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "INTERMEDIATE_TOKEN",
      outputs: [
         {
            internalType: "address",
            name: "",
            type: "address",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "UNISWAP_ROUTER",
      outputs: [
         {
            internalType: "contract IUniswapV2Router02",
            name: "",
            type: "address",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "VAULT",
      outputs: [
         {
            internalType: "contract RewardsVault4626",
            name: "",
            type: "address",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "",
            type: "address",
         },
         {
            internalType: "address",
            name: "",
            type: "address",
         },
      ],
      name: "allowance",
      outputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "spender",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
         },
      ],
      name: "approve",
      outputs: [
         {
            internalType: "bool",
            name: "",
            type: "bool",
         },
      ],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [],
      name: "asset",
      outputs: [
         {
            internalType: "address",
            name: "",
            type: "address",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "user",
            type: "address",
         },
      ],
      name: "assetsOf",
      outputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "autoCompound",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "",
            type: "address",
         },
      ],
      name: "balanceOf",
      outputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "user",
            type: "address",
         },
      ],
      name: "canWithdraw",
      outputs: [
         {
            internalType: "bool",
            name: "",
            type: "bool",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "claimUserRewards",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [],
      name: "decimals",
      outputs: [
         {
            internalType: "uint8",
            name: "",
            type: "uint8",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "assets",
            type: "uint256",
         },
         {
            internalType: "address",
            name: "receiver",
            type: "address",
         },
      ],
      name: "deposit",
      outputs: [
         {
            internalType: "uint256",
            name: "shares",
            type: "uint256",
         },
      ],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "token",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
         },
      ],
      name: "emergencyWithdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [],
      name: "exchangeRate",
      outputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "rewardToken",
            type: "address",
         },
      ],
      name: "getSwapPath",
      outputs: [
         {
            internalType: "address[]",
            name: "path",
            type: "address[]",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "user",
            type: "address",
         },
      ],
      name: "getUserInfo",
      outputs: [
         {
            internalType: "uint256",
            name: "depositTimestamp",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "totalDeposited",
            type: "uint256",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "maxSlippage",
      outputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "minimumClaimThreshold",
      outputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "shares",
            type: "uint256",
         },
         {
            internalType: "address",
            name: "receiver",
            type: "address",
         },
      ],
      name: "mint",
      outputs: [
         {
            internalType: "uint256",
            name: "assets",
            type: "uint256",
         },
      ],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [],
      name: "name",
      outputs: [
         {
            internalType: "string",
            name: "",
            type: "string",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "owner",
      outputs: [
         {
            internalType: "address",
            name: "",
            type: "address",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "shares",
            type: "uint256",
         },
         {
            internalType: "address",
            name: "receiver",
            type: "address",
         },
         {
            internalType: "address",
            name: "owner_",
            type: "address",
         },
      ],
      name: "redeem",
      outputs: [
         {
            internalType: "uint256",
            name: "assets",
            type: "uint256",
         },
      ],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "rewardToken",
            type: "address",
         },
      ],
      name: "removeSwapPath",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "newSlippage",
            type: "uint256",
         },
      ],
      name: "setMaxSlippage",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "newThreshold",
            type: "uint256",
         },
      ],
      name: "setMinimumClaimThreshold",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "rewardToken",
            type: "address",
         },
         {
            internalType: "address[]",
            name: "path",
            type: "address[]",
         },
      ],
      name: "setSwapPath",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "bytes4",
            name: "interfaceId",
            type: "bytes4",
         },
      ],
      name: "supportsInterface",
      outputs: [
         {
            internalType: "bool",
            name: "",
            type: "bool",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "",
            type: "uint256",
         },
      ],
      name: "swapPaths",
      outputs: [
         {
            internalType: "address",
            name: "",
            type: "address",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "symbol",
      outputs: [
         {
            internalType: "string",
            name: "",
            type: "string",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "rewardToken",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
         },
      ],
      name: "testSwap",
      outputs: [
         {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "totalAssets",
      outputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "totalSupply",
      outputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "to",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
         },
      ],
      name: "transfer",
      outputs: [
         {
            internalType: "bool",
            name: "",
            type: "bool",
         },
      ],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "from",
            type: "address",
         },
         {
            internalType: "address",
            name: "to",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
         },
      ],
      name: "transferFrom",
      outputs: [
         {
            internalType: "bool",
            name: "",
            type: "bool",
         },
      ],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "newOwner",
            type: "address",
         },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "",
            type: "address",
         },
      ],
      name: "userInfo",
      outputs: [
         {
            internalType: "uint256",
            name: "depositTimestamp",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "totalDeposited",
            type: "uint256",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "vault",
      outputs: [
         {
            internalType: "address",
            name: "",
            type: "address",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "shares",
            type: "uint256",
         },
         {
            internalType: "address",
            name: "receiver",
            type: "address",
         },
      ],
      name: "withdraw",
      outputs: [
         {
            internalType: "uint256",
            name: "assets",
            type: "uint256",
         },
      ],
      stateMutability: "nonpayable",
      type: "function",
   },
];
