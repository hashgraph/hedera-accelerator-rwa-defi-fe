export const vaultFactoryAbi = [
   {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
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
            name: "vault",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "asset",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "deployer",
            type: "address",
         },
         {
            indexed: false,
            internalType: "string",
            name: "name",
            type: "string",
         },
         {
            indexed: false,
            internalType: "string",
            name: "symbol",
            type: "string",
         },
         {
            indexed: false,
            internalType: "uint8",
            name: "decimals",
            type: "uint8",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "lockPeriod",
            type: "uint256",
         },
      ],
      name: "VaultCreated",
      type: "event",
   },
   {
      inputs: [
         {
            components: [
               {
                  internalType: "contract IERC20",
                  name: "asset",
                  type: "address",
               },
               {
                  internalType: "string",
                  name: "name",
                  type: "string",
               },
               {
                  internalType: "string",
                  name: "symbol",
                  type: "string",
               },
               {
                  internalType: "uint8",
                  name: "decimals",
                  type: "uint8",
               },
               {
                  internalType: "uint256",
                  name: "lockPeriod",
                  type: "uint256",
               },
            ],
            internalType: "struct RewardsVault4626Factory.VaultCreationParams",
            name: "params",
            type: "tuple",
         },
      ],
      name: "createVault",
      outputs: [
         {
            internalType: "address",
            name: "vault",
            type: "address",
         },
      ],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "contract IERC20",
            name: "asset",
            type: "address",
         },
         {
            internalType: "string",
            name: "name",
            type: "string",
         },
         {
            internalType: "string",
            name: "symbol",
            type: "string",
         },
         {
            internalType: "uint8",
            name: "decimals",
            type: "uint8",
         },
         {
            internalType: "uint256",
            name: "lockPeriod",
            type: "uint256",
         },
      ],
      name: "createVaultWithParams",
      outputs: [
         {
            internalType: "address",
            name: "vault",
            type: "address",
         },
      ],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256",
         },
      ],
      name: "deployedVaults",
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
      name: "getAllVaults",
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
      inputs: [],
      name: "getFactoryStats",
      outputs: [
         {
            internalType: "uint256",
            name: "totalVaults",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "uniqueAssets",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "totalTVL",
            type: "uint256",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "getVaultCount",
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
            name: "vault",
            type: "address",
         },
      ],
      name: "getVaultInfo",
      outputs: [
         {
            components: [
               {
                  internalType: "address",
                  name: "asset",
                  type: "address",
               },
               {
                  internalType: "string",
                  name: "name",
                  type: "string",
               },
               {
                  internalType: "string",
                  name: "symbol",
                  type: "string",
               },
               {
                  internalType: "uint8",
                  name: "decimals",
                  type: "uint8",
               },
               {
                  internalType: "uint256",
                  name: "lockPeriod",
                  type: "uint256",
               },
               {
                  internalType: "address",
                  name: "deployer",
                  type: "address",
               },
               {
                  internalType: "uint256",
                  name: "deploymentTime",
                  type: "uint256",
               },
               {
                  internalType: "bool",
                  name: "exists",
                  type: "bool",
               },
            ],
            internalType: "struct RewardsVault4626Factory.VaultInfo",
            name: "info",
            type: "tuple",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "asset",
            type: "address",
         },
      ],
      name: "getVaultsByAsset",
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
      inputs: [
         {
            internalType: "address",
            name: "deployer",
            type: "address",
         },
      ],
      name: "getVaultsByDeployer",
      outputs: [
         {
            internalType: "address[]",
            name: "vaults",
            type: "address[]",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "offset",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "limit",
            type: "uint256",
         },
      ],
      name: "getVaultsPaginated",
      outputs: [
         {
            internalType: "address[]",
            name: "vaults",
            type: "address[]",
         },
         {
            internalType: "uint256",
            name: "total",
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
      name: "isDeployedVault",
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
            internalType: "address",
            name: "vault",
            type: "address",
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
            name: "vault",
            type: "address",
         },
         {
            internalType: "address",
            name: "newOwner",
            type: "address",
         },
      ],
      name: "transferVaultOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "vault",
            type: "address",
         },
         {
            internalType: "bool",
            name: "status",
            type: "bool",
         },
      ],
      name: "updateVaultTracking",
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
      name: "vaultInfo",
      outputs: [
         {
            internalType: "address",
            name: "asset",
            type: "address",
         },
         {
            internalType: "string",
            name: "name",
            type: "string",
         },
         {
            internalType: "string",
            name: "symbol",
            type: "string",
         },
         {
            internalType: "uint8",
            name: "decimals",
            type: "uint8",
         },
         {
            internalType: "uint256",
            name: "lockPeriod",
            type: "uint256",
         },
         {
            internalType: "address",
            name: "deployer",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "deploymentTime",
            type: "uint256",
         },
         {
            internalType: "bool",
            name: "exists",
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
      name: "vaultsByAsset",
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
];
