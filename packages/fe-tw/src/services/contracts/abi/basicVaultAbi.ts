import { Abi } from "viem";

export const basicVaultAbi = [
   {
      inputs: [
         {
            internalType: "contract IERC20",
            name: "underlying_",
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
            components: [
               {
                  internalType: "address",
                  name: "receiver",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "token",
                  type: "address",
               },
               {
                  internalType: "uint256",
                  name: "feePercentage",
                  type: "uint256",
               },
            ],
            internalType: "struct FeeConfiguration.FeeConfig",
            name: "feeConfig_",
            type: "tuple",
         },
         {
            internalType: "address",
            name: "vaultRewardController_",
            type: "address",
         },
         {
            internalType: "address",
            name: "feeConfigController_",
            type: "address",
         },
         {
            internalType: "uint32",
            name: "cliff_",
            type: "uint32",
         },
         {
            internalType: "uint32",
            name: "unlockDuration_",
            type: "uint32",
         },
      ],
      stateMutability: "payable",
      type: "constructor",
   },
   {
      inputs: [],
      name: "AccessControlBadConfirmation",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "account",
            type: "address",
         },
         {
            internalType: "bytes32",
            name: "neededRole",
            type: "bytes32",
         },
      ],
      name: "AccessControlUnauthorizedAccount",
      type: "error",
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
      inputs: [
         {
            internalType: "address",
            name: "receiver",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "assets",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "max",
            type: "uint256",
         },
      ],
      name: "ERC4626ExceededMaxDeposit",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "receiver",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "shares",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "max",
            type: "uint256",
         },
      ],
      name: "ERC4626ExceededMaxMint",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "owner",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "shares",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "max",
            type: "uint256",
         },
      ],
      name: "ERC4626ExceededMaxRedeem",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "owner",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "assets",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "max",
            type: "uint256",
         },
      ],
      name: "ERC4626ExceededMaxWithdraw",
      type: "error",
   },
   {
      inputs: [],
      name: "FailedInnerCall",
      type: "error",
   },
   {
      inputs: [],
      name: "MathOverflowedMulDiv",
      type: "error",
   },
   {
      inputs: [],
      name: "MaxRewardTokensAmount",
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
            indexed: true,
            internalType: "address",
            name: "sender",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "owner",
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
            components: [
               {
                  internalType: "address",
                  name: "receiver",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "token",
                  type: "address",
               },
               {
                  internalType: "uint256",
                  name: "feePercentage",
                  type: "uint256",
               },
            ],
            indexed: false,
            internalType: "struct FeeConfiguration.FeeConfig",
            name: "feeConfig",
            type: "tuple",
         },
      ],
      name: "FeeConfigUpdated",
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
      name: "RewardAdded",
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
            indexed: true,
            internalType: "address",
            name: "receiver",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
         },
      ],
      name: "RewardClaimed",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
         },
         {
            indexed: true,
            internalType: "bytes32",
            name: "previousAdminRole",
            type: "bytes32",
         },
         {
            indexed: true,
            internalType: "bytes32",
            name: "newAdminRole",
            type: "bytes32",
         },
      ],
      name: "RoleAdminChanged",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
         },
         {
            indexed: true,
            internalType: "address",
            name: "account",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "sender",
            type: "address",
         },
      ],
      name: "RoleGranted",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
         },
         {
            indexed: true,
            internalType: "address",
            name: "account",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "sender",
            type: "address",
         },
      ],
      name: "RoleRevoked",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: false,
            internalType: "uint32",
            name: "time",
            type: "uint32",
         },
      ],
      name: "SetSharesLockTime",
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
            name: "sender",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "receiver",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "owner",
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
      name: "Withdraw",
      type: "event",
   },
   {
      inputs: [],
      name: "DEFAULT_ADMIN_ROLE",
      outputs: [
         {
            internalType: "bytes32",
            name: "",
            type: "bytes32",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "FEE_CONFIG_CONTROLLER_ROLE",
      outputs: [
         {
            internalType: "bytes32",
            name: "",
            type: "bytes32",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "VAULT_REWARD_CONTROLLER_ROLE",
      outputs: [
         {
            internalType: "bytes32",
            name: "",
            type: "bytes32",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "_token",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "_amount",
            type: "uint256",
         },
      ],
      name: "addReward",
      outputs: [],
      stateMutability: "payable",
      type: "function",
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
      inputs: [
         {
            internalType: "uint256",
            name: "_startPosition",
            type: "uint256",
         },
         {
            internalType: "address",
            name: "receiver",
            type: "address",
         },
      ],
      name: "claimAllReward",
      outputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "",
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
         {
            internalType: "address",
            name: "receiver",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
         },
      ],
      name: "claimExactReward",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [],
      name: "cliff",
      outputs: [
         {
            internalType: "uint32",
            name: "",
            type: "uint32",
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
      ],
      name: "convertToAssets",
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
            name: "assets",
            type: "uint256",
         },
      ],
      name: "convertToShares",
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
      inputs: [],
      name: "feeConfig",
      outputs: [
         {
            internalType: "address",
            name: "receiver",
            type: "address",
         },
         {
            internalType: "address",
            name: "token",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "feePercentage",
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
            name: "_user",
            type: "address",
         },
      ],
      name: "getAllRewards",
      outputs: [
         {
            internalType: "uint256[]",
            name: "_rewards",
            type: "uint256[]",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "getRewardTokens",
      outputs: [
         {
            internalType: "address[]",
            name: "",
            type: "address[]",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
         },
      ],
      name: "getRoleAdmin",
      outputs: [
         {
            internalType: "bytes32",
            name: "",
            type: "bytes32",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "_user",
            type: "address",
         },
         {
            internalType: "address",
            name: "_rewardToken",
            type: "address",
         },
      ],
      name: "getUserReward",
      outputs: [
         {
            internalType: "uint256",
            name: "unclaimedAmount",
            type: "uint256",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
         },
         {
            internalType: "address",
            name: "account",
            type: "address",
         },
      ],
      name: "grantRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
         },
         {
            internalType: "address",
            name: "account",
            type: "address",
         },
      ],
      name: "hasRole",
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
            name: "account",
            type: "address",
         },
      ],
      name: "lockedOf",
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
            name: "",
            type: "address",
         },
      ],
      name: "maxDeposit",
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
            name: "",
            type: "address",
         },
      ],
      name: "maxMint",
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
            name: "owner",
            type: "address",
         },
      ],
      name: "maxRedeem",
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
            name: "owner",
            type: "address",
         },
      ],
      name: "maxWithdraw",
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
            name: "assets",
            type: "uint256",
         },
      ],
      name: "previewDeposit",
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
      ],
      name: "previewMint",
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
      ],
      name: "previewRedeem",
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
            name: "assets",
            type: "uint256",
         },
      ],
      name: "previewWithdraw",
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
         {
            internalType: "address",
            name: "owner",
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
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
         },
         {
            internalType: "address",
            name: "callerConfirmation",
            type: "address",
         },
      ],
      name: "renounceRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
         },
         {
            internalType: "address",
            name: "account",
            type: "address",
         },
      ],
      name: "revokeRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "uint32",
            name: "time",
            type: "uint32",
         },
      ],
      name: "setSharesLockTime",
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
      name: "unlockDuration",
      outputs: [
         {
            internalType: "uint32",
            name: "",
            type: "uint32",
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
      name: "unlockedOf",
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
            components: [
               {
                  internalType: "address",
                  name: "receiver",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "token",
                  type: "address",
               },
               {
                  internalType: "uint256",
                  name: "feePercentage",
                  type: "uint256",
               },
            ],
            internalType: "struct FeeConfiguration.FeeConfig",
            name: "_feeConfig",
            type: "tuple",
         },
      ],
      name: "updateFeeConfig",
      outputs: [],
      stateMutability: "nonpayable",
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
         {
            internalType: "address",
            name: "owner",
            type: "address",
         },
      ],
      name: "withdraw",
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
] as const satisfies Abi;
