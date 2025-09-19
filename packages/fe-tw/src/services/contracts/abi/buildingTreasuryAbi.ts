import { Abi } from "viem";

export const buildingTreasuryAbi = [
   {
      inputs: [],
      stateMutability: "nonpayable",
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
      inputs: [],
      name: "FailedInnerCall",
      type: "error",
   },
   {
      inputs: [],
      name: "InvalidInitialization",
      type: "error",
   },
   {
      inputs: [],
      name: "NotInitializing",
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
            name: "from",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "amount",
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
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
         },
      ],
      name: "ExcessFundsForwarded",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: false,
            internalType: "uint256",
            name: "toBusiness",
            type: "uint256",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "toTreasury",
            type: "uint256",
         },
      ],
      name: "FundsDistributed",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: false,
            internalType: "uint64",
            name: "version",
            type: "uint64",
         },
      ],
      name: "Initialized",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
         },
      ],
      name: "Payment",
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
      name: "FACTORY_ROLE",
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
      name: "GOVERNANCE_ROLE",
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
            name: "_vault",
            type: "address",
         },
      ],
      name: "addVault",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
         },
      ],
      name: "deposit",
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
            name: "factory",
            type: "address",
         },
      ],
      name: "grantFactoryRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "governance",
            type: "address",
         },
      ],
      name: "grantGovernanceRole",
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
            name: "_usdcAddress",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "_reserveAmount",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "_nPercentage",
            type: "uint256",
         },
         {
            internalType: "address",
            name: "_initialOwner",
            type: "address",
         },
         {
            internalType: "address",
            name: "_businessAddress",
            type: "address",
         },
         {
            internalType: "address",
            name: "_buildingFactory",
            type: "address",
         },
      ],
      name: "initialize",
      outputs: [],
      stateMutability: "nonpayable",
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
      name: "makePayment",
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
      inputs: [],
      name: "reserve",
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
            internalType: "uint256",
            name: "newReserveAmount",
            type: "uint256",
         },
      ],
      name: "setReserveAmount",
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
] as const satisfies Abi;
