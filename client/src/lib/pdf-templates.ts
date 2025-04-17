import { 
  RegistrationPdfData, 
  InvoicePdfData, 
  CertificatePdfData, 
  QuotationPdfData, 
  ProposalPdfData 
} from '@shared/types';

// Function to generate the registration form PDF content
export const generateRegistrationPdf = (data: RegistrationPdfData): string => {
  return `
    <div class="print-a4">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold">Orbit Institute</h1>
        <p class="text-lg">Student Registration Form</p>
      </div>
      
      <div class="mb-6">
        <h2 class="text-xl font-semibold border-b-2 border-gray-800 pb-2 mb-4">Personal Information</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-gray-600">Full Name:</p>
            <p class="font-semibold">${data.fullName}</p>
          </div>
          <div>
            <p class="text-gray-600">Father's Name:</p>
            <p class="font-semibold">${data.fatherName}</p>
          </div>
          <div>
            <p class="text-gray-600">Email:</p>
            <p class="font-semibold">${data.email}</p>
          </div>
          <div>
            <p class="text-gray-600">Phone:</p>
            <p class="font-semibold">${data.phone}</p>
          </div>
          <div>
            <p class="text-gray-600">Date of Birth:</p>
            <p class="font-semibold">${data.dob}</p>
          </div>
          <div>
            <p class="text-gray-600">Gender:</p>
            <p class="font-semibold">${data.gender}</p>
          </div>
        </div>
        
        <div class="mt-4">
          <p class="text-gray-600">Address:</p>
          <p class="font-semibold">${data.address}</p>
        </div>
      </div>
      
      <div class="mb-6">
        <h2 class="text-xl font-semibold border-b-2 border-gray-800 pb-2 mb-4">Course Information</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-gray-600">Course:</p>
            <p class="font-semibold">${data.course}</p>
          </div>
          <div>
            <p class="text-gray-600">Batch:</p>
            <p class="font-semibold">${data.batch}</p>
          </div>
          <div>
            <p class="text-gray-600">Registration Date:</p>
            <p class="font-semibold">${data.registrationDate}</p>
          </div>
          <div>
            <p class="text-gray-600">Student ID:</p>
            <p class="font-semibold">${data.studentId}</p>
          </div>
        </div>
      </div>
      
      <div class="mb-6">
        <h2 class="text-xl font-semibold border-b-2 border-gray-800 pb-2 mb-4">Fee Details</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-gray-600">Course Fee:</p>
            <p class="font-semibold">₹${data.courseFee.toLocaleString()}</p>
          </div>
          <div>
            <p class="text-gray-600">Discount:</p>
            <p class="font-semibold">₹${data.discount.toLocaleString()}</p>
          </div>
          <div>
            <p class="text-gray-600">Total Fee:</p>
            <p class="font-semibold">₹${data.totalFee.toLocaleString()}</p>
          </div>
          <div>
            <p class="text-gray-600">Initial Payment:</p>
            <p class="font-semibold">₹${data.initialPayment.toLocaleString()}</p>
          </div>
          <div>
            <p class="text-gray-600">Balance:</p>
            <p class="font-semibold">₹${data.balanceDue.toLocaleString()}</p>
          </div>
          <div>
            <p class="text-gray-600">Payment Mode:</p>
            <p class="font-semibold">${data.paymentMode}</p>
          </div>
        </div>
      </div>
      
      <div class="mt-16 grid grid-cols-2 gap-8">
        <div class="text-center">
          <div class="border-t-2 border-gray-800 pt-2">
            <p class="font-semibold">Student Signature</p>
          </div>
        </div>
        <div class="text-center">
          <div class="border-t-2 border-gray-800 pt-2">
            <p class="font-semibold">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Function to generate the invoice PDF content
export const generateInvoicePdf = (data: InvoicePdfData): string => {
  return `
    <div class="print-a4-landscape">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold">Orbit Institute</h1>
        <p class="text-gray-600">123, Education Hub, Tech City, India - 123456</p>
        <p class="text-gray-600">Phone: +91 1234567890 | Email: info@orbitinstitute.com</p>
      </div>
      
      <div class="text-center mb-8">
        <h2 class="text-xl font-bold">INVOICE</h2>
      </div>
      
      <div class="flex justify-between mb-8">
        <div>
          <p class="font-semibold">Invoice To:</p>
          <p>${data.fullName}</p>
          <p>${data.address}</p>
          <p>Phone: ${data.phone}</p>
        </div>
        <div>
          <p><span class="font-semibold">Invoice No:</span> ${data.invoiceNumber}</p>
          <p><span class="font-semibold">Student ID:</span> ${data.studentId}</p>
          <p><span class="font-semibold">Date:</span> ${data.date}</p>
          <p><span class="font-semibold">Payment Status:</span> ${data.paymentStatus}</p>
        </div>
      </div>
      
      <table class="w-full border-collapse mb-8">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-4 py-2 text-left">Course</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Duration</th>
            <th class="border border-gray-300 px-4 py-2 text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 px-4 py-2">${data.course}</td>
            <td class="border border-gray-300 px-4 py-2">${data.duration}</td>
            <td class="border border-gray-300 px-4 py-2 text-right">${data.amount.toLocaleString()}</td>
          </tr>
          <tr>
            <td class="border border-gray-300 px-4 py-2 text-right font-semibold" colspan="2">Discount</td>
            <td class="border border-gray-300 px-4 py-2 text-right">${data.discount.toLocaleString()}</td>
          </tr>
          <tr>
            <td class="border border-gray-300 px-4 py-2 text-right font-semibold" colspan="2">Total</td>
            <td class="border border-gray-300 px-4 py-2 text-right font-semibold">${data.total.toLocaleString()}</td>
          </tr>
          <tr>
            <td class="border border-gray-300 px-4 py-2 text-right font-semibold" colspan="2">Amount Paid</td>
            <td class="border border-gray-300 px-4 py-2 text-right">${data.amountPaid.toLocaleString()}</td>
          </tr>
          <tr>
            <td class="border border-gray-300 px-4 py-2 text-right font-semibold" colspan="2">Balance Due</td>
            <td class="border border-gray-300 px-4 py-2 text-right font-semibold">${data.balanceDue.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="mb-8">
        <p class="font-semibold mb-2">Payment Details:</p>
        <p>Payment Mode: ${data.paymentMode}</p>
        ${data.transactionId ? `<p>Transaction ID: ${data.transactionId}</p>` : ''}
        <p>Date: ${data.date}</p>
      </div>
      
      <div class="mb-8">
        <p class="font-semibold mb-2">Terms & Conditions:</p>
        <ul class="list-disc pl-5 text-sm">
          <li>Fee once paid is not refundable under any circumstances.</li>
          <li>Balance amount should be paid as per the agreed schedule.</li>
          <li>Institute reserves the right to cancel admission in case of defaulted payments.</li>
          <li>This is a computer-generated invoice and doesn't require a signature.</li>
        </ul>
      </div>
      
      <div class="text-center mt-16">
        <p class="font-semibold">Thank you for choosing Orbit Institute!</p>
      </div>
    </div>
  `;
};

// Function to generate the certificate PDF content using SVG template
export const generateCertificatePdf = (data: CertificatePdfData): string => {
  // Basic SVG certificate template as a placeholder
  // In a real application, this would be replaced with a proper SVG template
  return `
    <div class="print-a4-landscape">
      <svg width="100%" height="100%" viewBox="0 0 1123 794" xmlns="http://www.w3.org/2000/svg">
        <rect width="1123" height="794" fill="#f8f9fa" />
        <path d="M50,50 H1073 V744 H50 Z" fill="none" stroke="#3B82F6" stroke-width="10" />
        <path d="M70,70 H1053 V724 H70 Z" fill="none" stroke="#3B82F6" stroke-width="2" />
        
        <text x="561.5" y="150" font-family="Arial" font-size="50" font-weight="bold" text-anchor="middle" fill="#1E3A8A">CERTIFICATE OF COMPLETION</text>
        
        <text x="561.5" y="220" font-family="Arial" font-size="24" text-anchor="middle" fill="#4B5563">This is to certify that</text>
        
        <text x="561.5" y="300" font-family="Arial" font-size="48" font-weight="bold" text-anchor="middle" fill="#1E40AF">${data.studentName}</text>
        
        <line x1="300" y1="320" x2="823" y2="320" stroke="#3B82F6" stroke-width="2" />
        
        <text x="561.5" y="380" font-family="Arial" font-size="24" text-anchor="middle" fill="#4B5563">has successfully completed the course</text>
        
        <text x="561.5" y="450" font-family="Arial" font-size="36" font-weight="bold" text-anchor="middle" fill="#1E40AF">${data.courseName}</text>
        
        <text x="561.5" y="520" font-family="Arial" font-size="24" text-anchor="middle" fill="#4B5563">on</text>
        
        <text x="561.5" y="570" font-family="Arial" font-size="28" font-weight="bold" text-anchor="middle" fill="#1E40AF">${data.issueDate}</text>
        
        <text x="280" y="670" font-family="Arial" font-size="20" text-anchor="middle" fill="#4B5563">Certificate No: ${data.certificateNumber}</text>
        
        <text x="843" y="670" font-family="Arial" font-size="20" text-anchor="middle" fill="#4B5563">Director's Signature</text>
        
        <path d="M743,650 H943" stroke="#000000" stroke-width="1" />
      </svg>
    </div>
  `;
};

// Function to generate the quotation PDF content
export const generateQuotationPdf = (data: QuotationPdfData): string => {
  return `
    <div class="print-a4">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold">Orbit Institute</h1>
        <p class="text-gray-600">123, Education Hub, Tech City, India - 123456</p>
        <p class="text-gray-600">Phone: +91 1234567890 | Email: info@orbitinstitute.com</p>
      </div>
      
      <div class="text-center mb-8">
        <h2 class="text-xl font-bold">QUOTATION</h2>
        <p class="text-gray-600">Quotation No: ${data.quotationNumber}</p>
        <p class="text-gray-600">Date: ${data.date}</p>
      </div>
      
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-2">To:</h3>
        <p><strong>${data.companyName}</strong></p>
        <p>Attn: ${data.contactPerson}</p>
        <p>Email: ${data.email}</p>
        <p>Phone: ${data.phone}</p>
      </div>
      
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-2">Course Details:</h3>
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-4 py-2 text-left">Description</th>
              <th class="border border-gray-300 px-4 py-2 text-center">Participants</th>
              <th class="border border-gray-300 px-4 py-2 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-300 px-4 py-2">${data.courseName}</td>
              <td class="border border-gray-300 px-4 py-2 text-center">${data.participants}</td>
              <td class="border border-gray-300 px-4 py-2 text-right">${data.totalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td class="border border-gray-300 px-4 py-2 text-right font-semibold" colspan="2">Discount</td>
              <td class="border border-gray-300 px-4 py-2 text-right">${data.discount.toLocaleString()}</td>
            </tr>
            <tr>
              <td class="border border-gray-300 px-4 py-2 text-right font-semibold" colspan="2">Total Amount</td>
              <td class="border border-gray-300 px-4 py-2 text-right font-semibold">${data.finalAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-2">Terms & Conditions:</h3>
        <ul class="list-disc pl-5 text-sm">
          <li>Validity: This quotation is valid until ${data.validity}.</li>
          <li>Payment: 50% advance payment to confirm the training.</li>
          <li>Balance payment to be made before the completion of the training.</li>
          <li>All taxes applicable will be charged extra.</li>
          <li>Cancellation: Cancellation charges of 25% will be applicable if cancelled within 7 days of the training date.</li>
        </ul>
      </div>
      
      <div class="mb-8">
        <p>For any queries or clarifications, please feel free to contact us.</p>
      </div>
      
      <div class="mt-16">
        <div class="text-right">
          <p class="font-semibold">For Orbit Institute</p>
          <div class="h-16"></div>
          <p>Authorized Signatory</p>
        </div>
      </div>
    </div>
  `;
};

// Function to generate the proposal PDF content
export const generateProposalPdf = (data: ProposalPdfData): string => {
  // We don't need to process the course content as it's handled in the proposal form
  // and the template is only for the cover page, introduction, and about us sections

  // Company logo handling
  const logoHtml = data.logo ? `
    <div class="mb-8 text-center">
      <img 
        src="${data.logo}" 
        alt="${data.companyName} Logo" 
        class="max-h-24 mx-auto" 
        ${data.applyWhiteFilter ? 'style="filter: brightness(0) invert(1);"' : ''}
      />
    </div>
  ` : '';

  return `
    <div class="print-a4">
      <!-- Cover Page -->
      <div style="background-color: #000842; color: white; padding: 3rem; min-height: 100vh; display: flex; flex-direction: column;">
        ${logoHtml}
        <div class="mb-16 text-center flex-grow flex flex-col justify-center">
          <h1 class="text-3xl font-bold mb-6">${data.coverPage || 'Training Proposal'}</h1>
          <h2 class="text-2xl mb-10">Prepared for</h2>
          <h2 class="text-2xl font-bold mb-10">${data.companyName}</h2>
          <div class="mb-10">
            <p>Proposal Number: ${data.proposalNumber}</p>
            <p>Date: ${data.date}</p>
          </div>
        </div>
        <div class="mt-8 text-center">
          <h2 class="text-xl mb-4">Presented By</h2>
          <h3 class="text-lg font-bold">${data.presenterName || 'Training Consultant'}</h3>
          <p>${data.presenterDetails || ''}</p>
          <h1 class="text-2xl font-bold mt-4">Orbit Institute</h1>
          <p>Dubai, United Arab Emirates</p>
          <p>Phone: +971 50 123 4567 | Email: info@orbitinstitute.ae</p>
        </div>
      </div>
      
      <!-- Page Break -->
      <div style="page-break-after: always;"></div>
      
      <!-- Introduction -->
      <div class="mb-10">
        <h2 class="text-2xl font-bold mb-4">Introduction</h2>
        <p class="mb-4">Thank you for providing us with the opportunity to submit this proposal for corporate training services. At Orbit Institute, we specialize in delivering high-quality, customized training programs that help organizations enhance their workforce skills and capabilities.</p>
        <p>This proposal outlines our understanding of your requirements and our approach to addressing them through targeted training solutions.</p>
      </div>
      
      <!-- About Us -->
      <div class="mb-10">
        <h2 class="text-2xl font-bold mb-4">About Orbit Institute</h2>
        <p class="mb-4">Orbit Institute is a leading training and development organization with a focus on providing cutting-edge technical and professional skills training. With a team of experienced trainers and industry experts, we have successfully delivered training programs to numerous corporate clients across various sectors.</p>
        <p>Our training methodologies are designed to be interactive, practical, and relevant to real-world challenges that professionals face in their day-to-day work.</p>
      </div>
      
      <!-- Page Break -->
      <div style="page-break-after: always;"></div>
      <!-- The rest of the proposal content will be dynamically generated from proposal entries -->
      <!-- This template only provides the company introduction and about us section -->
      
      <!-- Page Break -->
      <div style="page-break-after: always;"></div>
      
      <!-- Conclusion -->
      <div class="mb-10">
        <h2 class="text-2xl font-bold mb-4">Conclusion</h2>
        <p class="mb-4">We at Orbit Institute are committed to delivering high-quality training that meets your specific requirements and exceeds your expectations. We believe that our proposed training solution will help your organization achieve its learning and development objectives effectively.</p>
        <p class="mb-4">We look forward to the opportunity of working with ${data.companyName} and contributing to the growth and development of your team.</p>
        <p>Should you have any questions or require any clarifications regarding this proposal, please do not hesitate to contact us.</p>
      </div>
      
      <div class="mt-16">
        <div class="text-right">
          <p class="font-semibold">For Orbit Institute</p>
          <div class="h-16"></div>
          <p>Authorized Signatory</p>
        </div>
      </div>
    </div>
  `;
};
