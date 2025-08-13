import { useFormikContext } from "formik";
import { BuildingFormProps } from "@/components/Admin/buildingManagement/types";
import { FormInput } from "@/components/ui/formInput";
import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";
import { WalkthroughStep } from "@/components/Walkthrough";

const TokenForm = () => {
   const formik = useFormikContext<BuildingFormProps>();

   return (
      <div>
         <div>
            <div className="flex items-center gap-2">
               <h2 className="text-xl font-semibold">Token</h2>
            </div>
            <div className={cn("gap-4 mt-5")}>
               <WalkthroughStep
                  guideId="ADMIN_BUILDING_GUIDE"
                  stepIndex={7}
                  title="Token settings"
                  description="Choose the token name, symbol, and decimals for your building token."
                  side="top"
               >
                  {({ confirmUserPassedStep }) => (
                     <div className={cn("grid grid-cols-2 gap-4 mt-0")}>
                        <FormInput
                           required
                           label="Token Name"
                           tooltipContent="The full name of the building token (e.g., 'Central Plaza Building Token'). This will be displayed to investors"
                           {...formik.getFieldProps("token.tokenName")}
                           onBlur={(e) => {
                              formik.getFieldProps("token.tokenName").onBlur(e);
                              if (
                                 !formik.errors.token?.tokenName &&
                                 formik.touched?.token?.tokenSymbol &&
                                 !formik.errors.token?.tokenSymbol
                              ) {
                                 confirmUserPassedStep();
                              }
                           }}
                           placeholder="e.g. My Building Token"
                           error={
                              formik.touched?.token?.tokenName
                                 ? formik.errors.token?.tokenName
                                 : undefined
                           }
                        />

                        <FormInput
                           required
                           label="Token Symbol"
                           tooltipContent="A short identifier for the token (e.g., 'BLDG', 'PLZA'). Usually 3-5 characters, used in trading and wallets"
                           {...formik.getFieldProps("token.tokenSymbol")}
                           onBlur={(e) => {
                              formik.getFieldProps("token.tokenSymbol").onBlur(e);
                              if (
                                 formik.touched?.token?.tokenName &&
                                 !formik.errors.token?.tokenName &&
                                 !formik.errors.token?.tokenSymbol
                              ) {
                                 confirmUserPassedStep();
                              }
                           }}
                           placeholder="e.g. TOK"
                           error={
                              formik.touched?.token?.tokenSymbol
                                 ? formik.errors.token?.tokenSymbol
                                 : undefined
                           }
                        />

                        <FormInput
                           required
                           type="number"
                           label="Token Decimals"
                           tooltipContent="Number of decimal places for the token (typically 18 for compatibility with Ethereum standards). This determines the smallest divisible unit"
                           {...formik.getFieldProps("token.tokenDecimals")}
                           onBlur={(e) => {
                              formik.getFieldProps("token.tokenDecimals").onBlur(e);
                           }}
                           placeholder="e.g. 18"
                           error={
                              formik.touched?.token?.tokenDecimals
                                 ? formik.errors.token?.tokenDecimals
                                 : undefined
                           }
                        />
                     </div>
                  )}
               </WalkthroughStep>
            </div>
         </div>

         <div className={cn("mt-4")}>
            <div className="flex items-center gap-2">
               <h2 className="text-xl font-semibold">Mint</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">
               <WalkthroughStep
                  guideId="ADMIN_BUILDING_GUIDE"
                  stepIndex={8}
                  title="Initial mint amount"
                  description="Specify how many building tokens to mint on deployment. You can mint more later via governance if allowed."
                  side="top"
               >
                  {({ confirmUserPassedStep }) => {
                     const mintProps = formik.getFieldProps("token.mintBuildingTokenAmount");
                     return (
                        <FormInput
                           required
                           type="number"
                           label="Mint Token Amount"
                           tooltipContent="Initial number of tokens to create when deploying. You can mint additional tokens later through governance if needed"
                           {...mintProps}
                           onBlur={(e) => {
                              mintProps.onBlur(e);
                              if (!formik.errors.token?.mintBuildingTokenAmount) {
                                 confirmUserPassedStep();
                              }
                           }}
                           placeholder="e.g. 1000"
                           error={
                              formik.touched?.token?.mintBuildingTokenAmount
                                 ? formik.errors.token?.mintBuildingTokenAmount
                                 : undefined
                           }
                        />
                     );
                  }}
               </WalkthroughStep>
            </div>
         </div>
      </div>
   );
};
export default TokenForm;
