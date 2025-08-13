import { useFormikContext } from "formik";
import { FormInput } from "@/components/ui/formInput";
import * as React from "react";
import { BuildingFormProps } from "./types";
import { cn } from "@/lib/utils";
import BuildingImageInput from "./BuildingImageInput";
import { WalkthroughStep } from "@/components/Walkthrough";

const BuildingInfoForm = () => {
   const formik = useFormikContext<BuildingFormProps>();

   const handleChangeImage = React.useCallback(
      async ({ id, file }: { id: string; file: File | null }) => {
         await formik.setValues((prev) => ({
            ...prev,
            info: {
               ...prev.info,
               buildingImageIpfsId: id,
               buildingImageIpfsFile: file ?? undefined,
            },
         }));
         await formik.setFieldTouched("info.buildingImageIpfsId", true);
         await formik.setFieldTouched("info.buildingImageIpfsFile", true);
      },
      [formik.setValues, formik.setFieldTouched],
   );

   return (
      <div className={cn("grid grid-cols-1 gap-4")}>
         <div className="relative">
            <h2 className="text-xl font-semibold">Building</h2>
            <div className="grid grid-cols-2 gap-4 mt-5">
               <WalkthroughStep
                  guideId="ADMIN_BUILDING_GUIDE"
                  stepIndex={4}
                  title="Upload a building image"
                  description="Provide an image for the building. You can paste an IPFS CID or upload a file and we'll upload it to IPFS for you."
                  side="right"
               >
                  {({ confirmUserPassedStep }) => (
                     <BuildingImageInput
                        ipfsId={formik.values.info.buildingImageIpfsId}
                        file={formik.values.info.buildingImageIpfsFile}
                        onChange={async ({ id, file }) => {
                           await handleChangeImage({ id, file });
                           if (id || file) confirmUserPassedStep();
                        }}
                        error={formik.errors.info?.buildingImageIpfsId}
                        touched={formik.touched?.info?.buildingImageIpfsId}
                     />
                  )}
               </WalkthroughStep>

               <div className="flex flex-col gap-4">
                  <WalkthroughStep
                     guideId="ADMIN_BUILDING_GUIDE"
                     stepIndex={5}
                     title="Set a descriptive building title"
                     description="Give your building a clear, recognizable title users will see across the app."
                     side="top"
                  >
                     {({ confirmUserPassedStep }) => {
                        const titleProps = formik.getFieldProps("info.buildingTitle");
                        return (
                           <FormInput
                              required
                              label={"Building Title"}
                              tooltipContent="A descriptive name for your building that will be visible to all users and investors"
                              {...titleProps}
                              onBlur={async (e) => {
                                 titleProps.onBlur(e);

                                 if (!formik.errors.info?.buildingTitle) {
                                    confirmUserPassedStep();
                                 }
                              }}
                              placeholder="e.g. My Building"
                              error={
                                 formik.touched?.info?.buildingTitle
                                    ? formik.errors.info?.buildingTitle
                                    : undefined
                              }
                           />
                        );
                     }}
                  </WalkthroughStep>

                  <FormInput
                     required
                     label={"Building Token Supply"}
                     type="number"
                     tooltipContent="The total number of building tokens that will represent ownership. This determines how many shares the building can be divided into"
                     {...formik.getFieldProps("info.buildingTokenSupply")}
                     placeholder="e.g. 1000000"
                     error={
                        formik.touched?.info?.buildingTokenSupply
                           ? formik.errors.info?.buildingTokenSupply
                           : undefined
                     }
                  />

                  <FormInput
                     label={"Building Description"}
                     tooltipContent="A brief description of the building, its features, and investment highlights to help potential investors understand the property"
                     {...formik.getFieldProps("info.buildingDescription")}
                     placeholder="A short description"
                     error={
                        formik.touched?.info?.buildingDescription
                           ? formik.errors.info?.buildingDescription
                           : undefined
                     }
                  />

                  <FormInput
                     label={"Building Purchase Date"}
                     tooltipContent="The date when the building was purchased or acquired. Use YYYY-MM-DD format for consistency"
                     {...formik.getFieldProps("info.buildingPurchaseDate")}
                     placeholder="YYYY-MM-DD"
                     error={
                        formik.touched?.info?.buildingPurchaseDate
                           ? formik.errors.info?.buildingPurchaseDate
                           : undefined
                     }
                  />

                  <FormInput
                     label={"Building Constructed Year"}
                     tooltipContent="The year the building was originally constructed or built"
                     {...formik.getFieldProps("info.buildingConstructedYear")}
                     placeholder="YYYY"
                     error={
                        formik.touched?.info?.buildingConstructedYear
                           ? formik.errors.info?.buildingConstructedYear
                           : undefined
                     }
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
               <FormInput
                  label={"Building Type"}
                  tooltipContent="The classification of the building (e.g., Residential, Commercial, Industrial, Mixed-use)"
                  {...formik.getFieldProps("info.buildingType")}
                  placeholder="e.g. Residential"
                  error={
                     formik.touched?.info?.buildingType
                        ? formik.errors.info?.buildingType
                        : undefined
                  }
               />

               <FormInput
                  label={"Building Location"}
                  tooltipContent="The city and state or country where the building is located. This helps investors understand the market"
                  {...formik.getFieldProps("info.buildingLocation")}
                  placeholder="e.g. New York City"
                  error={
                     formik.touched?.info?.buildingLocation
                        ? formik.errors.info?.buildingLocation
                        : undefined
                  }
               />

               <FormInput
                  label={"Building Location Type"}
                  tooltipContent="The area classification where the building is situated (e.g., Urban, Suburban, Rural)"
                  {...formik.getFieldProps("info.buildingLocationType")}
                  placeholder="e.g. Urban"
                  error={
                     formik.touched?.info?.buildingLocationType
                        ? formik.errors.info?.buildingLocationType
                        : undefined
                  }
               />
            </div>
         </div>

         <div>
            <h2 className="text-xl font-semibold mt-5">COPE Information</h2>
            <div className="grid grid-cols-2 gap-4 mt-5">
               <FormInput
                  label={"Construction Materials"}
                  tooltipContent="Primary building materials used in construction (e.g., Concrete, Steel, Wood frame). This affects durability and risk assessment"
                  {...formik.getFieldProps("info.copeConstructionMaterials")}
                  placeholder="e.g. Concrete"
                  error={
                     formik.touched?.info?.copeConstructionMaterials
                        ? formik.errors.info?.copeConstructionMaterials
                        : undefined
                  }
               />
               <FormInput
                  label={"Construction Year Built"}
                  tooltipContent="The specific year when construction was completed. Used for age assessment and depreciation calculations"
                  {...formik.getFieldProps("info.copeConstructionYearBuilt")}
                  placeholder="e.g. 2010"
                  error={
                     formik.touched?.info?.copeConstructionYearBuilt
                        ? formik.errors.info?.copeConstructionYearBuilt
                        : undefined
                  }
               />
               <FormInput
                  label={"Roof Type"}
                  tooltipContent="Type of roof construction (e.g., Flat, Pitched, Membrane). Important for weather resistance and maintenance"
                  {...formik.getFieldProps("info.copeConstructionRoofType")}
                  placeholder="e.g. Flat"
                  error={
                     formik.touched?.info?.copeConstructionRoofType
                        ? formik.errors.info?.copeConstructionRoofType
                        : undefined
                  }
               />
               <FormInput
                  label={"Floors"}
                  tooltipContent="Total number of floors in the building. This impacts value assessment and operational complexity"
                  {...formik.getFieldProps("info.copeConstructionNumFloors")}
                  placeholder="e.g. 8"
                  error={
                     formik.touched?.info?.copeConstructionNumFloors
                        ? formik.errors.info?.copeConstructionNumFloors
                        : undefined
                  }
               />
               <FormInput
                  label={"Occupancy Type"}
                  tooltipContent="How the building is used (e.g., Residential, Office, Retail, Industrial). This affects risk profile and rental income potential"
                  {...formik.getFieldProps("info.copeOccupancyType")}
                  placeholder="e.g. Residential"
                  error={
                     formik.touched?.info?.copeOccupancyType
                        ? formik.errors.info?.copeOccupancyType
                        : undefined
                  }
               />
               <FormInput
                  label={"Occupancy Percentage"}
                  tooltipContent="Current percentage of the building that is occupied or leased. Higher occupancy typically means more stable income"
                  {...formik.getFieldProps("info.copeOccupancyPercentage")}
                  placeholder="e.g. 85"
                  error={
                     formik.touched?.info?.copeOccupancyPercentage
                        ? formik.errors.info?.copeOccupancyPercentage
                        : undefined
                  }
               />
               <FormInput
                  label={"Fire Protection"}
                  tooltipContent="Fire safety systems installed (e.g., Fire alarms, Smoke detectors). Important for safety and insurance purposes"
                  {...formik.getFieldProps("info.copeProtectionFire")}
                  placeholder="e.g. Yes"
                  error={
                     formik.touched?.info?.copeProtectionFire
                        ? formik.errors.info?.copeProtectionFire
                        : undefined
                  }
               />
               <FormInput
                  label={"Sprinkles"}
                  tooltipContent="Type of sprinkler system installed (e.g., Wet pipe system, Dry pipe, Pre-action). Reduces fire damage risk"
                  {...formik.getFieldProps("info.copeProtectionSprinklers")}
                  placeholder="e.g. Wet pipe system"
                  error={
                     formik.touched?.info?.copeProtectionFire
                        ? formik.errors.info?.copeProtectionFire
                        : undefined
                  }
               />

               <FormInput
                  label="Security"
                  tooltipContent="Security measures in place (e.g., 24/7 doorman, Security cameras, Access control). Affects tenant satisfaction and property value"
                  {...formik.getFieldProps("info.copeProtectionSecurity")}
                  placeholder="e.g. 24/7 doorman"
                  error={
                     formik.touched?.info?.copeProtectionSecurity
                        ? formik.errors.info?.copeProtectionSecurity
                        : undefined
                  }
               />
               <FormInput
                  label="Nearby Risks"
                  tooltipContent="Any potential hazards near the property (e.g., Adjacent gas station, Chemical plant, Airport). Important for risk assessment"
                  {...formik.getFieldProps("info.copeExposureNearbyRisks")}
                  placeholder="e.g. Adjacent gas station"
                  error={
                     formik.touched?.info?.copeExposureNearbyRisks
                        ? formik.errors.info?.copeExposureNearbyRisks
                        : undefined
                  }
               />
               <FormInput
                  label="Flood Zone"
                  tooltipContent="FEMA flood zone designation (e.g., Zone X, Zone A, Zone AE). Determines flood risk and insurance requirements"
                  {...formik.getFieldProps("info.copeExposureFloodZone")}
                  placeholder="e.g. Zone X"
                  error={
                     formik.touched?.info?.copeExposureFloodZone
                        ? formik.errors.info?.copeExposureFloodZone
                        : undefined
                  }
               />
            </div>
         </div>
      </div>
   );
};

export default BuildingInfoForm;
