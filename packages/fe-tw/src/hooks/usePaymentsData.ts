"use client";

import { addPaymentForBuilding, getPaymentsForBuilding } from "@/services/treasuryService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePaymentsData(buildingId: string) {
   const queryClient = useQueryClient();

   const {
      data: payments,
      isLoading,
      isError,
   } = useQuery({
      queryKey: ["payments", buildingId],
      queryFn: () => getPaymentsForBuilding(buildingId),
   });

   const addPaymentMutation = useMutation({
      mutationFn: async (args: { amount: number; revenueType: string; notes?: string }) => {
         return Promise.resolve(
            addPaymentForBuilding(buildingId, {
               date: new Date(),
               amount: args.amount,
               revenueType: args.revenueType,
               notes: args.notes,
               buildingId,
            }),
         );
      },
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ["payments", buildingId],
         });
      },
   });

   return {
      payments,
      isLoading,
      isError,
      addPayment: addPaymentMutation.mutateAsync,
   };
}
