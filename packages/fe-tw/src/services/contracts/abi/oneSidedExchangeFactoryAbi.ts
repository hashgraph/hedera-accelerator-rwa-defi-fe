import { Abi } from "viem";

export const useOneSidedExchangeFactoryAbi = [
   {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "target",
            type: "address",
         },
      ],
      name: "AddressEmptyCode",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "account",
            type: "address",
         },
      ],
      name: "AddressInsufficientBalance",
      type: "error",
   },
   {
      inputs: [],
      name: "FailedInnerCall",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "string",
            name: "message",
            type: "string",
         },
      ],
      name: "InvalidAddress",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "string",
            name: "message",
            type: "string",
         },
         {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
         },
      ],
      name: "InvalidAmount",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "string",
            name: "message",
            type: "string",
         },
      ],
      name: "NoPriceExists",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "owner",
            type: "address",
         },
      ],
      name: "OwnableInvalidOwner",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "account",
            type: "address",
         },
      ],
      name: "OwnableUnauthorizedAccount",
      type: "error",
   },
   {
      inputs: [],
      name: "ReentrancyGuardReentrantCall",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "token",
            type: "address",
         },
      ],
      name: "SafeERC20FailedOperation",
      type: "error",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: false,
            internalType: "address",
            name: "token",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
         },
      ],
      name: "LiquidityAdded",
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
            name: "trader",
            type: "address",
         },
         {
            indexed: false,
            internalType: "address",
            name: "tokenA",
            type: "address",
         },
         {
            indexed: false,
            internalType: "address",
            name: "tokenB",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "tokenAAmount",
            type: "uint256",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "tokenBAmount",
            type: "uint256",
         },
      ],
      name: "SwapSuccess",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: false,
            internalType: "address",
            name: "token",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
         },
      ],
      name: "Withdraw",
      type: "event",
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
      name: "addLiquidityForToken",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "tokenA",
            type: "address",
         },
         {
            internalType: "address",
            name: "tokenB",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
         },
      ],
      name: "estimateTokenReturns",
      outputs: [
         {
            internalType: "uint256",
            name: "tokenAAmount",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "tokenBAmount",
            type: "uint256",
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
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
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
         {
            internalType: "uint256",
            name: "interval",
            type: "uint256",
         },
      ],
      name: "setBuyPrice",
      outputs: [],
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
         {
            internalType: "uint256",
            name: "interval",
            type: "uint256",
         },
      ],
      name: "setSellPrice",
      outputs: [],
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
            name: "maxSellAmount",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "maxBuyAmount",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "interval",
            type: "uint256",
         },
      ],
      name: "setThreshold",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "tokenA",
            type: "address",
         },
         {
            internalType: "address",
            name: "tokenB",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
         },
      ],
      name: "swap",
      outputs: [],
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
            name: "token",
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
      name: "withdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
] as const satisfies Abi;
