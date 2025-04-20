import React, { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  width?: number;
  height?: number;
}

export function SignaturePad({
  value,
  onChange,
  className,
  width = 400,
  height = 200,
}: SignaturePadProps) {
  const signatureRef = useRef<SignatureCanvas>(null);

  useEffect(() => {
    // If there's a value, load it into the signature pad
    if (value && signatureRef.current) {
      signatureRef.current.fromDataURL(value);
    }
  }, [value]);

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      onChange("");
    }
  };

  const handleSave = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const dataURL = signatureRef.current.toDataURL();
      onChange(dataURL);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="border rounded-md overflow-hidden bg-white">
        <SignatureCanvas
          ref={signatureRef}
          canvasProps={{
            width,
            height,
            className: "signature-canvas",
          }}
          onEnd={handleSave}
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="flex-1"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}