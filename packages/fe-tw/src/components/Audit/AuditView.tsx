"use client";

import { useState } from "react";
import { Calendar, CheckCircle, XCircle, Search, ExternalLink, Pencil } from "lucide-react";
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
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { useBuildingAudit } from "@/hooks/useBuildingAudit";
import { format, isAfter } from "date-fns";
import { capitalize, filter, includes, map } from "lodash";
import Link from "next/link";
import { clsx as cx } from "clsx";
import { useAccount } from "wagmi";
import { Button } from "../ui/button";

type AuditViewProps = {
   buildingId: string;
   buildingAddress: `0x${string}`;
};

const TYPE_TO_COLOR: Record<string, "green" | "red" | "blue" | "indigo" | "gray"> = {
   energy: "green",
   safety: "red",
   structural: "blue",
   environmental: "indigo",
   default: "gray",
};

const RATING_TO_COLOR: Record<string, "green" | "blue" | "yellow" | "red" | "gray"> = {
   excellent: "green",
   good: "blue",
   fair: "yellow",
   poor: "red",
   default: "gray",
};

export function AuditView({ buildingAddress }: AuditViewProps) {
   const { address: evmAddress } = useAccount();
   const [filterText, setFilterText] = useState("");
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 10;

   const {
      auditRecords: auditData = [],
      auditRecordsLoading,
      auditors,
   } = useBuildingAudit(buildingAddress);

   const isCurrentUserAuditor = includes(auditors, evmAddress);

   const filteredAudits = auditData?.filter((audit) => {
      const searchLower = filterText.toLowerCase();
      return (
         audit.companyName?.toLowerCase().includes(searchLower) ||
         audit.auditorName?.toLowerCase().includes(searchLower) ||
         audit.auditType?.toLowerCase().includes(searchLower) ||
         audit.auditReferenceId?.toLowerCase().includes(searchLower) ||
         audit.overallConditionRating?.toLowerCase().includes(searchLower)
      );
   });

   const totalPages = Math.ceil(filteredAudits.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const paginatedAudits = filteredAudits.slice(startIndex, startIndex + itemsPerPage);

   const handleFilterChange = (value: string) => {
      setFilterText(value);
      setCurrentPage(1);
   };

   if (auditRecordsLoading) {
      return <div className="text-center">Loading audit records...</div>;
   }

   const deriveRecordStatus = (record: (typeof auditData)[number]) => {
      if (record.revoked) {
         return "Revoked";
      } else if (isAfter(new Date(record.auditValidityTo), new Date())) {
         return "Outdated";
      } else {
         return "Active";
      }
   };

   return (
      <div>
         <div className="flex">
            <div className="relative w-80">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
               <Input
                  placeholder="Search by company, auditor, type, or reference..."
                  value={filterText}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="pl-10"
               />
            </div>
            {isCurrentUserAuditor && (
               <div className="ml-auto">
                  <Link href={`audit/create`}>
                     <Button>Add Audit</Button>
                  </Link>
               </div>
            )}
         </div>

         <div className="border rounded-lg mt-4">
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead>Company</TableHead>
                     <TableHead>Auditor</TableHead>
                     <TableHead>Type</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Reference ID</TableHead>
                     <TableHead>Audit Date</TableHead>
                     <TableHead>Validity</TableHead>
                     <TableHead>Condition</TableHead>
                     <TableHead>Action Required</TableHead>
                     <TableHead>Next Audit</TableHead>
                     <TableHead>Audit file</TableHead>
                     {isCurrentUserAuditor && <TableHead>Actions</TableHead>}
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {paginatedAudits.length > 0 ? (
                     paginatedAudits.map((audit) => (
                        <TableRow key={audit.recordId?.toString()}>
                           <TableCell className="font-medium">
                              {audit.companyName || "N/A"}
                           </TableCell>
                           <TableCell>{audit.auditorName || "N/A"}</TableCell>
                           <TableCell>
                              <Badge color={TYPE_TO_COLOR[audit.auditType]} variant="outline">
                                 {capitalize(audit.auditType) || "N/A"}
                              </Badge>
                           </TableCell>
                           <TableCell className="font-semibold">
                              {deriveRecordStatus(audit)}
                           </TableCell>
                           <TableCell className="font-mono text-sm">
                              {audit.auditReferenceId || "N/A"}
                           </TableCell>

                           <TableCell>
                              {format(new Date(audit.auditDate), "MMM dd, yyyy")}
                           </TableCell>
                           <TableCell className="text-sm">
                              <div className="flex flex-col">
                                 <span>
                                    {format(new Date(audit.auditValidityFrom), "MMM dd, yyyy")}
                                 </span>
                                 <span className="text-gray-500">to</span>
                                 <span>
                                    {format(new Date(audit.auditValidityTo), "MMM dd, yyyy")}
                                 </span>
                              </div>
                           </TableCell>
                           <TableCell>
                              <Badge
                                 color={RATING_TO_COLOR[audit.overallConditionRating]}
                                 variant="outline"
                              >
                                 {capitalize(audit.overallConditionRating) || "N/A"}
                              </Badge>
                           </TableCell>
                           <TableCell>
                              <div className="flex items-center gap-1">
                                 {audit.immediateActionRequired === "yes" ? (
                                    <>
                                       <XCircle className="w-4 h-4 text-red-500" />
                                       <span className="text-red-600 text-sm">Yes</span>
                                    </>
                                 ) : (
                                    <>
                                       <CheckCircle className="w-4 h-4 text-green-500" />
                                       <span className="text-green-600 text-sm">No</span>
                                    </>
                                 )}
                              </div>
                           </TableCell>
                           <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                 <Calendar className="w-3 h-3 text-gray-400" />
                                 {format(new Date(audit.nextRecommendedAuditDate), "MMM dd, yyyy")}
                              </div>
                           </TableCell>
                           <TableCell>
                              <Link
                                 className="font-medium underline flex gap-1 text-indigo-700 items-center"
                                 target="_blank"
                                 href={audit.auditReportIpfsUrl!}
                              >
                                 View <ExternalLink size={16} />
                              </Link>
                           </TableCell>
                           {isCurrentUserAuditor && (
                              <TableCell>
                                 <Button variant="outline" size="sm">
                                    <Link
                                       className="flex items-center gap-1"
                                       href={`/building/${buildingAddress}/audit/${audit.recordId}`}
                                    >
                                       <Pencil /> Edit
                                    </Link>
                                 </Button>
                              </TableCell>
                           )}
                        </TableRow>
                     ))
                  ) : (
                     <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                           {filterText
                              ? "No audit records found matching your search."
                              : "No audit records available."}
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </div>

         {totalPages > 1 && (
            <Pagination className="mt-4">
               <PaginationContent>
                  <PaginationItem
                     className="cursor-pointer"
                     onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                     <PaginationPrevious />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                     const pageNum = i + 1;
                     return (
                        <PaginationItem key={pageNum} className="cursor-pointer">
                           <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                           >
                              {pageNum}
                           </PaginationLink>
                        </PaginationItem>
                     );
                  })}

                  <PaginationItem
                     className="cursor-pointer"
                     onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  >
                     <PaginationNext />
                  </PaginationItem>
               </PaginationContent>
            </Pagination>
         )}

         {paginatedAudits.length > 0 && (
            <div className="text-sm text-gray-500 text-center mt-4">
               Showing {startIndex + 1} to{" "}
               {Math.min(startIndex + itemsPerPage, filteredAudits.length)} of{" "}
               {filteredAudits.length} audit records
            </div>
         )}
      </div>
   );
}
