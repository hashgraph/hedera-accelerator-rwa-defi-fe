import { Form, Formik } from "formik";
import * as Yup from "yup";
import { Shield } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import countries from "i18n-iso-countries";
import englishLocale from "i18n-iso-countries/langs/en.json";
import { toast } from "sonner";
import { tryCatch } from "@/services/tryCatch";
import { TxResultToastView } from "../CommonViews/TxResultView";
import { useIdentity } from "./useIdentity";
import { TransactionExtended } from "@/types/common";
import { WalkthroughStep } from "../Walkthrough";

countries.registerLocale(englishLocale);

interface IProps {
   buildingAddress: string;
   isModalOpened: boolean;
   onOpenChange: (open: boolean) => void;
}

const validationSchema = Yup.object({
   country: Yup.string().required("Country selection is required"),
});

const RegisterIdentityModal = ({ buildingAddress, isModalOpened, onOpenChange }: IProps) => {
   const { registerIdentity, isRegistering } = useIdentity();

   const countryOptions = Object.entries(countries.getNames("en", { select: "official" }))
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

   const handleRegisterIdentity = async (values: { country: string }) => {
      const { data, error } = await tryCatch<TransactionExtended, { message: string }>(
         registerIdentity(buildingAddress, Number(countries.alpha2ToNumeric(values.country))),
      );

      if (data) {
         toast.success(
            <TxResultToastView title="Identity registered successfully!" txSuccess={data} />,
         );
         onOpenChange(false);
      } else if (error) {
         toast.error(
            <TxResultToastView title="Error registering identity" txError={error?.message} />,
            {
               duration: Infinity,
            },
         );
      }
   };

   return (
      <Dialog open={isModalOpened} onOpenChange={onOpenChange}>
         <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            className="max-w-md border-indigo-100"
         >
            <DialogHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg border-b border-indigo-100 p-6 -m-6 mb-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                     <Shield className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                     <DialogTitle className="text-xl text-indigo-900">
                        Register Identity
                     </DialogTitle>
                     <DialogDescription className="text-indigo-700/70">
                        Register ERC3643 compliant identity for your wallet
                     </DialogDescription>
                  </div>
               </div>
            </DialogHeader>

            <div className="space-y-6">
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 text-center">
                     You need to register ERC3643 compliant identity for your wallet to interact
                     with this tokenized building.
                  </p>
               </div>

               <Formik
                  initialValues={{
                     country: "",
                  }}
                  validationSchema={validationSchema}
                  onSubmit={async (values, { setSubmitting, resetForm }) => {
                     await handleRegisterIdentity(values);
                     setSubmitting(false);
                     if (!isRegistering) {
                        resetForm();
                     }
                  }}
               >
                  {({ setFieldValue, values, errors, touched }) => (
                     <Form className="space-y-6">
                        <WalkthroughStep
                           guideId="USER_INVESTING_GUIDE"
                           stepIndex={9}
                           title="Almost there!"
                           description="Please select your country of residence to proceed with identity registration. And click 'Register Identity' below."
                           side="right"
                        >
                           {({ confirmUserPassedStep }) => (
                              <>
                                 <div className="space-y-2">
                                    <label
                                       htmlFor="country"
                                       className="text-sm font-medium text-gray-700"
                                    >
                                       Country of Residence
                                    </label>
                                    <Select
                                       name="country"
                                       onValueChange={(value) => setFieldValue("country", value)}
                                       value={values.country}
                                    >
                                       <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select your country" />
                                       </SelectTrigger>
                                       <SelectContent className="max-h-60">
                                          {countryOptions.map((country) => (
                                             <SelectItem key={country.code} value={country.code}>
                                                {country.name} ({country.code})
                                             </SelectItem>
                                          ))}
                                       </SelectContent>
                                    </Select>
                                    {touched.country && errors.country && (
                                       <p className="text-sm text-red-600">{errors.country}</p>
                                    )}
                                 </div>

                                 <div className="flex gap-3">
                                    <Button
                                       type="button"
                                       variant="outline"
                                       className="flex-1"
                                       onClick={() => onOpenChange(false)}
                                       disabled={isRegistering}
                                    >
                                       Cancel
                                    </Button>
                                    <Button
                                       className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
                                       disabled={isRegistering || !values.country}
                                       isLoading={isRegistering}
                                       type="submit"
                                       onClick={confirmUserPassedStep}
                                    >
                                       {isRegistering ? "Registering..." : "Register Identity"}
                                    </Button>
                                 </div>
                              </>
                           )}
                        </WalkthroughStep>
                     </Form>
                  )}
               </Formik>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default RegisterIdentityModal;
