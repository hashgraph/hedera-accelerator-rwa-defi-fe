"use client";

import { useState } from "react";
import { times, partition } from "lodash";
import { Shield, CheckCheck, Trash2, Globe, Search, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import {
   Pagination,
   PaginationContent,
   PaginationItem,
   PaginationLink,
   PaginationNext,
   PaginationPrevious,
   PaginationEllipsis,
} from "@/components/ui/pagination";
import countries from "i18n-iso-countries";
import englishLocale from "i18n-iso-countries/langs/en.json";
import { toast } from "sonner";
import { TxResultToastView } from "../CommonViews/TxResultView";
import { useCompliance } from "./useCompliance";
import { useCountryModule } from "./useCountryModule";
import { COMPLIANCE_MODULE_ADDRESSES } from "@/services/contracts/addresses";
import { Badge } from "@/components/ui/badge";
import { cx } from "class-variance-authority";
import { tryCatch } from "@/services/tryCatch";
import { useAccount } from "wagmi";

countries.registerLocale(englishLocale);

type CountryComplianceModuleProps = {
   buildingId: string;
   buildingAddress: `0x${string}`;
};

const COUNTRY_STATUS_TO_COLOR: Record<string, "blue" | "red" | "green" | "gray"> = {
   "pending-allow": "blue",
   "pending-disallow": "red",
   allowed: "green",
   restricted: "gray",
};

export function CountryComplianceModule({
   buildingId,
   buildingAddress,
}: CountryComplianceModuleProps) {
   const { address: evmAddress } = useAccount();
   const [filterText, setFilterText] = useState("");
   const [currentPage, setCurrentPage] = useState(1);
   const [pendingCountriesAction, setPendingCountriesAction] = useState<
      Record<number, "allow" | "disallow">
   >({});
   const itemsPerPage = 10;

   const { addModule, removeModule, isModuleAdded, isModuleLoading } = useCompliance({
      buildingId,
      buildingAddress,
      moduleAddress: COMPLIANCE_MODULE_ADDRESSES.COUNTRY_ALLOW_MODULE,
   });

   const { allowCountries, disallowCountries, allowedCountries, isPending } = useCountryModule({
      buildingId,
      buildingAddress,
   });

   const countryOptions = Object.entries(countries.getNames("en", { select: "official" }))
      .map(([code, name]) => ({
         code,
         name,
         isoNumber: Number(countries.alpha2ToNumeric(code)),
         status: allowedCountries.includes(Number(countries.alpha2ToNumeric(code)))
            ? "Allowed"
            : "Restricted",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

   const filteredCountries = countryOptions.filter((country) => {
      const searchLower = filterText.toLowerCase();
      return (
         country.name.toLowerCase().includes(searchLower) ||
         country.code.toLowerCase().includes(searchLower) ||
         country.status.toLowerCase().includes(searchLower)
      );
   });

   const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const paginatedCountries = filteredCountries.slice(startIndex, startIndex + itemsPerPage);

   const handleFilterChange = (value: string) => {
      setFilterText(value);
      setCurrentPage(1);
   };

   const handleToggleEnabled = async (enabled: boolean) => {
      if (enabled) {
         const { data: txSuccess, error } = await tryCatch(addModule());

         if (txSuccess) {
            toast.success(
               <TxResultToastView
                  title="Country compliance module enabled!"
                  txSuccess={txSuccess}
               />,
            );
         }
         if (error) {
            toast.error(
               <TxResultToastView
                  title={`Error enabling country compliance module`}
                  txError={error.tx}
               />,
               { duration: Infinity },
            );
         }
      } else {
         const { data: txSuccess, error } = await tryCatch(removeModule());

         if (txSuccess) {
            toast.success(
               <TxResultToastView
                  title="Country compliance module disabled!"
                  txSuccess={txSuccess}
               />,
            );
         }
         if (error) {
            toast.error(
               <TxResultToastView
                  title={`Error disabling country compliance module`}
                  txError={error.tx}
               />,
               { duration: Infinity },
            );
         }
      }
   };

   const handleCountryStatusClick = (country: {
      code?: string;
      name?: string;
      isoNumber: number;
      status: string;
   }) => {
      const isoNumber = country.isoNumber;

      if (country.status === "Allowed") {
         setPendingCountriesAction((prev) => {
            const newState = { ...prev };
            if (newState[isoNumber] === "disallow") {
               delete newState[isoNumber];
            } else {
               newState[isoNumber] = "disallow";
            }
            return newState;
         });
      } else {
         setPendingCountriesAction((prev) => {
            const newState = { ...prev };
            if (newState[isoNumber] === "allow") {
               delete newState[isoNumber];
            } else {
               newState[isoNumber] = "allow";
            }
            return newState;
         });
      }
   };

   const handleSaveChanges = async () => {
      const pendingEntries = Object.entries(pendingCountriesAction);
      const [allowEntries, disallowEntries] = partition(
         pendingEntries,
         ([_, action]) => action === "allow",
      );

      const allowCountriesList = allowEntries.map(([isoNumber, _]) => Number(isoNumber));
      const disallowCountriesList = disallowEntries.map(([isoNumber, _]) => Number(isoNumber));

      let hasError = false;

      if (allowCountriesList.length > 0) {
         const { data, error } = await tryCatch(allowCountries({ countries: allowCountriesList }));

         if (data) {
            toast.success(
               <TxResultToastView title="Countries allowed successfully!" txSuccess={data} />,
            );
         } else if (error) {
            hasError = true;
            toast.error(<TxResultToastView title="Error allowing countries" txError={error.tx} />, {
               duration: Infinity,
            });
         }
      }

      if (disallowCountriesList.length > 0) {
         const { data, error } = await tryCatch(
            disallowCountries({ countries: disallowCountriesList }),
         );

         if (data) {
            toast.success(
               <TxResultToastView title="Countries disallowed successfully!" txSuccess={data} />,
            );
         } else if (error) {
            hasError = true;
            toast.error(
               <TxResultToastView title="Error disallowing countries" txError={error.tx} />,
               { duration: Infinity },
            );
         }
      }

      if (!hasError) {
         setPendingCountriesAction({});
      }
   };

   const getCountryBadgeStatus = (country: { isoNumber: number; status: string }) => {
      const isoNumber = country.isoNumber;
      const pendingAction = pendingCountriesAction[isoNumber];

      if (pendingAction === "allow") {
         return "pending-allow";
      }
      if (pendingAction === "disallow") {
         return "pending-disallow";
      }
      return country.status.toLowerCase();
   };

   const hasPendingChanges = Object.keys(pendingCountriesAction).length > 0;

   return (
      <Card variant="indigo">
         <CardHeader
            icon={<Shield />}
            title="Country Compliance (ERC-3643)"
            description="Manage country-based compliance rules for token transfers"
            className="flex items-center justify-between"
         >
            <div className="flex items-center gap-2">
               <span className="text-sm text-gray-600 font-semibold">
                  {isModuleLoading ? "Loading..." : isModuleAdded ? "Enabled" : "Disabled"}
               </span>
               <Switch
                  checked={isModuleAdded}
                  onCheckedChange={handleToggleEnabled}
                  disabled={isModuleLoading}
                  className={isModuleLoading ? "opacity-50" : ""}
               />
            </div>
         </CardHeader>

         {isModuleAdded && (
            <CardContent className="pb-6">
               {!evmAddress && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                     <p className="font-medium text-red-800">Connect wallet first</p>
                  </div>
               )}

               <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                     <Globe className="w-5 h-5" />
                     Available Countries
                  </h3>

                  <div className="relative w-80">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                     <Input
                        placeholder="Search by name, code, or status..."
                        value={filterText}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="pl-10"
                     />
                  </div>

                  <div className="border rounded-lg">
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead>Country Name</TableHead>
                              <TableHead>Code</TableHead>
                              <TableHead>Status</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {paginatedCountries.length > 0 ? (
                              paginatedCountries.map((country) => {
                                 const badgeStatus = getCountryBadgeStatus(country);
                                 return (
                                    <TableRow key={country.code}>
                                       <TableCell className="font-medium">{country.name}</TableCell>
                                       <TableCell>{country.code}</TableCell>
                                       <TableCell>
                                          <Badge
                                             onClick={() => handleCountryStatusClick(country)}
                                             color={COUNTRY_STATUS_TO_COLOR[badgeStatus]}
                                             className={cx("cursor-pointer hover:bg-gray-100")}
                                             variant="outline"
                                          >
                                             {badgeStatus === "pending-allow" && "Pending Allow"}
                                             {badgeStatus === "pending-disallow" &&
                                                "Pending Disallow"}
                                             {badgeStatus === "allowed" && (
                                                <>
                                                   <BadgeCheck className="w-3 h-3 mr-1" />
                                                   Allowed
                                                </>
                                             )}
                                             {badgeStatus === "restricted" && "Restricted"}
                                          </Badge>
                                       </TableCell>
                                    </TableRow>
                                 );
                              })
                           ) : (
                              <TableRow>
                                 <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                                    No countries found matching your search.
                                 </TableCell>
                              </TableRow>
                           )}
                        </TableBody>
                     </Table>
                  </div>

                  <Pagination className="mt-4">
                     <PaginationContent>
                        <PaginationItem
                           className="cursor-pointer"
                           onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        >
                           <PaginationPrevious />
                        </PaginationItem>
                        <PaginationItem
                           className="cursor-pointer"
                           onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        >
                           <PaginationNext />
                        </PaginationItem>
                     </PaginationContent>
                  </Pagination>

                  <div className="flex justify-end gap-2">
                     {hasPendingChanges && (
                        <Button
                           isLoading={isPending}
                           disabled={isPending}
                           onClick={handleSaveChanges}
                           className="w-full sm:w-auto"
                        >
                           Save Changes
                        </Button>
                     )}
                  </div>
               </div>
            </CardContent>
         )}
      </Card>
   );
}
