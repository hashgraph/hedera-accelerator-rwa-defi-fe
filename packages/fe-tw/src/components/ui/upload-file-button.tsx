import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { cx } from "class-variance-authority";

interface IProps {
   isLoading?: boolean;
   onFileAdded: (file: File) => void;
   className?: string;
}

function UploadFileButton({ className, isLoading, onFileAdded }: IProps) {
   const ref = useRef<HTMLInputElement>(null);

   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         onFileAdded(file);
      }
   };

   return (
      <Button
         isLoading={isLoading}
         disabled={isLoading}
         type="button"
         title="Upload image"
         variant="outline"
         onClick={() => ref.current?.click()}
         className={cx(className)}
      >
         {!isLoading && <Upload />}
         <input ref={ref} type="file" className="hidden" onChange={handleFileChange} />
      </Button>
   );
}

export { UploadFileButton };
