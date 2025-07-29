"use client";
import { AuditManagementForm } from "@/components/Audit/auditManagement";
import { useParams } from "next/navigation";

export default function AuditCreatePage() {
   const { id } = useParams();

   return <AuditManagementForm buildingAddress={id as `0x${string}`} />;
}
