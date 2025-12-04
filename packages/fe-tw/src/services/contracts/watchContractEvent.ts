import { ethers } from "ethers";
import type { Abi, ContractEventName } from "viem";
import type {
   WatchContractEventParameters as viem_WatchContractEventParameters,
   WatchContractEventReturnType as viem_WatchContractEventReturnType,
} from "viem/actions";

// Raw log data from the Hedera mirror node
export type RawLogData = {
   timestamp: string;
   transaction_hash: string;
   block_number: number;
   index: number;
};

// Custom type for Ethers.js LogDescription with proper args typing
export type EthersLogDescription<TArgs = any[]> = {
   fragment: ethers.EventFragment;
   name: string;
   signature: string;
   topic: string;
   args: TArgs;
   rawLog?: RawLogData;
};

// Override the onLogs callback to use our custom log type with generic args
export type WatchContractEventParameters<
   abi extends Abi | readonly unknown[] = Abi,
   eventName extends ContractEventName<abi> | undefined = ContractEventName<abi>,
   strict extends boolean | undefined = undefined,
   TLogArgs = any[],
> = Omit<viem_WatchContractEventParameters<abi, eventName, strict>, "onLogs"> & {
   onLogs: (logs: EthersLogDescription<TLogArgs>[]) => void;
};

export type WatchContractEventReturnType = viem_WatchContractEventReturnType;

export function watchContractEvent<
   const abi extends Abi | readonly unknown[],
   eventName extends ContractEventName<abi> | undefined,
   strict extends boolean | undefined = undefined,
   TLogArgs = any[],
>(parameters: WatchContractEventParameters<abi, eventName, strict, TLogArgs>) {
   const contractInterface = new ethers.Interface(parameters.abi as []);
   let timeOut: NodeJS.Timeout;
   let isActive = true;
   let lastTimestamp = 0;

   const unwatch: WatchContractEventReturnType | undefined = () => {
      isActive = false;
      timeOut && clearTimeout(timeOut);
   };

   const poll = async () => {
      // https://testnet.mirrornode.hedera.com/api/v1/docs/#/contracts/listContractLogs
      const response = await fetch(
         `https://testnet.mirrornode.hedera.com/api/v1/contracts/${parameters.address}/results/logs?timestamp=gte:${lastTimestamp}&order=asc`,
         {
            method: "GET",
            headers: {
               Accept: "application/json",
               "Content-Type": "application/json",
            },
         },
      );
      const result = (await response.json()).logs;

      if (result && result.length > 0) {
         lastTimestamp = Number.parseInt(result.slice(-1)[0].timestamp) + 1 || 0;
         const decodeResults = result.map(
            (item: {
               topics: ReadonlyArray<string>;
               data: string;
               timestamp: string;
               transaction_hash: string;
               block_number: number;
               index: number;
            }) => {
               const parsed = contractInterface.parseLog(item);
               if (parsed) {
                  return {
                     ...parsed,
                     rawLog: {
                        timestamp: item.timestamp,
                        transaction_hash: item.transaction_hash,
                        block_number: item.block_number,
                        index: item.index,
                     },
                  };
               }
               return null;
            },
         );
         const decodeResultsFiltered = decodeResults.filter(
            (item: { name: eventName | ContractEventName<abi> | undefined } | null) => {
               return item?.name === parameters.eventName;
            },
         );
         if (decodeResultsFiltered && isActive) {
            parameters.onLogs(decodeResultsFiltered);
         }
      }
      if (isActive) {
         timeOut = setTimeout(poll, result && result.length > 0 ? 100 : 5000);
      }
   };

   const listener = () => {
      if (unwatch) unwatch();
      isActive = true;
      poll();
      return unwatch;
   };
   const unlisten = listener();

   return () => {
      unlisten?.();
   };
}
