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
  const canvasRef = useRef<SignatureCanvas>(null);

  // Only load the initial value
  useEffect(() => {
    if (!canvasRef.current) return;
    
    try {
      // Clear the canvas
      canvasRef.current.clear();
      
      // If we have a value, load it
      if (value) {
        canvasRef.current.fromDataURL(value);
      }
    } catch (error) {
      console.error("Error initializing signature canvas:", error);
    }
  }, []);

  // Simple save function that doesn't use any fancy trimming
  const handleEndDrawing = () => {
    if (!canvasRef.current) return;
    
    try {
      if (!canvasRef.current.isEmpty()) {
        // Just use the basic toDataURL without trimming
        const dataURL = canvasRef.current.toDataURL('image/png');
        onChange(dataURL);
      }
    } catch (error) {
      console.error("Error saving signature:", error);
    }
  };

  const handleClear = () => {
    if (!canvasRef.current) return;
    
    try {
      canvasRef.current.clear();
      onChange("");
    } catch (error) {
      console.error("Error clearing signature:", error);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="border rounded-md overflow-hidden bg-white">
        <SignatureCanvas
          ref={canvasRef}
          canvasProps={{
            width,
            height,
            className: "signature-canvas"
          }}
          backgroundColor="white"
          penColor="black"
          clearOnResize={false}
          onEnd={handleEndDrawing}
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