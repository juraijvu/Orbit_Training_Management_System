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

  // Clear previous effects when component is mounted
  useEffect(() => {
    // Make sure signature pad is clear on initial render
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
    
    // If there's a value, load it into the signature pad
    if (value && signatureRef.current) {
      signatureRef.current.fromDataURL(value);
    }
    
    // Clean up function to prevent duplicate event listeners
    return () => {
      if (signatureRef.current) {
        signatureRef.current.off();
      }
    };
  }, []); // Only run once on mount
  
  // Effect to update signature pad when value changes externally
  useEffect(() => {
    if (value && signatureRef.current) {
      signatureRef.current.clear();
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
          options={{
            penColor: "black",
            velocityFilterWeight: 0.7,
            minWidth: 0.5,
            maxWidth: 2.5,
            throttle: 16, // Increase throttle to avoid duplicate lines
          }}
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