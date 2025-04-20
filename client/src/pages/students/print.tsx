import React, { useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrintRegistration() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
  // Fetch registration details
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/registrations/${id}/print`],
    throwOnError: false
  });
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading registration",
        description: "Could not load the registration details.",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  const handlePrint = () => {
    window.print();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!data || !data.student) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Registration Not Found</h1>
        <p className="mb-4">The registration information could not be found.</p>
        <Button onClick={() => navigate("/students")}>Back to Students</Button>
      </div>
    );
  }
  
  const { student, registrationCourses } = data;
  
  // Calculate totals
  const totalPrice = registrationCourses.reduce((sum: number, rc: any) => sum + parseFloat(rc.price), 0);
  const totalDiscount = registrationCourses.reduce((sum: number, rc: any) => sum + (parseFloat(rc.price) * (parseFloat(rc.discount) / 100)), 0);
  const discountedPrice = totalPrice - totalDiscount;
  const vat = discountedPrice * 0.05; // 5% VAT
  const grandTotal = discountedPrice + vat;
  
  return (
    <>
      <div className="container py-8 print:hidden">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" onClick={() => navigate("/students")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Print Registration
          </Button>
        </div>
      </div>
      
      <div ref={printRef} className="w-full max-w-[210mm] mx-auto bg-white p-8 print:p-4 print:mx-0 print:max-w-none">
        {/* First Page */}
        <div className="first-page">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <div className="logo">
              <h1 className="text-2xl font-bold">Orbit Institute</h1>
            </div>
            <div className="text-right">
              <p>Pinnacle-211-Sheikh Zayed Rd</p>
              <p>Al Barsha 1, Dubai</p>
              <p>+971-48852477</p>
              <p>info@orbittraining.ae</p>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-bold text-center bg-[#1f1566] text-white py-2 mb-6">Registration Contract</h2>
          
          {/* Registration Details */}
          <div className="grid grid-cols-2 gap-4 mb-6 border p-2">
            <div>
              <strong>Registration No.:</strong> {student.registrationNumber}
            </div>
            <div>
              <strong>Date:</strong> {format(new Date(), "dd/MM/yyyy")}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6 border p-2">
            <div>
              <strong>Class Type:</strong> {student.classType}
            </div>
            <div></div>
          </div>
          
          {/* Personal Information */}
          <div className="mb-6">
            <h3 className="text-lg font-bold bg-[#1f1566] text-white py-1 px-2 mb-4">Personal Information</h3>
            <table className="w-full mb-6">
              <tbody>
                <tr className="border">
                  <td className="border p-2 w-1/3"><strong>Full Name:</strong></td>
                  <td className="border p-2">{student.firstName} {student.lastName}</td>
                </tr>
                <tr className="border">
                  <td className="border p-2"><strong>Date of Birth:</strong></td>
                  <td className="border p-2">{format(new Date(student.dateOfBirth), "dd/MM/yyyy")}</td>
                </tr>
                <tr className="border">
                  <td className="border p-2"><strong>Passport No:</strong></td>
                  <td className="border p-2">{student.passportNo || "-"}</td>
                </tr>
                <tr className="border">
                  <td className="border p-2"><strong>UID No:</strong></td>
                  <td className="border p-2">{student.uidNo || "-"}</td>
                </tr>
                <tr className="border">
                  <td className="border p-2"><strong>Emirates ID No:</strong></td>
                  <td className="border p-2">{student.emiratesIdNo || "-"}</td>
                </tr>
                <tr className="border">
                  <td className="border p-2"><strong>Nationality:</strong></td>
                  <td className="border p-2">{student.nationality}</td>
                </tr>
                <tr className="border">
                  <td className="border p-2"><strong>Education:</strong></td>
                  <td className="border p-2">{student.education || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Contact Details */}
          <div className="mb-6">
            <h3 className="text-lg font-bold bg-[#1f1566] text-white py-1 px-2 mb-4">Contact Details</h3>
            <table className="w-full mb-6">
              <tbody>
                <tr className="border">
                  <td className="border p-2 w-1/3"><strong>Phone No:</strong></td>
                  <td className="border p-2">{student.phoneNo}</td>
                </tr>
                <tr className="border">
                  <td className="border p-2"><strong>Alternative No:</strong></td>
                  <td className="border p-2">{student.alternativeNo || "-"}</td>
                </tr>
                <tr className="border">
                  <td className="border p-2"><strong>Email:</strong></td>
                  <td className="border p-2">{student.email}</td>
                </tr>
                <tr className="border">
                  <td className="border p-2"><strong>Country:</strong></td>
                  <td className="border p-2">{student.country || "-"}</td>
                </tr>
                <tr className="border">
                  <td className="border p-2"><strong>Company/University:</strong></td>
                  <td className="border p-2">{student.companyOrUniversityName || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Course Details */}
          <div className="mb-6">
            <h3 className="text-lg font-bold bg-[#1f1566] text-white py-1 px-2 mb-4">Course Details</h3>
            <table className="w-full mb-6">
              <tbody>
                <tr className="border">
                  <td className="border p-2 w-1/3"><strong>Courses:</strong></td>
                  <td className="border p-2">
                    {registrationCourses.map((rc: any, index: number) => (
                      <p key={index}>{rc.course.name}</p>
                    ))}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border p-2"><strong>Course Prices:</strong></td>
                  <td className="border p-2">
                    {registrationCourses.map((rc: any, index: number) => (
                      <p key={index}>{parseFloat(rc.price).toFixed(2)} AED</p>
                    ))}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border p-2"><strong>Discount:</strong></td>
                  <td className="border p-2">
                    {registrationCourses.map((rc: any, index: number) => (
                      <p key={index}>{rc.discount} %</p>
                    ))}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border p-2"><strong>VAT (5%):</strong></td>
                  <td className="border p-2">{vat.toFixed(2)} AED</td>
                </tr>
                <tr className="border">
                  <td className="border p-2"><strong>Grand Total:</strong></td>
                  <td className="border p-2">{grandTotal.toFixed(2)} AED</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Second Page - Terms and Conditions */}
        <div className="second-page break-before-page">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <div className="logo">
              <h1 className="text-2xl font-bold">Orbit Institute</h1>
            </div>
            <div className="text-right">
              <p>Pinnacle-211-Sheikh Zayed Rd</p>
              <p>Al Barsha 1, Dubai</p>
              <p>+971-48852477</p>
              <p>info@orbittraining.ae</p>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-center bg-[#1f1566] text-white py-2 mb-6">Terms and Conditions</h3>
          
          {/* Terms List */}
          <ul className="list-disc pl-5 mb-8 space-y-2">
            <li>The payment for any course must be made fully after signing the contract and prior to the course commencement.</li>
            <li>Paid fees are made only for the mentioned individual, for the specified course, and their specific time only.</li>
            <li>Students must commit to the course run, and every absence shall be counted and will result in the class cancellation without any make-up sessions to be given afterwards. Therefore, fees and other paid amounts are non-transferable & non-refundable.</li>
            <li>Method of payment: Demand Draft, Cheque, Credit/Debit Card, Bank Account transfer, links and scan.</li>
            <li>Payments are to be made in UAE Dirhams (AED) and/or a relevant currency of the international awarding Body.</li>
            <li>Course fee and examination fee may be exclusive of any applicable taxes.</li>
            <li>Attendance is mandatory.</li>
            <li>The Management team reserves the full rights to interdict the student from attending classes/exams, without any refund, in case of any non-compliance with our rules, regulations, behaviour and documentary requirements, as set and advised by the company</li>
            <li>
              <h4 className="font-bold">Cancellation of Admission:</h4>
              Again, Orbit Training Centre reserves all rights to cancel the admission of any candidate under any of the following circumstances:
              <ol className="list-[lower-alpha] pl-5 mt-2">
                <li>If fees are not paid during the agreed date</li>
                <li>If the candidate does not join the program from the starting date, even if the fees have paid.</li>
                <li>If the candidate fails to furnish the proof of the stipulated minimum qualification.</li>
                <li>In case of any mischievous occurrence after admission.</li>
              </ol>
            </li>
            <li>
              <h4 className="font-bold">The Right of Modification:</h4>
              <ol className="list-[lower-alpha] pl-5 mt-2">
                <li>The Institute reserves the full rights to alter or modify the structure of the course content.</li>
                <li>The fee structure can be modified without prior notice.</li>
                <li>The Institute reserves all the rights to impose, modify, alter, add other terms and conditions.</li>
              </ol>
            </li>
            <li><strong>Dispute Jurisdiction:</strong> Any dispute shall ideally be resolved amicably amongst the parties with mutual agreement.</li>
            <li>The provided email and contacts can be used for communications pertaining to new information and future offers.</li>
            <li>For Credit/Debit Card payments, an additional 'convenience fee' of 3% may be charged.</li>
            <li>By signing this form, you acknowledge that you have received or seen the course contents and our policies on our website, and you understand them.</li>
          </ul>
          
          {/* Declaration */}
          <div className="border p-4 mb-8">
            <p>I, hereby, certify that the information provided on both pages of the Registration Contract and all relevant forms are
            correct, updated & complete. I agree and understand that any misrepresentation of facts or omissions must be justified,
            and hence, will lead to the denial or cancellation of the admission, not to mention expulsion</p>
            <p className="mt-2">I have read, understood, and I do hereby consent to the above Terms & Conditions</p>
            <div className="mt-8 flex justify-between">
              <div>
                <p className="inline-flex items-center">
                  Date: {student.signatureDate 
                    ? new Date(student.signatureDate).toLocaleDateString() 
                    : <span className="w-32 h-px bg-black mx-2"></span>}
                </p>
              </div>
              <div>
                <p className="inline-flex items-center mb-2">Signature: 
                  {student.signatureData ? (
                    <img 
                      src={student.signatureData} 
                      alt="Digital Signature"
                      className="h-16 ml-2"
                    />
                  ) : (
                    <span className="w-32 h-px bg-black mx-2"></span>
                  )}
                </p>
                {student.termsAccepted && (
                  <p className="text-xs text-right italic mt-1">
                    *Terms and conditions accepted digitally on {student.signatureDate 
                      ? new Date(student.signatureDate).toLocaleDateString() 
                      : new Date().toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
          }
          body {
            font-size: 10pt;
          }
          .break-before-page {
            page-break-before: always;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}