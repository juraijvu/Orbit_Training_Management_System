import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Phone } from "lucide-react";

export default function RegistrationSuccess() {
  return (
    <div className="container py-16 max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Registration Successful!</CardTitle>
          <CardDescription className="text-lg">
            Thank you for registering with Orbit Institute
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-center">
              Your registration has been successfully submitted. We will contact you shortly to confirm your enrollment and provide additional information about your course.
            </p>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">Next Steps:</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>You will receive a confirmation email with your registration details.</li>
              <li>If you selected a payment method that requires further action, instructions will be provided.</li>
              <li>Our team will contact you to finalize your enrollment and schedule your classes.</li>
            </ul>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center gap-4 pt-4">
            <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = "/"}>
              <Home className="h-4 w-4" />
              Return to Home
            </Button>
            <Button className="flex items-center gap-2" onClick={() => window.location.href = "tel:+97148852477"}>
              <Phone className="h-4 w-4" />
              Contact Us
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}