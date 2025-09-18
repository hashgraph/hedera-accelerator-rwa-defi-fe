"use client";

import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import { FormSelect } from "@/components/ui/formSelect";
import { Button } from "@/components/ui/button";
import { tryCatch } from "@/services/tryCatch";
import { StorageKeys, storageService } from "@/services/storageService";
import { TxResultToastView } from "../CommonViews/TxResultView";
import * as uuid from "uuid";
import { useAccount } from "wagmi";

type PaymentFormProps = {
   isSubmitting: boolean;
   buildingId: string;
   onSubmit: (amount: string) => Promise<any>;
   onClose: () => void;
   onSuccess: () => void;
};

export function PaymentForm({
   isSubmitting,
   buildingId,
   onSubmit,
   onClose,
   onSuccess,
}: PaymentFormProps) {
   const [amount, setAmount] = useState("");
   const [revenueType, setRevenueType] = useState("rental");
   const [notes, setNotes] = useState("");
   const { address: evmAddress } = useAccount();

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      const { data, error } = await tryCatch(onSubmit(amount));

      if (!error && data?.approveTx && data?.depositTx) {
         toast.success(
            <TxResultToastView
               title={`Confirmation of spending ${amount} USDC`}
               txSuccess={data.approveTx}
            />,
            {
               duration: 5000,
            },
         );

         toast.success(
            <TxResultToastView
               title={`Payment of ${amount} USDC submitted to treasury.`}
               txSuccess={data.depositTx}
            />,
            {
               duration: 5000,
            },
         );

         const _payments = await storageService.restoreItem<any[]>(StorageKeys.Payments);

         const newPayment = {
            id: uuid.v4(), // Add unique ID
            amount: parseFloat(amount).toString(),
            sender: evmAddress,
            dateCreated: new Date().toISOString(), // Use ISO string for consistency
            buildingId,
            revenueType,
            notes,
         };

         storageService.storeItem(StorageKeys.Payments, [...(_payments ?? []), newPayment]);

         setAmount("");
         setNotes("");
         setRevenueType("");
         onClose();
         onSuccess();
      } else {
         toast.error(`Error submitting payment: ${error}`);
      }
   }

   return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 space-y-4">
         <div>
            <Label htmlFor="amount">Amount (USDC)</Label>
            <Input
               id="amount"
               type="number"
               step="0.01"
               min="0"
               value={amount}
               onChange={(e) => setAmount(e.target.value)}
               placeholder="Enter amount in USDC"
               className="mt-1"
               required
            />
         </div>

         <div className="hidden">
            <FormSelect name="revenueType" label="Revenue Type" placeholder="Revenue type">
               <SelectItem value="rental">Rental</SelectItem>
               <SelectItem value="parking">Parking Fees</SelectItem>
               <SelectItem value="advertising">Advertising Revenue</SelectItem>
               <SelectItem value="service">Service Charges</SelectItem>
            </FormSelect>
         </div>

         <div className="hidden">
            <Label htmlFor="notes">Notes (Memo)</Label>
            <Textarea
               id="notes"
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               placeholder="Optional memo..."
               className="mt-1"
               rows={3}
            />
         </div>

         <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Submit Payment
         </Button>
      </form>
   );
}
