import React, { useRef, useEffect, useState } from "react";
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
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Clear and load any existing value
  useEffect(() => {
    if (!sigCanvas.current) return;
    
    // If we have an existing value, load it
    if (value && sigCanvas.current) {
      setTimeout(() => {
        if (sigCanvas.current) {
          sigCanvas.current.clear();
          sigCanvas.current.fromDataURL(value);
        }
      }, 50);
    }
  }, [value]);

  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      onChange("");
    }
  };

  const handleBegin = () => {
    setIsDrawing(true);
  };

  const handleEnd = () => {
    setIsDrawing(false);
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const trimmedDataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      onChange(trimmedDataURL);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="border rounded-md overflow-hidden bg-white">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width,
            height,
            className: "signature-canvas",
            style: { width: '100%', height: '100%' }
          }}
          backgroundColor="white"
          penColor="black"
          onBegin={handleBegin}
          onEnd={handleEnd}
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