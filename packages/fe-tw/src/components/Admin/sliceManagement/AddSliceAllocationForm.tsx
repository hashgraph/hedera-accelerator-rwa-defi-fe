import React, { useState } from "react";
import { useFormikContext, Form } from "formik";
import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/ui/formInput";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateSliceFormProps, AddSliceAllocationFormProps } from "./constants";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useBuildings } from "@/hooks/useBuildings";
import { BuildingToken } from "@/types/erc3643/types";

export const AddSliceAllocationForm = ({ assetOptions }: { assetOptions: BuildingToken[] }) => {
   const formik = useFormikContext<{
      slice: CreateSliceFormProps,
      sliceAllocation: AddSliceAllocationFormProps,
   }>();
   const { buildings } = useBuildings();
   const [tokensPercentageDialogOpen, setTokensPercentageDialogOpen] = useState(false);
   const lastSelectedAssetToken = formik.values.sliceAllocation.tokenAssets[formik.values.sliceAllocation.tokenAssets.length - 1];

   const handleOpenChange = (state: boolean) => {
      if (!state) {
         if (!formik.values.sliceAllocation.tokenAssetAmounts[lastSelectedAssetToken]) {
            const newTokenAssets = [...formik.values.sliceAllocation.tokenAssets];
            newTokenAssets.pop();

            formik.setFieldValue('sliceAllocation.tokenAssets', newTokenAssets);
            formik.setFieldError('sliceAllocation.tokenAssets', 'Allocation is mandatory for an asset selected');
         }
      }

      setTokensPercentageDialogOpen(state);
   };

   const handleConfirmAllocationAmount = () => {
      const newTokenAllocationValue = Number(formik.values.sliceAllocation.allocationAmount);

      if (newTokenAllocationValue) {
         formik.setFieldValue("sliceAllocation.tokenAssetAmounts", {
            ...formik.values.sliceAllocation.tokenAssetAmounts,
            [lastSelectedAssetToken]: newTokenAllocationValue,
         });
      } else {
         formik.setFieldValue("sliceAllocation.tokenAssetAmounts", {
            ...formik.values.sliceAllocation.tokenAssetAmounts,
            [lastSelectedAssetToken]: '100',
         });
      }

      setTokensPercentageDialogOpen(false);
   };

   const handleSelectTokenAsset = async (value: `0x${string}`) => {
      if (formik.values.sliceAllocation?.tokenAssets?.length === 5) {
         formik.setFieldError('sliceAllocation.tokenAssets', "It's possble to add maximum of 5 tokens");
         return;
      } else if (formik.values.sliceAllocation?.tokenAssets.includes(value)) {
         formik.setFieldError('sliceAllocation.tokenAssets', 'This token has been already selected');
         return;
      }

      formik.setFieldValue("sliceAllocation.tokenAssets", [...formik.values.sliceAllocation?.tokenAssets, value]);
      setTokensPercentageDialogOpen(true);
   };
   
   return (
      <Form className="grid grid-cols-2 gap-4">
         <Dialog open={tokensPercentageDialogOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
            <DialogHeader>
                  <DialogTitle>
                     Add allocation amount for token {buildings?.find((b) => b.address === lastSelectedAssetToken)?.title}
                  </DialogTitle>
                  <DialogDescription>
                     <span className="text-xs text-red-700">
                        In case of empty amount it's would be assigned automatically.
                     </span>
                  </DialogDescription>
               </DialogHeader>
               <FormInput
                  label="Allocation amount (e.g. 100)"
                  placeholder="e.g. 100"
                  className="mt-1"
                  error={
                     formik.touched?.sliceAllocation?.allocationAmount ? formik.errors?.sliceAllocation?.allocationAmount : undefined
                  }
                  {...formik.getFieldProps("sliceAllocation.allocationAmount")}
               />
               <Button onClick={handleConfirmAllocationAmount} type="button" className="lg:w-4/12">
                  Confirm
               </Button>
            </DialogContent>
         </Dialog>
      
         <div>
            <FormInput
               label="Deposit amount"
               placeholder="e.g. 100"
               className="mt-1"
               error={
                  formik.touched?.sliceAllocation?.depositAmount ? formik.errors?.sliceAllocation?.depositAmount : undefined
               }
               {...formik.getFieldProps("sliceAllocation.depositAmount")}
            />
         </div>

         <div>
            <FormInput
               label="Token reward amount in USDC"
               placeholder="e.g. 100"
               className="mt-1"
               error={
                  formik.touched?.sliceAllocation?.rewardAmount ? formik.errors?.sliceAllocation?.rewardAmount : undefined
               }
               {...formik.getFieldProps("sliceAllocation.rewardAmount")}
            />
         </div>
      
         <div>
               <Label htmlFor="tokenAssets">Select multiple token assets</Label>
               <Select
                  onValueChange={handleSelectTokenAsset}
                  required
                  defaultValue={formik.values.sliceAllocation?.tokenAssets[0]}
               >
                  <SelectTrigger className="w-full mt-1">
                     <SelectValue placeholder="e.g 0x.." />
                  </SelectTrigger>
                  <SelectContent>
                     {assetOptions
                        ?.map((opt) => (
                           <SelectItem key={opt.buildingAddress} value={opt.buildingAddress as string}>
                              {buildings?.find((b) => b.address === opt.buildingAddress)?.title}
                           </SelectItem>
                        ))
                     }
               </SelectContent>
               {
                  !!formik.errors.sliceAllocation?.tokenAssets &&
                  <span className="text-sm text-red-600">{formik.errors.sliceAllocation?.tokenAssets}</span>
               }
            </Select>
            {formik.values.sliceAllocation?.tokenAssets?.length > 0 && <div className="flex flex-col mt-5" style={{ overflowX: "scroll" }}>
               <p className="text-sm font-semibold">Selected Token Assets</p>

               {formik.values.sliceAllocation?.tokenAssets?.map(asset => (
                  <Badge className="badge badge-md badge-soft badge-info p-2 m-1" key={asset}>
                     {buildings?.find((b) => b.address === asset)?.title}
                     {asset ? ` ${asset}` : ''}
                     {formik.values.sliceAllocation.tokenAssetAmounts[asset] ? ` (${formik.values.sliceAllocation.tokenAssetAmounts[asset]})` : ''}
                  </Badge>
               ))}

               {!!formik.values.sliceAllocation.tokenAssetAmounts && (
                  <div className="flex flex-col">
                     <p className="text-sm mt-2">
                        <span className="font-semibold">Total Allocation: {'\n'}</span>
                        <span className="font-bold">{
                           Object.values(formik.values.sliceAllocation.tokenAssetAmounts)
                              .reduce((acc, amount) => acc += Number(amount), 0)
                           }
                        </span>
                     </p>
                  </div>
               )}
            </div>}
         </div>
      </Form>
   );
};
