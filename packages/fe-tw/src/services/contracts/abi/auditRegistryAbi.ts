export const auditRegistryAbi = [
	{
		inputs: [
			{
				internalType: "address",
				name: "_buildingNFTAddress",
				type: "address",
			},
		],
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
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "auditRecordId",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "buildingId",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "address",
				name: "auditor",
				type: "address",
			},
			{
				indexed: false,
				internalType: "string",
				name: "ipfsHash",
				type: "string",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
		],
		name: "AuditRecordAdded",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "auditRecordId",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
		],
		name: "AuditRecordRevoked",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "auditRecordId",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "string",
				name: "newIpfsHash",
				type: "string",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
		],
		name: "AuditRecordUpdated",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "auditor",
				type: "address",
			},
		],
		name: "AuditorAdded",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "auditor",
				type: "address",
			},
		],
		name: "AuditorRemoved",
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
		name: "AUDITOR_ROLE",
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
		inputs: [
			{
				internalType: "uint256",
				name: "_buildingId",
				type: "uint256",
			},
			{
				internalType: "string",
				name: "_ipfsHash",
				type: "string",
			},
		],
		name: "addAuditRecord",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "_auditor",
				type: "address",
			},
		],
		name: "addAuditor",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "auditRecordCounter",
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
				name: "",
				type: "uint256",
			},
		],
		name: "auditRecords",
		outputs: [
			{
				internalType: "uint256",
				name: "buildingId",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "auditor",
				type: "address",
			},
			{
				internalType: "string",
				name: "ipfsHash",
				type: "string",
			},
			{
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
			{
				internalType: "bool",
				name: "revoked",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
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
		name: "buildingAuditRecords",
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
		name: "buildingNFT",
		outputs: [
			{
				internalType: "contract IERC721",
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
				name: "_auditRecordId",
				type: "uint256",
			},
		],
		name: "getAuditRecordDetails",
		outputs: [
			{
				components: [
					{
						internalType: "uint256",
						name: "buildingId",
						type: "uint256",
					},
					{
						internalType: "address",
						name: "auditor",
						type: "address",
					},
					{
						internalType: "string",
						name: "ipfsHash",
						type: "string",
					},
					{
						internalType: "uint256",
						name: "timestamp",
						type: "uint256",
					},
					{
						internalType: "bool",
						name: "revoked",
						type: "bool",
					},
				],
				internalType: "struct AuditRegistry.AuditRecord",
				name: "",
				type: "tuple",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_buildingId",
				type: "uint256",
			},
		],
		name: "getAuditRecordsByBuilding",
		outputs: [
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
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
				name: "_auditor",
				type: "address",
			},
		],
		name: "removeAuditor",
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
				internalType: "uint256",
				name: "_auditRecordId",
				type: "uint256",
			},
		],
		name: "revokeAuditRecord",
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
				internalType: "uint256",
				name: "_auditRecordId",
				type: "uint256",
			},
			{
				internalType: "string",
				name: "_newIpfsHash",
				type: "string",
			},
		],
		name: "updateAuditRecord",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
];
