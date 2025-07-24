"use client";
import { AuditManagementForm } from "@/components/Audit/auditManagement";
import { useParams } from "next/navigation";
import React, { Suspense } from "react";

export default async function RecordIdEditPage() {
   const { id, recordId } = useParams();

   return (
      <AuditManagementForm buildingAddress={id as `0x${string}`} recordId={recordId as string} />
   );
}
