import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
   onChangeValue: (value: string) => void;
   onSubmitDepositValue: () => void;
   depositEnabled?: boolean;
};

export const DepositToSliceForm = ({
   onChangeValue,
   onSubmitDepositValue,
   depositEnabled,
}: Props) => {
   return (
      <div className="space-y-4">
         <div>
            <Label htmlFor="tokenAmount">Token Amount to invest</Label>
            <Input
               id="tokenAmount"
               type="number"
               placeholder="e.g. 100"
               onChange={(e) => onChangeValue(e.target.value)}
               className="mt-1"
            />
         </div>
         <Button
            type="button"
            onClick={onSubmitDepositValue}
            disabled={!depositEnabled}
            className="w-full"
         >
            Invest to Slice
         </Button>
      </div>
   );
};
