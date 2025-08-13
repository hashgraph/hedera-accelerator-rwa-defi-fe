export const buildingFactoryAbi = [
   {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
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
      anonymous: false,
      inputs: [
         {
            indexed: false,
            internalType: "address",
            name: "buildingAddress",
            type: "address",
         },
      ],
      name: "BuildingConfigured",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: false,
            internalType: "address",
            name: "building",
            type: "address",
         },
         {
            indexed: false,
            internalType: "address",
            name: "module",
            type: "address",
         },
      ],
      name: "ComplianceModuleAdded",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: false,
            internalType: "address",
            name: "building",
            type: "address",
         },
         {
            indexed: false,
            internalType: "address",
            name: "wallet",
            type: "address",
         },
         {
            indexed: false,
            internalType: "address",
            name: "identity",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint16",
            name: "country",
            type: "uint16",
         },
      ],
      name: "IdentityRegistered",
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
            indexed: false,
            internalType: "address",
            name: "buildingAddress",
            type: "address",
         },
         {
            indexed: false,
            internalType: "address",
            name: "erc3643Token",
            type: "address",
         },
         {
            indexed: false,
            internalType: "address",
            name: "treasury",
            type: "address",
         },
         {
            indexed: false,
            internalType: "address",
            name: "vault",
            type: "address",
         },
         {
            indexed: false,
            internalType: "address",
            name: "governance",
            type: "address",
         },
         {
            indexed: false,
            internalType: "address",
            name: "initialOwner",
            type: "address",
         },
         {
            indexed: false,
            internalType: "address",
            name: "autoCompounder",
            type: "address",
         },
      ],
      name: "NewBuilding",
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
            indexed: false,
            internalType: "address",
            name: "agent",
            type: "address",
         },
      ],
      name: "RegistryAgentRemoved",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: false,
            internalType: "address[]",
            name: "agents",
            type: "address[]",
         },
      ],
      name: "RegistryAgentsAdded",
      type: "event",
   },
   {
      inputs: [
         {
            internalType: "address[]",
            name: "agents",
            type: "address[]",
         },
      ],
      name: "addRegistryAgents",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "buildingAddress",
            type: "address",
         },
      ],
      name: "configNewBuilding",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "wallet",
            type: "address",
         },
      ],
      name: "deployIdentityForWallet",
      outputs: [
         {
            internalType: "address",
            name: "",
            type: "address",
         },
      ],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "buildingAddress",
            type: "address",
         },
      ],
      name: "getBuildingDetails",
      outputs: [
         {
            components: [
               {
                  internalType: "address",
                  name: "addr",
                  type: "address",
               },
               {
                  internalType: "uint256",
                  name: "nftId",
                  type: "uint256",
               },
               {
                  internalType: "string",
                  name: "tokenURI",
                  type: "string",
               },
               {
                  internalType: "address",
                  name: "auditRegistry",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "erc3643Token",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "treasury",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "governance",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "vault",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "autoCompounder",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "initialOwner",
                  type: "address",
               },
               {
                  internalType: "uint256",
                  name: "tokenMintAmount",
                  type: "uint256",
               },
               {
                  internalType: "bool",
                  name: "isConfigured",
                  type: "bool",
               },
            ],
            internalType: "struct BuildingFactoryStorage.BuildingDetails",
            name: "",
            type: "tuple",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "getBuildingList",
      outputs: [
         {
            components: [
               {
                  internalType: "address",
                  name: "addr",
                  type: "address",
               },
               {
                  internalType: "uint256",
                  name: "nftId",
                  type: "uint256",
               },
               {
                  internalType: "string",
                  name: "tokenURI",
                  type: "string",
               },
               {
                  internalType: "address",
                  name: "auditRegistry",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "erc3643Token",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "treasury",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "governance",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "vault",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "autoCompounder",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "initialOwner",
                  type: "address",
               },
               {
                  internalType: "uint256",
                  name: "tokenMintAmount",
                  type: "uint256",
               },
               {
                  internalType: "bool",
                  name: "isConfigured",
                  type: "bool",
               },
            ],
            internalType: "struct BuildingFactoryStorage.BuildingDetails[]",
            name: "",
            type: "tuple[]",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "wallet",
            type: "address",
         },
      ],
      name: "getIdentity",
      outputs: [
         {
            internalType: "contract IIdentity",
            name: "",
            type: "address",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "getRegistryAgents",
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
            components: [
               {
                  internalType: "address",
                  name: "nft",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "uniswapRouter",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "uniswapFactory",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "onchainIdGateway",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "trexGateway",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "usdc",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "buildingBeacon",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "treasuryBeacon",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "governanceBeacon",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "upkeeper",
                  type: "address",
               },
            ],
            internalType: "struct BuildingFactoryInit",
            name: "init",
            type: "tuple",
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
            components: [
               {
                  internalType: "string",
                  name: "tokenURI",
                  type: "string",
               },
               {
                  internalType: "string",
                  name: "tokenName",
                  type: "string",
               },
               {
                  internalType: "string",
                  name: "tokenSymbol",
                  type: "string",
               },
               {
                  internalType: "uint8",
                  name: "tokenDecimals",
                  type: "uint8",
               },
               {
                  internalType: "uint256",
                  name: "tokenMintAmount",
                  type: "uint256",
               },
               {
                  internalType: "uint256",
                  name: "treasuryReserveAmount",
                  type: "uint256",
               },
               {
                  internalType: "uint256",
                  name: "treasuryNPercent",
                  type: "uint256",
               },
               {
                  internalType: "string",
                  name: "governanceName",
                  type: "string",
               },
               {
                  internalType: "string",
                  name: "vaultShareTokenName",
                  type: "string",
               },
               {
                  internalType: "string",
                  name: "vaultShareTokenSymbol",
                  type: "string",
               },
               {
                  internalType: "address",
                  name: "vaultFeeReceiver",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "vaultFeeToken",
                  type: "address",
               },
               {
                  internalType: "uint256",
                  name: "vaultFeePercentage",
                  type: "uint256",
               },
               {
                  internalType: "uint32",
                  name: "vaultCliff",
                  type: "uint32",
               },
               {
                  internalType: "uint32",
                  name: "vaultUnlockDuration",
                  type: "uint32",
               },
               {
                  internalType: "string",
                  name: "aTokenName",
                  type: "string",
               },
               {
                  internalType: "string",
                  name: "aTokenSymbol",
                  type: "string",
               },
            ],
            internalType: "struct BuildingFactoryStorage.NewBuildingDetails",
            name: "details",
            type: "tuple",
         },
      ],
      name: "newBuilding",
      outputs: [
         {
            components: [
               {
                  internalType: "address",
                  name: "addr",
                  type: "address",
               },
               {
                  internalType: "uint256",
                  name: "nftId",
                  type: "uint256",
               },
               {
                  internalType: "string",
                  name: "tokenURI",
                  type: "string",
               },
               {
                  internalType: "address",
                  name: "auditRegistry",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "erc3643Token",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "treasury",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "governance",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "vault",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "autoCompounder",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "initialOwner",
                  type: "address",
               },
               {
                  internalType: "uint256",
                  name: "tokenMintAmount",
                  type: "uint256",
               },
               {
                  internalType: "bool",
                  name: "isConfigured",
                  type: "bool",
               },
            ],
            internalType: "struct BuildingFactoryStorage.BuildingDetails",
            name: "buildingDetails",
            type: "tuple",
         },
      ],
      stateMutability: "nonpayable",
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
            name: "buildingAddress",
            type: "address",
         },
         {
            internalType: "address",
            name: "wallet",
            type: "address",
         },
         {
            internalType: "uint16",
            name: "country",
            type: "uint16",
         },
      ],
      name: "registerIdentity",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "agent",
            type: "address",
         },
      ],
      name: "removeRegistryAgent",
      outputs: [],
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
];
