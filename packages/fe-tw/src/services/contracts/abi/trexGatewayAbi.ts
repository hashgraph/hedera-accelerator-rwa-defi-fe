export const trexGatewayAbi = [
   {
      type: "constructor",
      inputs: [
         { name: "factory", internalType: "address", type: "address" },
         { name: "publicDeploymentStatus", internalType: "bool", type: "bool" },
      ],
      stateMutability: "nonpayable",
   },
   {
      type: "error",
      inputs: [{ name: "lengthLimit", internalType: "uint16", type: "uint16" }],
      name: "BatchMaxLengthExceeded",
   },
   {
      type: "error",
      inputs: [{ name: "deployer", internalType: "address", type: "address" }],
      name: "DeployerAlreadyExists",
   },
   {
      type: "error",
      inputs: [{ name: "deployer", internalType: "address", type: "address" }],
      name: "DeployerDoesNotExist",
   },
   { type: "error", inputs: [], name: "DeploymentFeesAlreadyDisabled" },
   { type: "error", inputs: [], name: "DeploymentFeesAlreadyEnabled" },
   { type: "error", inputs: [], name: "DiscountOutOfRange" },
   { type: "error", inputs: [], name: "OnlyAdminCall" },
   {
      type: "error",
      inputs: [{ name: "owner", internalType: "address", type: "address" }],
      name: "OwnableInvalidOwner",
   },
   {
      type: "error",
      inputs: [{ name: "account", internalType: "address", type: "address" }],
      name: "OwnableUnauthorizedAccount",
   },
   { type: "error", inputs: [], name: "PublicCannotDeployOnBehalf" },
   { type: "error", inputs: [], name: "PublicDeploymentAlreadyDisabled" },
   { type: "error", inputs: [], name: "PublicDeploymentAlreadyEnabled" },
   { type: "error", inputs: [], name: "PublicDeploymentsNotAllowed" },
   {
      type: "error",
      inputs: [
         { name: "value", internalType: "uint256", type: "uint256" },
         { name: "length", internalType: "uint256", type: "uint256" },
      ],
      name: "StringsInsufficientHexLength",
   },
   { type: "error", inputs: [], name: "ZeroAddress" },
   {
      type: "event",
      anonymous: false,
      inputs: [
         {
            name: "_agent",
            internalType: "address",
            type: "address",
            indexed: true,
         },
      ],
      name: "AgentAdded",
   },
   {
      type: "event",
      anonymous: false,
      inputs: [
         {
            name: "_agent",
            internalType: "address",
            type: "address",
            indexed: true,
         },
      ],
      name: "AgentRemoved",
   },
   {
      type: "event",
      anonymous: false,
      inputs: [
         {
            name: "deployer",
            internalType: "address",
            type: "address",
            indexed: true,
         },
      ],
      name: "DeployerAdded",
   },
   {
      type: "event",
      anonymous: false,
      inputs: [
         {
            name: "deployer",
            internalType: "address",
            type: "address",
            indexed: true,
         },
      ],
      name: "DeployerRemoved",
   },
   {
      type: "event",
      anonymous: false,
      inputs: [{ name: "isEnabled", internalType: "bool", type: "bool", indexed: true }],
      name: "DeploymentFeeEnabled",
   },
   {
      type: "event",
      anonymous: false,
      inputs: [
         { name: "fee", internalType: "uint256", type: "uint256", indexed: true },
         {
            name: "feeToken",
            internalType: "address",
            type: "address",
            indexed: true,
         },
         {
            name: "feeCollector",
            internalType: "address",
            type: "address",
            indexed: true,
         },
      ],
      name: "DeploymentFeeSet",
   },
   {
      type: "event",
      anonymous: false,
      inputs: [
         {
            name: "factory",
            internalType: "address",
            type: "address",
            indexed: true,
         },
      ],
      name: "FactorySet",
   },
   {
      type: "event",
      anonymous: false,
      inputs: [
         {
            name: "deployer",
            internalType: "address",
            type: "address",
            indexed: true,
         },
         {
            name: "discount",
            internalType: "uint16",
            type: "uint16",
            indexed: false,
         },
      ],
      name: "FeeDiscountApplied",
   },
   {
      type: "event",
      anonymous: false,
      inputs: [
         {
            name: "requester",
            internalType: "address",
            type: "address",
            indexed: true,
         },
         {
            name: "intendedOwner",
            internalType: "address",
            type: "address",
            indexed: false,
         },
         {
            name: "feeApplied",
            internalType: "uint256",
            type: "uint256",
            indexed: false,
         },
      ],
      name: "GatewaySuiteDeploymentProcessed",
   },
   {
      type: "event",
      anonymous: false,
      inputs: [
         {
            name: "previousOwner",
            internalType: "address",
            type: "address",
            indexed: true,
         },
         {
            name: "newOwner",
            internalType: "address",
            type: "address",
            indexed: true,
         },
      ],
      name: "OwnershipTransferred",
   },
   {
      type: "event",
      anonymous: false,
      inputs: [
         {
            name: "publicDeploymentStatus",
            internalType: "bool",
            type: "bool",
            indexed: true,
         },
      ],
      name: "PublicDeploymentStatusSet",
   },
   {
      type: "function",
      inputs: [{ name: "_agent", internalType: "address", type: "address" }],
      name: "addAgent",
      outputs: [],
      stateMutability: "nonpayable",
   },
   {
      type: "function",
      inputs: [{ name: "deployer", internalType: "address", type: "address" }],
      name: "addDeployer",
      outputs: [],
      stateMutability: "nonpayable",
   },
   {
      type: "function",
      inputs: [
         { name: "deployer", internalType: "address", type: "address" },
         { name: "discount", internalType: "uint16", type: "uint16" },
      ],
      name: "applyFeeDiscount",
      outputs: [],
      stateMutability: "nonpayable",
   },
   {
      type: "function",
      inputs: [{ name: "deployers", internalType: "address[]", type: "address[]" }],
      name: "batchAddDeployer",
      outputs: [],
      stateMutability: "nonpayable",
   },
   {
      type: "function",
      inputs: [
         { name: "deployers", internalType: "address[]", type: "address[]" },
         { name: "discounts", internalType: "uint16[]", type: "uint16[]" },
      ],
      name: "batchApplyFeeDiscount",
      outputs: [],
      stateMutability: "nonpayable",
   },
   {
      type: "function",
      inputs: [
         {
            name: "_tokenDetails",
            internalType: "struct ITREXFactory.TokenDetails[]",
            type: "tuple[]",
            components: [
               { name: "owner", internalType: "address", type: "address" },
               { name: "name", internalType: "string", type: "string" },
               { name: "symbol", internalType: "string", type: "string" },
               { name: "decimals", internalType: "uint8", type: "uint8" },
               { name: "irs", internalType: "address", type: "address" },
               { name: "ONCHAINID", internalType: "address", type: "address" },
               { name: "irAgents", internalType: "address[]", type: "address[]" },
               { name: "tokenAgents", internalType: "address[]", type: "address[]" },
               {
                  name: "complianceModules",
                  internalType: "address[]",
                  type: "address[]",
               },
               {
                  name: "complianceSettings",
                  internalType: "bytes[]",
                  type: "bytes[]",
               },
            ],
         },
         {
            name: "_claimDetails",
            internalType: "struct ITREXFactory.ClaimDetails[]",
            type: "tuple[]",
            components: [
               { name: "claimTopics", internalType: "uint256[]", type: "uint256[]" },
               { name: "issuers", internalType: "address[]", type: "address[]" },
               {
                  name: "issuerClaims",
                  internalType: "uint256[][]",
                  type: "uint256[][]",
               },
            ],
         },
      ],
      name: "batchDeployTREXSuite",
      outputs: [],
      stateMutability: "nonpayable",
   },
   {
      type: "function",
      inputs: [{ name: "deployers", internalType: "address[]", type: "address[]" }],
      name: "batchRemoveDeployer",
      outputs: [],
      stateMutability: "nonpayable",
   },
   {
      type: "function",
      inputs: [{ name: "deployer", internalType: "address", type: "address" }],
      name: "calculateFee",
      outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
      stateMutability: "view",
   },
   {
      type: "function",
      inputs: [
         {
            name: "_tokenDetails",
            internalType: "struct ITREXFactory.TokenDetails",
            type: "tuple",
            components: [
               { name: "owner", internalType: "address", type: "address" },
               { name: "name", internalType: "string", type: "string" },
               { name: "symbol", internalType: "string", type: "string" },
               { name: "decimals", internalType: "uint8", type: "uint8" },
               { name: "irs", internalType: "address", type: "address" },
               { name: "ONCHAINID", internalType: "address", type: "address" },
               { name: "irAgents", internalType: "address[]", type: "address[]" },
               { name: "tokenAgents", internalType: "address[]", type: "address[]" },
               {
                  name: "complianceModules",
                  internalType: "address[]",
                  type: "address[]",
               },
               {
                  name: "complianceSettings",
                  internalType: "bytes[]",
                  type: "bytes[]",
               },
            ],
         },
         {
            name: "_claimDetails",
            internalType: "struct ITREXFactory.ClaimDetails",
            type: "tuple",
            components: [
               { name: "claimTopics", internalType: "uint256[]", type: "uint256[]" },
               { name: "issuers", internalType: "address[]", type: "address[]" },
               {
                  name: "issuerClaims",
                  internalType: "uint256[][]",
                  type: "uint256[][]",
               },
            ],
         },
      ],
      name: "deployTREXSuite",
      outputs: [],
      stateMutability: "nonpayable",
   },
   {
      type: "function",
      inputs: [{ name: "_isEnabled", internalType: "bool", type: "bool" }],
      name: "enableDeploymentFee",
      outputs: [],
      stateMutability: "nonpayable",
   },
   {
      type: "function",
      inputs: [],
      name: "getDeploymentFee",
      outputs: [
         {
            name: "",
            internalType: "struct ITREXGateway.Fee",
            type: "tuple",
            components: [
               { name: "fee", internalType: "uint256", type: "uint256" },
               { name: "feeToken", internalType: "address", type: "address" },
               { name: "feeCollector", internalType: "address", type: "address" },
            ],
         },
      ],
      stateMutability: "view",
   },
   {
      type: "function",
      inputs: [],
      name: "getFactory",
      outputs: [{ name: "", internalType: "address", type: "address" }],
      stateMutability: "view",
   },
   {
      type: "function",
      inputs: [],
      name: "getPublicDeploymentStatus",
      outputs: [{ name: "", internalType: "bool", type: "bool" }],
      stateMutability: "view",
   },
   {
      type: "function",
      inputs: [{ name: "_agent", internalType: "address", type: "address" }],
      name: "isAgent",
      outputs: [{ name: "", internalType: "bool", type: "bool" }],
      stateMutability: "view",
   },
   {
      type: "function",
      inputs: [{ name: "deployer", internalType: "address", type: "address" }],
      name: "isDeployer",
      outputs: [{ name: "", internalType: "bool", type: "bool" }],
      stateMutability: "view",
   },
   {
      type: "function",
      inputs: [],
      name: "isDeploymentFeeEnabled",
      outputs: [{ name: "", internalType: "bool", type: "bool" }],
      stateMutability: "view",
   },
   {
      type: "function",
      inputs: [],
      name: "owner",
      outputs: [{ name: "", internalType: "address", type: "address" }],
      stateMutability: "view",
   },
   {
      type: "function",
      inputs: [{ name: "_agent", internalType: "address", type: "address" }],
      name: "removeAgent",
      outputs: [],
      stateMutability: "nonpayable",
   },
   {
      type: "function",
      inputs: [{ name: "deployer", internalType: "address", type: "address" }],
      name: "removeDeployer",
      outputs: [],
      stateMutability: "nonpayable",
   },
   {
      type: "function",
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
   },
   {
      type: "function",
      inputs: [
         { name: "_fee", internalType: "uint256", type: "uint256" },
         { name: "_feeToken", internalType: "address", type: "address" },
         { name: "_feeCollector", internalType: "address", type: "address" },
      ],
      name: "setDeploymentFee",
      outputs: [],
      stateMutability: "nonpayable",
   },
   {
      type: "function",
      inputs: [{ name: "factory", internalType: "address", type: "address" }],
      name: "setFactory",
      outputs: [],
      stateMutability: "nonpayable",
   },
   {
      type: "function",
      inputs: [{ name: "_isEnabled", internalType: "bool", type: "bool" }],
      name: "setPublicDeploymentStatus",
      outputs: [],
      stateMutability: "nonpayable",
   },
   {
      type: "function",
      inputs: [{ name: "_newOwner", internalType: "address", type: "address" }],
      name: "transferFactoryOwnership",
      outputs: [],
      stateMutability: "nonpayable",
   },
   {
      type: "function",
      inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
   },
] as const;
