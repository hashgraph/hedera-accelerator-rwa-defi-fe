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
   name: string;
   description: string;
   allocation: number;
   sliceImageIpfsHash: string;
};

export type BuildingSliceData = {
   imageUrl?: string;
   name: string;
   description: string;
   symbol: string;
   allocation: number;
};

export type SliceData = {
   id: `0x${string}`;
   address: `0x${string}`;
   name: string;
   allocation: number;
   description: string;
   imageIpfsUrl: string;
   endDate: string;
   estimatedPrice: number;
};

export type SliceAllocation = {
   buildingToken: `0x${string}`;
   aToken: `0x${string}`;
   aTokenName: string;
   idealAllocation: number;
   actualAllocation: number;
};

export type BuildingSliceCategoryData = {
   id: number;
   name: string;
   title: string;
   itemsSize?: AvatarSize;
   items?: SliceData[];
};

export type BuildingToken = {
   tokenAddress: `0x${string}`;
   buildingAddress: `0x${string}`;
   items?: BuildingSliceData[];
};

type BulidingYield = {
   percentage: number;
   days: number;
};

export type BuildingInfo = {
   financial: {
      percentageOwned: number;
      tokenPrice: number;
      directExposure: number;
      yield: BulidingYield[];
      treasury: number;
   };
   demographics: {
      constructedYear: string;
      type: string;
      location: string;
      locationType: string;
      state?: string;
   };
};

export type BuildingData = {
   id: string | number;
   title: string;
   purchasedAt: number;
   description: string;
   info: BuildingInfo;
   voteItems: number[];
   partOfSlices: `0x${string}`[];
   imageUrl?: string;
   allocation: number;
   address?: `0x${string}`;
   cope?: CopeData;
};

export type BuildingNFTAttribute = {
   display_type: string;
   trait_type: string;
   value: string;
};

export type BuildingNFTData = {
   description: string;
   image: string;
   name: string;
   address: `0x${string}`;
   allocation: number;
   purchasedAt: number;
   attributes: BuildingNFTAttribute[];
   cope?: CopeData;
};

export type BuildingERCToken = {
   tokenAddress: string;
   idealAllocation: string;
   actualAllocation: string;
   building: {
      nftId?: number | null;
      name?: string;
      image?: string;
      location?: string;
   };
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

export type CreateSliceRequestBody = {
   name: string;
   description: string;
   sliceImageIpfsHash: string;
   symbol: string;
};

export type QueryData<ArgType> = {
   args: ArgType;
};

export type DeployAutoCompounderRequest = {
   tokenName: string;
   tokenSymbol: string;
   tokenAsset: string;
};

export type DeployVaultRequest = {
   stakingToken: string;
   shareTokenName: string;
   shareTokenSymbol: string;
   vaultRewardController: string;
   feeConfigController: string;
   feeReceiver: string;
   feeToken: string;
   feePercentage?: number;
};

export type AddAllocationRequest = {
   tokenAsset: string;
   allocation?: number;
};

export type SwapTradeProfit = {
   dailyProfitInUSD: number;
   weeklyProfitInUSD: number;
};

export type SwapUniswapTokensRequestBody = {
   path: string[];
   amountIn: bigint;
   amountOut: bigint;
   deadline?: number;
};

export type MintRequestPayload = {
  token: string;
  amount: string;
};

export type TradeFormPayload = {
  amount?: string;
  tokenA?: `0x${string}`;
  tokenB?: `0x${string}`;
  autoRevertsAfter: number;
};

export type SwapTradeItem = {
   tokenA: string;
   tokenB: string;
   tokenAAmount: string;
   tokenBAmount: string;
   id?: string;
};

export type SwapLiquidityPair = {
   tokenA: `0x${string}`;
   tokenB: `0x${string}`;
};

export type SwapTokenPriceRequestBody = {
   isSell: boolean;
   token: `0x${string}`;
   amount: bigint;
   thresholdIntervalInSeconds: number;
};

export type SwapTokenAddLiquidityRequestBody = {
   tokenA: string;
   tokenB?: string;
   amount: bigint;
};

export type SwapTokenSwapRequestBody = {
   tokenA: string;
   tokenB: string;
   amount: bigint;
};

export interface CopeData {
   construction: {
      materials?: string;
      yearBuilt?: string;
      roofType?: string;
      numFloors?: string;
   };
   occupancy: {
      type?: string;
      percentageOccupied?: string;
   };
   protection: {
      fire?: string;
      sprinklers?: string;
      security?: string;
   };
   exposure: {
      nearbyRisks?: string;
      floodZone?: string;
   };
}
