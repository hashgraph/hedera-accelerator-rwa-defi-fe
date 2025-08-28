import { useCallback } from "react";
import { useFormikContext, Form } from "formik";
import { FormInput } from "@/components/ui/formInput";
import { CreateSliceFormProps, AddSliceAllocationFormProps } from "./constants";
import ImageInput, { InputEntity } from "@/components/CommonViews/ImageInput";
import { WalkthroughStep } from "@/components/Walkthrough/WalkthroughStep";

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
            <WalkthroughStep
               guideId={"USER_SLICE_GUIDE"}
               stepIndex={3}
               title="Choose a name for your slice"
               description="Give your slice a memorable name that describes the investment strategy or theme. This will be the main identifier investors see."
               side="bottom"
            >
               {({ confirmUserPassedStep: confirmSliceInvestStep }) => (
                  <FormInput
                     required
                     label="Slice Name"
                     placeholder="e.g. MySlice"
                     className="mt-1"
                     tooltipContent="Choose a unique, descriptive name for your slice that investors will recognize. This will be the main identifier for your investment opportunity."
                     error={formik.touched?.slice?.name ? formik.errors?.slice?.name : undefined}
                     {...formik.getFieldProps("slice.name")}
                     onBlur={async (e) => {
                        formik.getFieldProps("slice.name").onBlur(e);

                        if (!formik.errors.slice?.name) {
                           confirmSliceInvestStep();
                        }
                     }}
                  />
               )}
            </WalkthroughStep>
            <WalkthroughStep
               guideId={"USER_SLICE_GUIDE"}
               stepIndex={4}
               title="Create a symbol for your slice token"
               description="This is a short ticker symbol (like 'NYSE' or 'NASDAQ') that will represent your slice token on the blockchain. Keep it concise and memorable."
               side="bottom"
            >
               {({ confirmUserPassedStep: confirmSliceInvestStep }) => (
                  <FormInput
                     required
                     label="Slice Symbol"
                     placeholder="e.g. SLICE"
                     className="mt-1"
                     tooltipContent="A short ticker symbol (2-8 characters) that will represent your slice token on the blockchain. Think of it like a stock ticker symbol."
                     error={
                        formik.touched?.slice?.symbol ? formik.errors?.slice?.symbol : undefined
                     }
                     {...formik.getFieldProps("slice.symbol")}
                     onBlur={async (e) => {
                        formik.getFieldProps("slice.symbol").onBlur(e);

                        if (!formik.errors.slice?.symbol) {
                           confirmSliceInvestStep();
                        }
                     }}
                  />
               )}
            </WalkthroughStep>
            <WalkthroughStep
               guideId={"USER_SLICE_GUIDE"}
               stepIndex={5}
               title="Describe your investment strategy"
               description="Explain what makes this slice unique - the investment theme, target properties, expected returns, or any other details that will help investors understand the opportunity."
               side="bottom"
            >
               {({ confirmUserPassedStep: confirmSliceInvestStep }) => (
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
                     onBlur={async (e) => {
                        formik.getFieldProps("slice.description").onBlur(e);

                        if (!formik.errors.slice?.description) {
                           confirmSliceInvestStep();
                        }
                     }}
                  />
               )}
            </WalkthroughStep>
            <WalkthroughStep
               guideId={"USER_SLICE_GUIDE"}
               stepIndex={6}
               title="Set the investment period end date"
               description="Choose when this slice investment opportunity will close. After this date, investors can no longer purchase tokens from this slice. This creates urgency and defines the investment window."
               side="bottom"
            >
               {({ confirmUserPassedStep: confirmSliceInvestStep }) => (
                  <FormInput
                     required
                     label="Slice End Date"
                     type="date"
                     placeholder="e.g. 10.05.2025"
                     className="mt-1"
                     tooltipContent="Set the expiration date when this slice investment period will end. This must be a future date and determines when investors can no longer participate in this slice."
                     error={
                        formik.touched?.slice?.endDate ? formik.errors?.slice?.endDate : undefined
                     }
                     {...formik.getFieldProps("slice.endDate")}
                     onBlur={async (e) => {
                        formik.getFieldProps("slice.endDate").onBlur(e);

                        if (!formik.errors.slice?.endDate) {
                           confirmSliceInvestStep();
                        }
                     }}
                  />
               )}
            </WalkthroughStep>

            <div className="flex gap-1 items-end w-full">
               <div className="w-full">
                  <WalkthroughStep
                     guideId={"USER_SLICE_GUIDE"}
                     stepIndex={7}
                     title="Add a visual representation"
                     description="Upload an image that represents your slice. This could be a photo of one of the included buildings, a logo, or any visual that helps investors identify and remember your slice."
                     side="bottom"
                  >
                     {({ confirmUserPassedStep: confirmSliceInvestStep }) => (
                        <ImageInput
                           ipfsId={formik.values.slice.sliceImageIpfsId}
                           file={formik.values.slice.sliceImageIpfsFile}
                           onChange={async ({ id, file }) => {
                              await handleChangeImage({ id, file });
                              if (id || file) confirmSliceInvestStep();
                           }}
                           error={formik.errors?.slice?.sliceImageIpfsId}
                           touched={formik.touched?.slice?.sliceImageIpfsId}
                           inputEntity={InputEntity.Slice}
                        />
                     )}
                  </WalkthroughStep>
               </div>
            </div>
         </Form>
      </div>
   );
};
