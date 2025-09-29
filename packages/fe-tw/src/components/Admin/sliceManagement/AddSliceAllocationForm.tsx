import React from "react";
import { Form, FormikProps, FormikValues, useFormikContext } from "formik";
import { PlusIcon, MinusIcon, TrendingUp } from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useBuildings } from "@/hooks/useBuildings";
import { AddSliceAllocationRequestBody, BuildingToken } from "@/types/erc3643/types";
import { FormInput } from "@/components/ui/formInput";
import { FormSelect } from "@/components/ui/formSelect";
import { Pie, PieChart } from "recharts";
import {
   ChartConfig,
   ChartContainer,
   ChartTooltip,
   ChartTooltipContent,
} from "@/components/ui/chart";
import { cx } from "class-variance-authority";
import { WalkthroughStep } from "@/components/Walkthrough/WalkthroughStep";
import { ConditionalWalkthroughStep } from "@/components/Walkthrough/ConditionalWalkthroughStep";

type Props = {
   assetOptions: BuildingToken[];
   existsAllocations?: string[];
   formik: Pick<FormikProps<AddSliceAllocationRequestBody>, "values"> &
      Pick<FormikProps<AddSliceAllocationRequestBody>, "errors">;
   setFieldValue: (name: string, value: unknown) => void;
   useOnCreateSlice?: boolean;
   addMoreAllocationsDisabled?: boolean;
   className?: string;
};

const indigoShades = [
   "var(--chart-1)",
   "var(--chart-2)",
   "var(--chart-3)",
   "var(--chart-4)",
   "var(--chart-5)",
];

export const AddSliceAllocationForm = ({
   className,
   assetOptions,
   existsAllocations,
   formik,
   setFieldValue,
   useOnCreateSlice,
   addMoreAllocationsDisabled = false,
}: Props) => {
   const { buildings } = useBuildings();

   const generateChartData = () => {
      const allocations =
         formik.values?.tokenAssets
            ?.filter((asset) => asset && formik.values?.tokenAssetAmounts[asset])
            ?.map((asset) => ({
               asset,
               allocation: Number(formik.values?.tokenAssetAmounts[asset] || 0),
               name: buildings?.find((b) => b.address === asset)?.title || "Unknown Building",
            }))
            ?.filter((item) => item.allocation > 0)
            ?.sort((a, b) => b.allocation - a.allocation) || [];

      return allocations.map((item, index) => ({
         asset: item.asset,
         allocation: item.allocation,
         name: item.name,
         fill: indigoShades[index % indigoShades.length],
      }));
   };

   const generateChartConfig = (
      chartData: { asset: string; allocation: number; name: string; fill: string }[],
   ) => {
      const config: ChartConfig = {
         allocation: {
            label: "Allocation %",
         },
      };

      chartData.forEach((item, index) => {
         config[item.asset] = {
            label: item.name,
            color: indigoShades[index % indigoShades.length],
         };
      });

      return config;
   };

   const chartData = generateChartData();
   const chartConfig = generateChartConfig(chartData);

   const totalAllocationsAmount = Object.values(formik.values.tokenAssetAmounts).reduce(
      (acc, amount) => (acc += Number(amount)),
      0,
   );
   const tokenAssetErrors = formik.errors?.tokenAssets;

   const handleSelectTokenAsset = async (rowId: number, value: string) => {
      setFieldValue(
         useOnCreateSlice ? "sliceAllocation.tokenAssets" : "tokenAssets",
         formik.values?.tokenAssets.map((asset, assetId) => (assetId === rowId ? value : asset)),
      );
   };

   const handleRemoveAsset = (asset: string) => {
      setFieldValue(
         useOnCreateSlice ? "sliceAllocation.tokenAssets" : "tokenAssets",
         formik.values?.tokenAssets.filter((asset2) => asset2 !== asset),
      );
      setFieldValue(useOnCreateSlice ? "sliceAllocation.tokenAssetAmounts" : "tokenAssetAmounts", {
         ...formik.values?.tokenAssetAmounts,
         [asset]: undefined,
      });
   };

   const handleAddNewAsset = () => {
      setFieldValue(useOnCreateSlice ? "sliceAllocation.tokenAssets" : "tokenAssets", [
         ...formik.values?.tokenAssets,
         undefined,
      ]);
   };

   const handleAmountChange = (asset: string, value: string) => {
      if (Number(value) <= 100) {
         setFieldValue(
            useOnCreateSlice ? "sliceAllocation.tokenAssetAmounts" : "tokenAssetAmounts",
            {
               ...formik.values?.tokenAssetAmounts,
               [asset]: value,
            },
         );
      }
   };

   const renderTokenAssetRow = (asset: string, assetId: number) => {
      const isExisting = !!existsAllocations?.find((alloc) => alloc === asset);
      const canRemove = formik.values?.tokenAssets?.length > 1 && !isExisting;

      return (
         <div className={cx("grid grid-cols-2 sm:grid-cols-1 gap-3 py-3")} key={asset || assetId}>
            <ConditionalWalkthroughStep
               side="top"
               steps={[
                  {
                     guideId: "USER_SLICE_GUIDE",
                     stepIndex: 10,
                     title: "Select your first building asset",
                     description:
                        "Choose which building token you want to include in your slice. This will be the first component of your diversified real estate portfolio.",
                     enabled: assetId === 0,
                  },
                  {
                     guideId: "USER_SLICE_GUIDE",
                     stepIndex: 13,
                     title: "Add a second building for diversification",
                     description:
                        "Select another building to create a diversified slice. Multiple buildings help spread risk and can provide more stable returns.",
                     enabled: assetId === 1,
                  },
               ]}
            >
               {({ confirmUserPassedStep: confirmSliceInvestStep }) => (
                  <FormSelect
                     name={`tokenAsset-${assetId}`}
                     label="Asset Token"
                     placeholder="Pick asset token"
                     tooltipContent="Select which real estate building token you want to include in this slice. You can only select buildings where you currently hold tokens."
                     value={formik.values?.tokenAssets[assetId] || ""}
                     onValueChange={(value: string) => {
                        handleSelectTokenAsset(assetId, value);
                        confirmSliceInvestStep();
                     }}
                     disabled={isExisting}
                  >
                     {assetOptions
                        ?.filter((opt) =>
                           opt.buildingAddress !== asset
                              ? !formik.values?.tokenAssets?.includes(opt.buildingAddress)
                              : true,
                        )
                        ?.map((opt) => (
                           <SelectItem
                              key={opt.buildingAddress}
                              value={opt.buildingAddress as string}
                           >
                              <span data-testid={`token-asset-${opt.buildingAddress}`}>
                                 {buildings?.find((b) => b.address === opt.buildingAddress)?.title}
                              </span>
                           </SelectItem>
                        ))}
                  </FormSelect>
               )}
            </ConditionalWalkthroughStep>

            <div className="flex gap-2 items-end">
               <ConditionalWalkthroughStep
                  className="flex-auto"
                  side="bottom"
                  steps={[
                     {
                        guideId: "USER_SLICE_GUIDE",
                        stepIndex: 11,
                        title: "Set allocation percentage for first building",
                        description:
                           "Enter what percentage of your slice this building should represent. Think about factors like property value, expected returns, and risk level.",
                        enabled: assetId === 0,
                     },
                     {
                        guideId: "USER_SLICE_GUIDE",
                        stepIndex: 14,
                        title: "Complete your allocation strategy",
                        description:
                           "Set the final allocation percentage. Remember, all allocations must add up to exactly 100% to create a valid, balanced slice.",
                        enabled: assetId === 1,
                     },
                  ]}
               >
                  {({ confirmUserPassedStep: confirmSliceInvestStep }) => (
                     <FormInput
                        name={`tokenAssetAmount-${assetId}`}
                        label="Allocation Percentage"
                        placeholder="0"
                        tooltipContent="Enter the percentage of this asset that your slice will represent. All allocations must add up to exactly 100% to create a valid slice."
                        type="number"
                        min="0"
                        max="100"
                        disabled={isExisting}
                        defaultValue={formik.values?.tokenAssetAmounts[asset]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                           handleAmountChange(asset, e.target.value)
                        }
                        onBlur={async (e) => {
                           if (Number(e.target.value) !== 0) {
                              confirmSliceInvestStep();
                           }
                        }}
                     />
                  )}
               </ConditionalWalkthroughStep>
               <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  disabled={!canRemove}
                  onClick={() => handleRemoveAsset(asset)}
               >
                  <MinusIcon className="h-4 w-4" />
               </Button>
            </div>
         </div>
      );
   };

   return (
      <div className="space-y-6">
         <Form className="space-y-6">
            <div className="space-y-4">
               <div className="grid grid-cols-2 xs:grid-cols-1">
                  <div>
                     {formik.values?.tokenAssets?.length > 0 && (
                        <div className="space-y-0">
                           {formik.values.tokenAssets.map((asset, assetId) =>
                              renderTokenAssetRow(asset, assetId),
                           )}
                        </div>
                     )}

                     <WalkthroughStep
                        className="w-min"
                        steps={[
                           {
                              guideId: "USER_SLICE_GUIDE",
                              stepIndex: 9,
                              title: "Start building your asset portfolio",
                              description:
                                 "Click here to add your first building asset to the slice. You can include multiple buildings to create a diversified investment product.",
                           },
                           {
                              guideId: "USER_SLICE_GUIDE",
                              stepIndex: 12,
                              title: "Add another asset for diversification",
                              description:
                                 "Great! Now add a second building to create a more diversified slice. Diversification helps reduce investment risk.",
                           },
                        ]}
                        side="bottom"
                     >
                        {({ confirmUserPassedStep }) => (
                           <Button
                              type="button"
                              variant="outline"
                              disabled={addMoreAllocationsDisabled}
                              onClick={() => {
                                 handleAddNewAsset();
                                 confirmUserPassedStep();
                              }}
                           >
                              <PlusIcon className="h-4 w-4" />
                              Add Asset
                           </Button>
                        )}
                     </WalkthroughStep>
                  </div>

                  <div className="flex flex-1 flex-col items-center min-h-[300px]">
                     {chartData.length > 0 ? (
                        <>
                           <ChartContainer
                              config={chartConfig}
                              className="mx-auto aspect-square w-full max-w-[250px] max-h-[250px]"
                           >
                              <PieChart width={250} height={250}>
                                 <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                 />
                                 <Pie
                                    data={chartData}
                                    dataKey="allocation"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={0}
                                 />
                              </PieChart>
                           </ChartContainer>

                           <div className="space-y-1 text-xs">
                              {chartData.map((item, index) => (
                                 <div key={item.asset} className="flex items-center gap-2">
                                    <div
                                       className="w-3 h-3 rounded-full"
                                       style={{ backgroundColor: item.fill }}
                                    />
                                    <span className="truncate max-w-32">{item.name}</span>
                                    <span className="font-medium">{item.allocation}%</span>
                                 </div>
                              ))}
                           </div>
                        </>
                     ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                           <div className="text-lg font-medium mb-2">No Allocations Yet</div>
                           <div className="text-sm text-center">
                              Add assets and set allocation percentages to see the distribution
                              chart
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {formik.values.tokenAssets?.some((asset) => asset !== undefined) && (
                  <div className="pt-4 border-t border-gray-200" data-testid="select-token-assets">
                     {tokenAssetErrors && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                           <p className="text-sm text-red-600 font-medium">{tokenAssetErrors}</p>
                        </div>
                     )}

                     {totalAllocationsAmount > 0 && (
                        <div className="space-y-2">
                           <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                 Total Assets Allocation:
                              </span>
                              <span
                                 className={`text-lg font-bold ${
                                    totalAllocationsAmount === 100
                                       ? "text-green-600"
                                       : totalAllocationsAmount > 100
                                         ? "text-red-600"
                                         : "text-amber-600"
                                 }`}
                              >
                                 {totalAllocationsAmount}%
                              </span>
                           </div>

                           {totalAllocationsAmount > 100 && (
                              <p className="text-sm text-red-600">
                                 Total allocation cannot exceed 100%
                              </p>
                           )}

                           {totalAllocationsAmount < 100 && totalAllocationsAmount > 0 && (
                              <p className="text-sm text-amber-600">
                                 Remaining allocation: {100 - totalAllocationsAmount}%
                              </p>
                           )}
                        </div>
                     )}
                  </div>
               )}
            </div>
         </Form>
      </div>
   );
};
