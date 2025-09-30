export const autoCompounderFactoryAbi = [
   {
      inputs: [
         {
            internalType: "contract IUniswapV2Router02",
            name: "_defaultUniswapRouter",
            type: "address",
         },
         {
            internalType: "address",
            name: "_defaultIntermediateToken",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "_defaultMinimumClaimThreshold",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "_defaultMaxSlippage",
            type: "uint256",
         },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
   },
   {
      inputs: [],
      name: "AutoCompounderAlreadyExists",
      type: "error",
   },
   {
      inputs: [],
      name: "AutoCompounderNotFound",
      type: "error",
   },
   {
      inputs: [],
      name: "InvalidParameters",
      type: "error",
   },
   {
      inputs: [],
      name: "InvalidRouter",
      type: "error",
   },
   {
      inputs: [],
      name: "InvalidSlippage",
      type: "error",
   },
   {
      inputs: [],
      name: "InvalidVault",
      type: "error",
   },
   {
      inputs: [],
      name: "NotOwner",
      type: "error",
   },
   {
      inputs: [],
      name: "ZeroAddress",
      type: "error",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "autoCompounder",
            type: "address",
         },
      ],
      name: "AutoCompounderDeactivated",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "autoCompounder",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "vault",
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
      ],
      name: "AutoCompounderDeployed",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "autoCompounder",
            type: "address",
         },
      ],
      name: "AutoCompounderReactivated",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: false,
            internalType: "uint256",
            name: "minimumClaimThreshold",
            type: "uint256",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "maxSlippage",
            type: "uint256",
         },
      ],
      name: "DefaultParametersUpdated",
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
      inputs: [],
      name: "DEFAULT_INTERMEDIATE_TOKEN",
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
      name: "DEFAULT_UNISWAP_ROUTER",
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
      inputs: [
         {
            internalType: "address",
            name: "",
            type: "address",
         },
      ],
      name: "autoCompounderInfo",
      outputs: [
         {
            internalType: "address",
            name: "vault",
            type: "address",
         },
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
            internalType: "uint256",
            name: "deploymentTimestamp",
            type: "uint256",
         },
         {
            internalType: "address",
            name: "deployer",
            type: "address",
         },
         {
            internalType: "bool",
            name: "isActive",
            type: "bool",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address[]",
            name: "autoCompounders",
            type: "address[]",
         },
         {
            internalType: "address[]",
            name: "rewardTokens",
            type: "address[]",
         },
         {
            internalType: "address[][]",
            name: "paths",
            type: "address[][]",
         },
      ],
      name: "batchConfigureSwapPaths",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "autoCompounder",
            type: "address",
         },
      ],
      name: "deactivateAutoCompounder",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [],
      name: "defaultMaxSlippage",
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
      name: "defaultMinimumClaimThreshold",
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
            internalType: "contract RewardsVault4626",
            name: "vault",
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
      ],
      name: "deployAutoCompounder",
      outputs: [
         {
            internalType: "address",
            name: "autoCompounder",
            type: "address",
         },
      ],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            components: [
               {
                  internalType: "contract RewardsVault4626",
                  name: "vault",
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
                  internalType: "uint256",
                  name: "minimumClaimThreshold",
                  type: "uint256",
               },
               {
                  internalType: "contract IUniswapV2Router02",
                  name: "uniswapRouter",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "intermediateToken",
                  type: "address",
               },
               {
                  internalType: "uint256",
                  name: "maxSlippage",
                  type: "uint256",
               },
            ],
            internalType: "struct RewardsVaultAutoCompounderFactory.DeploymentParams",
            name: "params",
            type: "tuple",
         },
      ],
      name: "deployAutoCompounderWithParams",
      outputs: [
         {
            internalType: "address",
            name: "autoCompounder",
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
      name: "deployedAutoCompounders",
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
      name: "getActiveAutoCompounders",
      outputs: [
         {
            internalType: "address[]",
            name: "active",
            type: "address[]",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "getAllDeployedAutoCompounders",
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
            name: "vault",
            type: "address",
         },
      ],
      name: "getAutoCompounderForVault",
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
            name: "autoCompounder",
            type: "address",
         },
      ],
      name: "getAutoCompounderInfo",
      outputs: [
         {
            components: [
               {
                  internalType: "address",
                  name: "vault",
                  type: "address",
               },
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
                  internalType: "uint256",
                  name: "deploymentTimestamp",
                  type: "uint256",
               },
               {
                  internalType: "address",
                  name: "deployer",
                  type: "address",
               },
               {
                  internalType: "bool",
                  name: "isActive",
                  type: "bool",
               },
            ],
            internalType: "struct RewardsVaultAutoCompounderFactory.AutoCompounderInfo",
            name: "",
            type: "tuple",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "getDeployedAutoCompounderCount",
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
      name: "getFactoryStatistics",
      outputs: [
         {
            internalType: "uint256",
            name: "totalDeployed",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "totalActive",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "totalAssets",
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
            name: "autoCompounder",
            type: "address",
         },
      ],
      name: "isFactoryDeployed",
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
            name: "autoCompounder",
            type: "address",
         },
      ],
      name: "reactivateAutoCompounder",
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
            internalType: "uint256",
            name: "newMinimumClaimThreshold",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "newMaxSlippage",
            type: "uint256",
         },
      ],
      name: "updateDefaultParameters",
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
      name: "vaultToAutoCompounder",
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
