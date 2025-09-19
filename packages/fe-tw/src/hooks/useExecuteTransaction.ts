import { config } from "@/config";
import { waitForTransactionReceipt, type WriteContractReturnType } from "wagmi/actions";

// New one, using reown + wagmi
export const executeTransaction = async (transactionFn: () => Promise<WriteContractReturnType>) => {
   let hash: WriteContractReturnType = "0x";
   try {
      hash = await transactionFn();
      const result = await waitForTransactionReceipt(config, { hash });

      return {
         ...result,
         transaction_id: result.transactionHash,
      };
   } catch (error) {
      throw { error, transaction_id: hash, tx: hash }; // tx property left for temproral backwards compatibility
   }
};

// Backwards-compatible hook facade for tests that mock/use useExecuteTransaction
export const useExecuteTransaction = () => ({ executeTransaction });
