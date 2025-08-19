import { useCallback } from "react";
import { useFormikContext, Form } from "formik";
import { FormInput } from "@/components/ui/formInput";
import { CreateSliceFormProps, AddSliceAllocationFormProps } from "./constants";
import ImageInput, { InputEntity } from "@/components/CommonViews/ImageInput";

export const AddSliceForm = () => {
   const formik = useFormikContext<{
      slice: CreateSliceFormProps;
      sliceAllocation: AddSliceAllocationFormProps;
   }>();

   const handleChangeImage = useCallback(
      async ({ id, file }: { id: string; file: File | null }) => {
         await formik.setValues((prev) => ({
            ...prev,
            slice: {
               ...prev.slice,
               sliceImageIpfsId: id,
               sliceImageIpfsFile: file ?? undefined,
            },
         }));
         await formik.setFieldTouched("slice.sliceImageIpfsId", true);
         await formik.setFieldTouched("slice.sliceImageIpfsFile", true);
      },
      [formik.setValues, formik.setFieldTouched],
   );

   return (
      <div className="space-y-6">
         <Form className="grid grid-cols-2 gap-4">
            <div>
               <FormInput
                  required
                  label="Slice Name"
                  placeholder="e.g. MySlice"
                  className="mt-1"
                  tooltipContent="Choose a unique, descriptive name for your slice that investors will recognize. This will be the main identifier for your investment opportunity."
                  error={formik.touched?.slice?.name ? formik.errors?.slice?.name : undefined}
                  {...formik.getFieldProps("slice.name")}
               />
            </div>
            <div>
               <FormInput
                  required
                  label="Slice Symbol"
                  placeholder="e.g. SLICE"
                  className="mt-1"
                  tooltipContent="A short ticker symbol (2-8 characters) that will represent your slice token on the blockchain. Think of it like a stock ticker symbol."
                  error={formik.touched?.slice?.symbol ? formik.errors?.slice?.symbol : undefined}
                  {...formik.getFieldProps("slice.symbol")}
               />
            </div>
            <div>
               <FormInput
                  required
                  label="Slice Description"
                  placeholder="e.g. My slice..."
                  className="mt-1"
                  tooltipContent="Provide a detailed description explaining the investment opportunity, strategy, and what makes this slice attractive to potential investors."
                  error={
                     formik.touched?.slice?.description
                        ? formik.errors?.slice?.description
                        : undefined
                  }
                  {...formik.getFieldProps("slice.description")}
               />
            </div>
            <div>
               <FormInput
                  required
                  label="Slice End Date"
                  type="date"
                  placeholder="e.g. 10.05.2025"
                  className="mt-1"
                  tooltipContent="Set the expiration date when this slice investment period will end. This must be a future date and determines when investors can no longer participate in this slice."
                  error={formik.touched?.slice?.endDate ? formik.errors?.slice?.endDate : undefined}
                  {...formik.getFieldProps("slice.endDate")}
               />
            </div>
            <div className="flex gap-1 items-end w-full">
               <div className="w-full">
                  <ImageInput
                     ipfsId={formik.values.slice.sliceImageIpfsId}
                     file={formik.values.slice.sliceImageIpfsFile}
                     onChange={handleChangeImage}
                     error={formik.errors?.slice?.sliceImageIpfsId}
                     touched={formik.touched?.slice?.sliceImageIpfsId}
                     inputEntity={InputEntity.Slice}
                  />
               </div>
            </div>
         </Form>
      </div>
   );
};
