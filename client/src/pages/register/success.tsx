import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function RegistrationSuccess() {
  return (
    <div className="container py-4 px-2 sm:py-12 sm:px-4">
      <div className="max-w-lg mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center px-4 sm:px-6">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Registration Successful!</CardTitle>
            <CardDescription className="mt-2">
              Thank you for registering with Orbit Institute
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center px-3 sm:px-6">
            <div className="space-y-4">
              <p className="text-sm sm:text-base">
                Your registration has been successfully submitted. Our team will review your information and contact you shortly.
              </p>
              
              <p className="text-sm sm:text-base">
                If you selected a payment method, you will receive instructions for completing your payment.
              </p>
              
              <div className="bg-muted/30 p-3 sm:p-4 rounded-md text-xs sm:text-sm mt-4">
                <p className="font-medium">Important Information</p>
                <p className="mt-2">Please keep a record of your registration. For any inquiries, contact our support team.</p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 items-center pb-6 px-3 sm:px-6">
            <Button asChild className="w-full" variant="outline">
              <Link href="https://orbitinstitute.com">Visit Our Website</Link>
            </Button>
            
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              For any assistance, please contact Orbit Institute at +971 4 885 2477
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}