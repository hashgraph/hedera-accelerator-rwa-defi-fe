import { Abi } from "viem";

export const sliceFactoryAbi = [
   {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
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
            name: "slice",
            type: "address",
         },
         {
            indexed: false,
            internalType: "address",
            name: "uniswapRouter",
            type: "address",
         },
         {
            indexed: false,
            internalType: "address",
            name: "usdc",
            type: "address",
         },
      ],
      name: "SliceDeployed",
      type: "event",
   },
   {
      inputs: [
         {
            internalType: "string",
            name: "salt",
            type: "string",
         },
         {
            components: [
               {
                  internalType: "address",
                  name: "uniswapRouter",
                  type: "address",
               },
               {
                  internalType: "address",
                  name: "usdc",
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
                  internalType: "string",
                  name: "metadataUri",
                  type: "string",
               },
            ],
            internalType: "struct ISliceFactory.SliceDetails",
            name: "sliceDetails",
            type: "tuple",
         },
      ],
      name: "deploySlice",
      outputs: [
         {
            internalType: "address",
            name: "slice",
            type: "address",
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
] as const satisfies Abi;
