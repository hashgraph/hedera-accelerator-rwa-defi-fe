import type { Abi } from "viem";

export const modularComplianceAbi = [
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
            name: "_module",
            type: "address",
         },
      ],
      name: "ModuleAdded",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "target",
            type: "address",
         },
         {
            indexed: false,
            internalType: "bytes4",
            name: "selector",
            type: "bytes4",
         },
      ],
      name: "ModuleInteraction",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "_module",
            type: "address",
         },
      ],
      name: "ModuleRemoved",
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
            name: "_token",
            type: "address",
         },
      ],
      name: "TokenBound",
      type: "event",
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: false,
            internalType: "address",
            name: "_token",
            type: "address",
         },
      ],
      name: "TokenUnbound",
      type: "event",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "_module",
            type: "address",
         },
      ],
      name: "addModule",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "_token",
            type: "address",
         },
      ],
      name: "bindToken",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
         },
         {
            internalType: "address",
            name: "_module",
            type: "address",
         },
      ],
      name: "callModuleFunction",
      outputs: [],
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
            name: "_value",
            type: "uint256",
         },
      ],
      name: "canTransfer",
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
            name: "_value",
            type: "uint256",
         },
      ],
      name: "created",
      outputs: [],
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
            internalType: "uint256",
            name: "_value",
            type: "uint256",
         },
      ],
      name: "destroyed",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [],
      name: "getModules",
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
      name: "getTokenBound",
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
      name: "init",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "_module",
            type: "address",
         },
      ],
      name: "isModuleBound",
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
            name: "_module",
            type: "address",
         },
      ],
      name: "removeModule",
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
            name: "_value",
            type: "uint256",
         },
      ],
      name: "transferred",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "_token",
            type: "address",
         },
      ],
      name: "unbindToken",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
   },
] as const satisfies Abi;
