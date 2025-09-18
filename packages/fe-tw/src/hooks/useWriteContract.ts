import { writeContract, type WriteContractParameters } from "wagmi/actions";
import { config } from "@/config";

const useWriteContract = ({ shouldEstimateGas }: { shouldEstimateGas?: boolean } = {}) => {
   const handleWriteContract = async (params: WriteContractParameters) =>
      writeContract(config, params);

   return { writeContract: handleWriteContract };
};

export default useWriteContract;
