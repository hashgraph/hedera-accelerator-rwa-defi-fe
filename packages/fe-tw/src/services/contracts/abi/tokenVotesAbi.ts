import { Abi } from "viem";

export const tokenVotesAbi = [
   {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
   },
   {
      inputs: [],
      name: "CheckpointUnorderedInsertion",
      type: "error",
   },
   {
      inputs: [],
      name: "ECDSAInvalidSignature",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "length",
            type: "uint256",
         },
      ],
      name: "ECDSAInvalidSignatureLength",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "bytes32",
            name: "s",
            type: "bytes32",
         },
      ],
      name: "ECDSAInvalidSignatureS",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "increasedSupply",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "cap",
            type: "uint256",
         },
      ],
      name: "ERC20ExceededSafeSupply",
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
            internalType: "uint256",
            name: "timepoint",
            type: "uint256",
         },
         {
            internalType: "uint48",
            name: "clock",
            type: "uint48",
         },
      ],
      name: "ERC5805FutureLookup",
      type: "error",
   },
   {
      inputs: [],
      name: "ERC6372InconsistentClock",
      type: "error",
   },
   {
      inputs: [],
      name: "EnforcedPause",
      type: "error",
   },
   {
      inputs: [],
      name: "ExpectedPause",
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
            internalType: "uint256",
            name: "currentNonce",
            type: "uint256",
         },
      ],
      name: "InvalidAccountNonce",
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
            internalType: "uint8",
            name: "bits",
            type: "uint8",
         },
         {
            internalType: "uint256",
            name: "value",
            type: "uint256",
         },
      ],
      name: "SafeCastOverflowedUintDowncast",
      type: "error",
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "expiry",
            type: "uint256",
         },
      ],
      name: "VotesExpiredSignature",
      type: "error",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "_userAddress",
            type: "address",
         },
         {
            indexed: true,
            internalType: "bool",
            name: "_isFrozen",
            type: "bool",
         },
         {
            indexed: true,
            internalType: "address",
            name: "_owner",
            type: "address",
         },
      ],
      name: "AddressFrozen",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "_agent",
            type: "address",
         },
      ],
      name: "AgentAdded",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "_agent",
            type: "address",
         },
      ],
      name: "AgentRemoved",
      type: "event",
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
            name: "_compliance",
            type: "address",
         },
      ],
      name: "ComplianceAdded",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "delegator",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "fromDelegate",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "toDelegate",
            type: "address",
         },
      ],
      name: "DelegateChanged",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "delegate",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "previousVotes",
            type: "uint256",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "newVotes",
            type: "uint256",
         },
      ],
      name: "DelegateVotesChanged",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [],
      name: "EIP712DomainChanged",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "_identityRegistry",
            type: "address",
         },
      ],
      name: "IdentityRegistryAdded",
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
            name: "account",
            type: "address",
         },
      ],
      name: "Paused",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "_lostWallet",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "_newWallet",
            type: "address",
         },
         {
            indexed: true,
            internalType: "address",
            name: "_investorOnchainID",
            type: "address",
         },
      ],
      name: "RecoverySuccess",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "_userAddress",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "_amount",
            type: "uint256",
         },
      ],
      name: "TokensFrozen",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "_userAddress",
            type: "address",
         },
         {
            indexed: false,
            internalType: "uint256",
            name: "_amount",
            type: "uint256",
         },
      ],
      name: "TokensUnfrozen",
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
            indexed: false,
            internalType: "address",
            name: "account",
            type: "address",
         },
      ],
      name: "Unpaused",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "string",
            name: "_newName",
            type: "string",
         },
         {
            indexed: true,
            internalType: "string",
            name: "_newSymbol",
            type: "string",
         },
         {
            indexed: false,
            internalType: "uint8",
            name: "_newDecimals",
            type: "uint8",
         },
         {
            indexed: false,
            internalType: "string",
            name: "_newVersion",
            type: "string",
         },
         {
            indexed: true,
            internalType: "address",
            name: "_newOnchainID",
            type: "address",
         },
      ],
      name: "UpdatedTokenInformation",
      type: "event",
   },
   {
      inputs: [],
      name: "CLOCK_MODE",
      outputs: [
         {
            internalType: "string",
            name: "",
            type: "string",
         },
      ],
      stateMutability: "pure",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "_agent",
            type: "address",
         },
      ],
      name: "addAgent",
      outputs: [],
      stateMutability: "nonpayable",
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
            internalType: "address[]",
            name: "_userAddresses",
            type: "address[]",
         },
         {
            internalType: "uint256[]",
            name: "_amounts",
            type: "uint256[]",
         },
      ],
      name: "batchBurn",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address[]",
            name: "_fromList",
            type: "address[]",
         },
         {
            internalType: "address[]",
            name: "_toList",
            type: "address[]",
         },
         {
            internalType: "uint256[]",
            name: "_amounts",
            type: "uint256[]",
         },
      ],
      name: "batchForcedTransfer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address[]",
            name: "_userAddresses",
            type: "address[]",
         },
         {
            internalType: "uint256[]",
            name: "_amounts",
            type: "uint256[]",
         },
      ],
      name: "batchFreezePartialTokens",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address[]",
            name: "_toList",
            type: "address[]",
         },
         {
            internalType: "uint256[]",
            name: "_amounts",
            type: "uint256[]",
         },
      ],
      name: "batchMint",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address[]",
            name: "_userAddresses",
            type: "address[]",
         },
         {
            internalType: "bool[]",
            name: "_freeze",
            type: "bool[]",
         },
      ],
      name: "batchSetAddressFrozen",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address[]",
            name: "_toList",
            type: "address[]",
         },
         {
            internalType: "uint256[]",
            name: "_amounts",
            type: "uint256[]",
         },
      ],
      name: "batchTransfer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address[]",
            name: "_userAddresses",
            type: "address[]",
         },
         {
            internalType: "uint256[]",
            name: "_amounts",
            type: "uint256[]",
         },
      ],
      name: "batchUnfreezePartialTokens",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "_userAddress",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "_amount",
            type: "uint256",
         },
      ],
      name: "burn",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "account",
            type: "address",
         },
         {
            internalType: "uint32",
            name: "pos",
            type: "uint32",
         },
      ],
      name: "checkpoints",
      outputs: [
         {
            components: [
               {
                  internalType: "uint48",
                  name: "_key",
                  type: "uint48",
               },
               {
                  internalType: "uint208",
                  name: "_value",
                  type: "uint208",
               },
            ],
            internalType: "struct Checkpoints.Checkpoint208",
            name: "",
            type: "tuple",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "clock",
      outputs: [
         {
            internalType: "uint48",
            name: "",
            type: "uint48",
         },
      ],
      stateMutability: "view",
      type: "function",
   },
   {
      inputs: [],
      name: "compliance",
      outputs: [
         {
            internalType: "contract IModularCompliance",
            name: "",
            type: "address",
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
            internalType: "address",
            name: "_spender",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "_decreasedValue",
            type: "uint256",
         },
      ],
      name: "decreaseAllowance",
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
            name: "delegatee",
            type: "address",
         },
      ],
      name: "delegate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "delegatee",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
         },
         {
            internalType: "uint256",
            name: "expiry",
            type: "uint256",
         },
         {
            internalType: "uint8",
            name: "v",
            type: "uint8",
         },
         {
            internalType: "bytes32",
            name: "r",
            type: "bytes32",
         },
         {
            internalType: "bytes32",
            name: "s",
            type: "bytes32",
         },
      ],
      name: "delegateBySig",
      outputs: [],
      stateMutability: "nonpayable",
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
      name: "delegates",
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
      name: "eip712Domain",
      outputs: [
         {
            internalType: "bytes1",
            name: "fields",
            type: "bytes1",
         },
         {
            internalType: "string",
            name: "name",
            type: "string",
         },
         {
            internalType: "string",
            name: "version",
            type: "string",
         },
         {
            internalType: "uint256",
            name: "chainId",
            type: "uint256",
         },
         {
            internalType: "address",
            name: "verifyingContract",
            type: "address",
         },
         {
            internalType: "bytes32",
            name: "salt",
            type: "bytes32",
         },
         {
            internalType: "uint256[]",
            name: "extensions",
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
            name: "_from",
            type: "address",
         },
         {
            internalType: "address",
            name: "_to",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "_amount",
            type: "uint256",
         },
      ],
      name: "forcedTransfer",
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
            name: "_userAddress",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "_amount",
            type: "uint256",
         },
      ],
      name: "freezePartialTokens",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "_userAddress",
            type: "address",
         },
      ],
      name: "getFrozenTokens",
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
            name: "timepoint",
            type: "uint256",
         },
      ],
      name: "getPastTotalSupply",
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
            name: "account",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "timepoint",
            type: "uint256",
         },
      ],
      name: "getPastVotes",
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
            name: "account",
            type: "address",
         },
      ],
      name: "getVotes",
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
      name: "identityRegistry",
      outputs: [
         {
            internalType: "contract IIdentityRegistry",
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
            name: "_spender",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "_addedValue",
            type: "uint256",
         },
      ],
      name: "increaseAllowance",
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
            name: "_identityRegistry",
            type: "address",
         },
         {
            internalType: "address",
            name: "_compliance",
            type: "address",
         },
         {
            internalType: "string",
            name: "_tokenName",
            type: "string",
         },
         {
            internalType: "string",
            name: "_tokenSymbol",
            type: "string",
         },
         {
            internalType: "uint8",
            name: "_tokenDecimals",
            type: "uint8",
         },
         {
            internalType: "address",
            name: "_onchainID",
            type: "address",
         },
      ],
      name: "init",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "_agent",
            type: "address",
         },
      ],
      name: "isAgent",
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
            name: "_userAddress",
            type: "address",
         },
      ],
      name: "isFrozen",
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
            name: "_to",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "_amount",
            type: "uint256",
         },
      ],
      name: "mint",
      outputs: [],
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
      inputs: [
         {
            internalType: "address",
            name: "owner",
            type: "address",
         },
      ],
      name: "nonces",
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
            name: "account",
            type: "address",
         },
      ],
      name: "numCheckpoints",
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
      inputs: [],
      name: "onchainID",
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
      name: "pause",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [],
      name: "paused",
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
            name: "_lostWallet",
            type: "address",
         },
         {
            internalType: "address",
            name: "_newWallet",
            type: "address",
         },
         {
            internalType: "address",
            name: "_investorOnchainID",
            type: "address",
         },
      ],
      name: "recoveryAddress",
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
            name: "_agent",
            type: "address",
         },
      ],
      name: "removeAgent",
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
            name: "_userAddress",
            type: "address",
         },
         {
            internalType: "bool",
            name: "_freeze",
            type: "bool",
         },
      ],
      name: "setAddressFrozen",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "_compliance",
            type: "address",
         },
      ],
      name: "setCompliance",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "_identityRegistry",
            type: "address",
         },
      ],
      name: "setIdentityRegistry",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "string",
            name: "_tokenName",
            type: "string",
         },
      ],
      name: "setName",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "_onchainID",
            type: "address",
         },
      ],
      name: "setOnchainID",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "string",
            name: "_tokenSymbol",
            type: "string",
         },
      ],
      name: "setSymbol",
      outputs: [],
      stateMutability: "nonpayable",
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
            name: "_to",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "_amount",
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
            name: "_from",
            type: "address",
         },
         {
            internalType: "address",
            name: "_to",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "_amount",
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
            name: "_userAddress",
            type: "address",
         },
         {
            internalType: "uint256",
            name: "_amount",
            type: "uint256",
         },
      ],
      name: "unfreezePartialTokens",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [],
      name: "unpause",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [],
      name: "version",
      outputs: [
         {
            internalType: "string",
            name: "",
            type: "string",
         },
      ],
      stateMutability: "pure",
      type: "function",
   },
] as const satisfies Abi;
