import { Abi } from "viem";

export const autoCompounderAbi = [
   {
      inputs: [
         {
            internalType: "address",
            name: "uniswapV2Router_",
            type: "address",
         },
         {
            internalType: "address",
            name: "vault_",
            type: "address",
         },
         {
            internalType: "address",
            name: "usdc_",
            type: "address",
         },
         {
            internalType: "string",
            name: "name_",
            type: "string",
         },
         {
            internalType: "string",
            name: "symbol_",
            type: "string",
         },
         {
            internalType: "address",
            name: "operator_",
            type: "address",
         },
      ],
      stateMutability: "payable",
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
      inputs: [
         {
            internalType: "address",
            name: "spender",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "allowance",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "needed",
            type: "uint256",
         },
      ],
      name: "ERC20InsufficientAllowance",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "sender",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "balance",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "needed",
            type: "uint256",
         },
      ],
      name: "ERC20InsufficientBalance",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "approver",
            type: "address",
         },
      ],
      name: "ERC20InvalidApprover",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "receiver",
            type: "address",
         },
      ],
      name: "ERC20InvalidReceiver",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "sender",
            type: "address",
         },
      ],
      name: "ERC20InvalidSender",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "spender",
            type: "address",
         },
      ],
      name: "ERC20InvalidSpender",
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
            internalType: "uint256",
            name: "reward",
            type: "uint256",
         },
      ],
      name: "InsufficientReward",
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
            name: "depositedUnderlying",
            type: "uint256",
         },
      ],
      name: "Claim",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "createdToken",
            type: "address",
         },
      ],
      name: "CreatedToken",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "caller",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "receiver",
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
            name: "aTokenMinted",
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
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "caller",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "receiver",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "reward",
            type: "uint256",
         },
      ],
      name: "UserClaimedReward",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "caller",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "aTokenAmount",
            type: "uint256",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "underlyingAmount",
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
            name: "owner",
            type: "address",
         },
         {
            internalType: "address",
            name: "spender",
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
            name: "value",
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
            name: "account",
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
      inputs: [],
      name: "claim",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "receiver",
            type: "address",
         },
      ],
      name: "claimExactUserReward",
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
            name: "amountToMint",
            type: "uint256",
         },
      ],
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
            name: "user",
            type: "address",
         },
      ],
      name: "getPendingReward",
      outputs: [
         {
            internalType: "uint256",
            name: "pendingReward",
            type: "uint256",
         },
      ],
      stateMutability: "view",
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
      inputs: [],
      name: "renounceOwnership",
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
            name: "value",
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
            name: "value",
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
      inputs: [],
      name: "uniswapV2Router",
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
      name: "usdc",
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
            name: "aTokenAmount",
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
            name: "underlyingAmount",
            type: "uint256",
         },
      ],
      stateMutability: "nonpayable",
      type: "function",
   },
] as const satisfies Abi;
