import type { AvatarSize } from "@/components/Avatars/ReusableAvatar";
import type { EvmAddress } from "@/types/common";

export type DeployTokenRequest = {
	name: string;
	symbol: string;
	decimals: number;
	complianceModules: EvmAddress[];
	complianceSettings: EvmAddress[];
};

export type SliceNFTData = {
	name?: string;
	description?: string;
	allocation?: number;
};

export type SliceData = {
	id: string;
	address: `0x${string}`;
	name: string;
	allocation?: number;
	description?: string;
	ipfsImageCopeHash?: string;
	timeToEnd?: number;
	estimatedPrice?: number;
};

export type BuildingSliceCategoryData = {
	id: number;
	name: string;
	title: string;
	itemsSize?: AvatarSize;
	items?: SliceData[];
};

type BulidingYield = {
	percentage: number;
	days: number;
};

export type BuildingInfo = {
	financial: {
		percentageOwned: number,
		tokenPrice: number;
		directExposure: number;
		yield: BulidingYield[];
		treasury: number;
	},
	demographics: {
		constructedYear: string;
		type: string;
		location: string;
		locationType: string;
	};
}

export type BuildingData = {
	id: string | number;
	title: string;
	purchasedAt: number;
	description: string;
	info: BuildingInfo;
	votingItems: number[];
	partOfSlices: (number | `0x${string}`)[];
	imageUrl?: string;
	allocation: number;
	// todo: after mock removal `const/buildings` change those to required.
	address?: `0x${string}`;
	copeIpfsHash?: string;
};

export type BuildingNFTAttribute = {
	display_type: string,
	trait_type: string,
	value: string
};

export type BuildingNFTData = {
	description: string;
	image: string;
	name: string;
	address: `0x${string}`;
	allocation: number;
	purchasedAt: number;
	attributes: BuildingNFTAttribute[];
	copeIpfsHash: string;
};

export type VotingItem = {
	id: number;
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	userHasVoted: boolean;
};

export type CreateERC3643RequestBody = {
	tokenName: string;
	tokenSymbol: string;
	tokenDecimals: number;
};

export type CreateSliceRequestBody = SliceNFTData;

export type QueryData<ArgType> = {
	args: ArgType;
};

export type DeployAutoCompounderRequest = {
	tokenName: string;
	tokenSymbol: string;
};

export type DeployVaultRequest = {
	stakingToken: string;
	shareTokenName: string;
	shareTokenSymbol: string;
	vaultRewardController: string;
	feeConfigController: string;
	receiver: string;
	token: string;
	feePercentage: bigint;
};
