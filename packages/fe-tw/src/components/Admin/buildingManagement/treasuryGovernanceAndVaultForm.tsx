import { useFormikContext } from "formik";
import { BuildingFormProps } from "@/components/Admin/buildingManagement/types";
import { FormInput } from "@/components/ui/formInput";
import * as React from "react";
import { WalkthroughStep } from "@/components/Walkthrough";

const TreasuryGovernanceAndVaultForm = () => {
   const formik = useFormikContext<BuildingFormProps>();

   return (
      <div className="grid grid-cols-2 gap-4">
         <div>
            <div className="flex items-center gap-2">
               <h2 className="text-xl font-semibold">Treasury</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-5">
               <WalkthroughStep
                  guideId="ADMIN_BUILDING_GUIDE"
                  stepIndex={10}
                  title="Set USDC reserve"
                  description="Define the reserve amount in USDC for the building's treasury. When building receives payments (from rent, sales, etc.) it automatically deposited to the treasury, when treasury maximum reserve hit, the building will redistribute excess USDC among its investors."
                  side="top"
               >
                  {({ confirmUserPassedStep }) => {
                     const reserveProps = formik.getFieldProps("treasuryAndGovernance.reserve");
                     return (
                        <FormInput
                           required
                           label="Reserve"
                           tooltipContent="Maximum USDC amount held in treasury reserve. When exceeded, excess funds are distributed to token holders as dividends"
                           {...reserveProps}
                           onBlur={(e) => {
                              reserveProps.onBlur(e);
                              if (!formik.errors.treasuryAndGovernance?.reserve) {
                                 confirmUserPassedStep();
                              }
                           }}
                           placeholder="e.g. 10"
                           error={
                              formik.touched?.treasuryAndGovernance?.reserve
                                 ? formik.errors.treasuryAndGovernance?.reserve
                                 : undefined
                           }
                        />
                     );
                  }}
               </WalkthroughStep>

               <WalkthroughStep
                  guideId="ADMIN_BUILDING_GUIDE"
                  stepIndex={11}
                  title="Set Vault Yield Percentage"
                  description="Percentage (in basis points) of vault yield to be transferred to the treasury reserve. Example: 1000 = 10%"
                  side="top"
               >
                  {({ confirmUserPassedStep }) => {
                     const nProps = formik.getFieldProps("treasuryAndGovernance.npercentage");
                     return (
                        <FormInput
                           required
                           label="Vault Yield Percentage"
                           tooltipContent="Percentage of vault yield transferred to treasury (in basis points). Example: 1000 = 10%. Higher percentages increase treasury reserves"
                           {...nProps}
                           onBlur={(e) => {
                              nProps.onBlur(e);
                              if (!formik.errors.treasuryAndGovernance?.npercentage) {
                                 confirmUserPassedStep();
                              }
                           }}
                           placeholder="e.g. 1000"
                           error={
                              formik.touched?.treasuryAndGovernance?.npercentage
                                 ? formik.errors.treasuryAndGovernance?.npercentage
                                 : undefined
                           }
                        />
                     );
                  }}
               </WalkthroughStep>
            </div>
         </div>

         <div>
            <div className="flex items-center gap-2">
               <h2 className="text-xl font-semibold">Governance</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-5">
               <WalkthroughStep
                  guideId="ADMIN_BUILDING_GUIDE"
                  stepIndex={12}
                  title="Governance name"
                  description="Name the governance entity that will control upgrades, minting rules, fees, and vault parameters."
                  side="top"
               >
                  {({ confirmUserPassedStep }) => {
                     const govProps = formik.getFieldProps("treasuryAndGovernance.governanceName");
                     return (
                        <FormInput
                           required
                           label="Governance Name"
                           tooltipContent="Name of the governance entity that controls building parameters, upgrades, and major decisions. Token holders vote on proposals"
                           {...govProps}
                           onBlur={(e) => {
                              govProps.onBlur(e);
                              if (!formik.errors.treasuryAndGovernance?.governanceName) {
                                 confirmUserPassedStep();
                              }
                           }}
                           placeholder="e.g. My Governance"
                           error={
                              formik.touched?.treasuryAndGovernance?.governanceName
                                 ? formik.errors.treasuryAndGovernance?.governanceName
                                 : undefined
                           }
                        />
                     );
                  }}
               </WalkthroughStep>
            </div>
         </div>

         <div>
            <div className="flex items-center gap-2">
               <h2 className="text-xl font-semibold">Vault</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-5">
               <WalkthroughStep
                  guideId="ADMIN_BUILDING_GUIDE"
                  stepIndex={13}
                  title="Share token name"
                  description="Name of the vault share token."
                  side="top"
               >
                  {({ confirmUserPassedStep }) => {
                     const shareNameProps = formik.getFieldProps(
                        "treasuryAndGovernance.shareTokenName",
                     );
                     return (
                        <FormInput
                           required
                           label="Share Token Name"
                           tooltipContent="Name of the vault share token representing proportional ownership of deposited assets. Used for yield distribution tracking"
                           {...shareNameProps}
                           onBlur={(e) => {
                              shareNameProps.onBlur(e);
                              if (!formik.errors.treasuryAndGovernance?.shareTokenName) {
                                 confirmUserPassedStep();
                              }
                           }}
                           placeholder="e.g. My Share Token"
                           error={
                              formik.touched?.treasuryAndGovernance?.shareTokenName
                                 ? formik.errors.treasuryAndGovernance?.shareTokenName
                                 : undefined
                           }
                        />
                     );
                  }}
               </WalkthroughStep>
               <WalkthroughStep
                  guideId="ADMIN_BUILDING_GUIDE"
                  stepIndex={14}
                  title="Share token symbol"
                  description="Symbol of the vault share token."
                  side="top"
               >
                  {({ confirmUserPassedStep }) => {
                     const shareSymbolProps = formik.getFieldProps(
                        "treasuryAndGovernance.shareTokenSymbol",
                     );
                     return (
                        <FormInput
                           required
                           label="Share Token Symbol"
                           tooltipContent="Short symbol for the vault share token (e.g., 'sBLDG', 'vPLZA'). Typically prefixed with 's' or 'v' to indicate shares/vault"
                           {...shareSymbolProps}
                           onBlur={(e) => {
                              shareSymbolProps.onBlur(e);
                              if (!formik.errors.treasuryAndGovernance?.shareTokenSymbol) {
                                 confirmUserPassedStep();
                              }
                           }}
                           placeholder="e.g. STOK"
                           error={
                              formik.touched?.treasuryAndGovernance?.shareTokenSymbol
                                 ? formik.errors.treasuryAndGovernance?.shareTokenSymbol
                                 : undefined
                           }
                        />
                     );
                  }}
               </WalkthroughStep>

               <FormInput
                  label="Fee Receiver Address"
                  tooltipContent="Ethereum address that receives fees from vault operations. Typically the building manager or treasury address"
                  {...formik.getFieldProps("treasuryAndGovernance.feeReceiverAddress")}
                  placeholder="0x..."
                  error={
                     formik.touched?.treasuryAndGovernance?.feeReceiverAddress
                        ? formik.errors.treasuryAndGovernance?.feeReceiverAddress
                        : undefined
                  }
               />

               <FormInput
                  label={"Fee token address"}
                  tooltipContent="Address of the token used for paying fees (usually USDC or the building token). Leave empty to use the default fee token"
                  {...formik.getFieldProps("treasuryAndGovernance.feeToken")}
                  placeholder="0x..."
               />

               <FormInput
                  label="Fee Percentage"
                  tooltipContent="Percentage fee charged on vault operations (e.g., deposits, withdrawals). Expressed as a whole number (5 = 5%)"
                  {...formik.getFieldProps("treasuryAndGovernance.feePercentage")}
                  placeholder="e.g. 5"
                  error={
                     formik.touched?.treasuryAndGovernance?.feePercentage
                        ? formik.errors.treasuryAndGovernance?.feePercentage
                        : undefined
                  }
               />
            </div>
         </div>

         <div>
            <div className="flex items-center gap-2">
               <h2 className="text-xl font-semibold">Auto Compounder</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-5">
               <FormInput
                  label="Auto Compounder Token Name"
                  tooltipContent="Name of the auto-compounding token that automatically reinvests yield back into the vault for compound growth"
                  {...formik.getFieldProps("treasuryAndGovernance.autoCompounderTokenName")}
                  placeholder="e.g. My Auto Compounder Token"
                  error={
                     formik.touched?.treasuryAndGovernance?.autoCompounderTokenName
                        ? formik.errors.treasuryAndGovernance?.autoCompounderTokenName
                        : undefined
                  }
               />
               <FormInput
                  label="Auto Compounder Token Symbol"
                  tooltipContent="Short symbol for the auto-compounding token (e.g., 'acBLDG', 'cPLZA'). Usually prefixed with 'ac' or 'c' to indicate compounding"
                  {...formik.getFieldProps("treasuryAndGovernance.autoCompounderTokenSymbol")}
                  placeholder="e.g. ACTOK"
                  error={
                     formik.touched?.treasuryAndGovernance?.autoCompounderTokenSymbol
                        ? formik.errors.treasuryAndGovernance?.autoCompounderTokenSymbol
                        : undefined
                  }
               />
            </div>
         </div>
      </div>
   );
};

export default TreasuryGovernanceAndVaultForm;
