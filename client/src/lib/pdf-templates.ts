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

// Function to generate the certificate PDF content to match the company style
export const generateCertificatePdf = (data: CertificatePdfData): string => {
  return `
    <div class="print-a4-landscape">
      <div class="certificate-container" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: white; position: relative; overflow: hidden; padding: 20px;">
        <!-- Gold header border -->
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 40px; background-color: #d4af37;"></div>
        
        <!-- Dotted line -->
        <div style="position: absolute; top: 55px; left: 0; right: 0; height: 2px; display: flex;">
          ${Array(50).fill('<span style="display: inline-block; width: 10px; height: 2px; background-color: #d4af37; margin-right: 5px;"></span>').join('')}
        </div>
        
        <!-- Logo and Institute Name -->
        <div style="text-align: center; margin-top: 80px; margin-bottom: 30px;">
          <div style="background-color: #f5f5f5; width: 120px; height: 120px; border-radius: 60px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
            <div style="font-size: 28px; font-weight: bold; color: #333;">ORBIT</div>
          </div>
          <div style="font-size: 22px; margin-top: 5px; color: #333;">INSTITUTE</div>
        </div>
        
        <!-- Certificate Title -->
        <h1 style="font-size: 42px; font-weight: bold; color: #333; margin-bottom: 10px; text-align: center;">Certificate of Achievement</h1>
        
        <!-- Golden underline -->
        <div style="width: 70%; height: 2px; background-color: #d4af37; margin-bottom: 40px;"></div>
        
        <!-- Certificate Text -->
        <div style="font-size: 20px; color: #333; margin-bottom: 20px;">This is to certify that</div>
        
        <!-- Student Name -->
        <div style="font-size: 36px; font-style: italic; color: #333; margin-bottom: 20px;">${data.studentName}</div>
        
        <!-- Course Text -->
        <div style="font-size: 20px; color: #333; margin-bottom: 20px;">has successfully completed the course</div>
        
        <!-- Course Name -->
        <div style="font-size: 32px; font-weight: bold; color: #333; margin-bottom: 20px;">${data.courseName}</div>
        
        <!-- Additional Text -->
        <div style="font-size: 20px; color: #333; margin-bottom: 30px;">with excellence and dedication</div>
        
        <!-- Date -->
        <div style="font-size: 18px; color: #333; margin-bottom: 40px;">${data.issueDate}</div>
        
        <!-- Signature Section -->
        <div style="display: flex; justify-content: space-around; width: 80%; margin-top: 20px;">
          <div style="text-align: center; width: 200px;">
            <div style="border-top: 1px solid #333; padding-top: 10px;">Director</div>
          </div>
          
          <div style="text-align: center; width: 200px;">
            <div style="border-top: 1px solid #333; padding-top: 10px;">Training Manager</div>
          </div>
        </div>
        
        <!-- Certificate Number -->
        <div style="position: absolute; bottom: 30px; left: 30px; font-size: 12px; color: #666;">
          Certificate No: ${data.certificateNumber}
        </div>
      </div>
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

  // Trainer profile page, to be inserted before the company profile page
  const trainerProfileHtml = data.trainer ? `
    <!-- Page Break -->
    <div style="page-break-after: always;"></div>
    
    <!-- Trainer Profile -->
    <div class="mb-10">
      <h2 class="text-2xl font-bold mb-4">Meet Your Trainer</h2>
      <div class="flex flex-col space-y-4">
        <div>
          <h3 class="text-xl font-semibold mb-2">${data.trainer.fullName}</h3>
          <p class="text-lg italic mb-4">${data.trainer.specialization}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p class="text-gray-600">Email:</p>
            <p class="font-semibold">${data.trainer.email}</p>
          </div>
          <div>
            <p class="text-gray-600">Phone:</p>
            <p class="font-semibold">${data.trainer.phone}</p>
          </div>
        </div>
        
        ${data.trainer.profilePdf ? `
          <div class="mt-4">
            <p class="text-gray-600 mb-2">A detailed trainer profile is available upon request.</p>
            <p class="text-gray-600">The trainer profile includes complete education background, professional certifications, work experience, and areas of expertise.</p>
          </div>
        ` : `
          <div class="mt-4">
            <p class="text-gray-600">This trainer specializes in delivering high-quality training in the following areas:</p>
            <ul class="list-disc pl-5 mt-2">
              <li>Professional training and development</li>
              <li>Technical skills enhancement</li>
              <li>Hands-on practical workshops</li>
              <li>Customized learning experiences</li>
            </ul>
          </div>
        `}
      </div>
    </div>
  ` : '';

  // We're no longer handling the company profile in the HTML template
  // It will be attached separately as a PDF in the download function
  // This variable has been removed

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
      
      <!-- Add trainer profile before the conclusion -->
      ${trainerProfileHtml}
      
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
      
      <!-- Company profile is now added separately in the download function -->
    </div>
  `;
};

// Function to generate proposal PDF using a custom template
export const generateProposalWithTemplate = (data: ProposalPdfData, template: any): string => {
  try {
    // Parse template fields from the database
    const coverFields = JSON.parse(template.coverPageFields || '[]');
    const page2Template = JSON.parse(template.page2Template || '{}');
    const page3Template = JSON.parse(template.page3Template || '{}');
    const page4Template = JSON.parse(template.page4Template || '{}');
    const page5Template = JSON.parse(template.page5Template || '{}');
    
    // Create template-based cover page
    let coverPageHtml = `
      <div class="print-page" style="position: relative; width: 210mm; height: 297mm; overflow: hidden;">
    `;
    
    // Add background image if available
    if (template.coverPageImage) {
      coverPageHtml += `
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;">
          <img src="${template.coverPageImage}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
      `;
    }
    
    // Render template fields with actual data
    coverFields.forEach((field: any) => {
      if (field.type === 'text') {
        let textValue = field.value || field.placeholder || '';
        
        // Replace placeholders with actual data
        textValue = textValue.replace(/\{\{companyName\}\}/g, data.companyName || '');
        textValue = textValue.replace(/\{\{contactPerson\}\}/g, data.contactPerson || '');
        textValue = textValue.replace(/\{\{email\}\}/g, data.email || '');
        textValue = textValue.replace(/\{\{phone\}\}/g, data.phone || '');
        textValue = textValue.replace(/\{\{courseName\}\}/g, data.courses?.[0] || '');
        textValue = textValue.replace(/\{\{presenterName\}\}/g, data.presenterName || '');
        textValue = textValue.replace(/\{\{proposalDate\}\}/g, data.date || '');
        textValue = textValue.replace(/\{\{trainerName\}\}/g, data.trainer?.fullName || '');
        
        coverPageHtml += `
          <div style="
            position: absolute;
            left: ${field.x}px;
            top: ${field.y}px;
            width: ${field.width}px;
            height: ${field.height}px;
            font-family: ${field.fontFamily || 'Arial, sans-serif'};
            font-size: ${field.fontSize || 16}px;
            font-weight: ${field.bold ? 'bold' : 'normal'};
            font-style: ${field.italic ? 'italic' : 'normal'};
            color: ${field.color || '#000000'};
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            overflow: hidden;
          ">
            ${textValue}
          </div>
        `;
      } else if (field.type === 'image') {
        const isOnBlackBackground = field.x < 250;
        const logoUrl = data.logo || 'https://via.placeholder.com/120';
        
        coverPageHtml += `
          <div style="
            position: absolute;
            left: ${field.x}px;
            top: ${field.y}px;
            width: ${field.width}px;
            height: ${field.height}px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <img src="${logoUrl}" alt="Logo" style="
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
              filter: ${isOnBlackBackground ? 'brightness(0) invert(1)' : 'none'};
            " />
          </div>
        `;
      } else if (field.type === 'rectangle') {
        coverPageHtml += `
          <div style="
            position: absolute;
            left: ${field.x}px;
            top: ${field.y}px;
            width: ${field.width}px;
            height: ${field.height}px;
            background-color: ${field.backgroundColor || '#000000'};
          "></div>
        `;
      }
    });
    
    coverPageHtml += `</div>`;
    
    // Generate content pages using templates
    let contentPages = '';
    
    // Page 2 - Company Introduction
    if (page2Template.title && page2Template.content) {
      contentPages += `
        <div class="print-page" style="padding: 40px;">
          <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #333;">${page2Template.title}</h1>
          <div style="font-size: 14px; line-height: 1.6; color: #555;">
            ${page2Template.content.replace(/\n/g, '<br>')}
          </div>
        </div>
      `;
    }
    
    // Page 3 - Services Overview
    if (page3Template.title && page3Template.content) {
      contentPages += `
        <div class="print-page" style="padding: 40px;">
          <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #333;">${page3Template.title}</h1>
          <div style="font-size: 14px; line-height: 1.6; color: #555;">
            ${page3Template.content.replace(/\n/g, '<br>')}
          </div>
        </div>
      `;
    }
    
    // Page 4 - Why Choose Us
    if (page4Template.title && page4Template.content) {
      contentPages += `
        <div class="print-page" style="padding: 40px;">
          <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #333;">${page4Template.title}</h1>
          <div style="font-size: 14px; line-height: 1.6; color: #555;">
            ${page4Template.content.replace(/\n/g, '<br>')}
          </div>
        </div>
      `;
    }
    
    // Page 5 - Training Program Details
    if (page5Template.title && page5Template.content) {
      contentPages += `
        <div class="print-page" style="padding: 40px;">
          <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #333;">${page5Template.title}</h1>
          <div style="font-size: 14px; line-height: 1.6; color: #555;">
            ${page5Template.content.replace(/\n/g, '<br>')}
          </div>
        </div>
      `;
    }
    
    // Course details page
    let coursesHtml = '';
    if (data.content && Array.isArray(data.content)) {
      data.content.forEach((module: any) => {
        coursesHtml += `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px;">${module.name || 'Module'}</h3>
            ${module.subItems && Array.isArray(module.subItems) ? `
              <ul style="margin-left: 20px; color: #555;">
                ${module.subItems.map((item: string) => `<li style="margin-bottom: 5px;">${item}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `;
      });
    }
    
    const courseDetailsPage = `
      <div class="print-page" style="padding: 40px;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #333;">Course Details</h1>
        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #444;">${data.courses?.[0] || 'Training Course'}</h2>
        ${coursesHtml}
        
        <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333;">Training Investment</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Total Amount:</span>
            <span style="font-weight: bold;">AED ${data.totalAmount}</span>
          </div>
          ${data.discount && parseFloat(data.discount) > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Discount (${data.discount}%):</span>
              <span style="color: #28a745;">-AED ${(parseFloat(data.totalAmount) * parseFloat(data.discount) / 100).toFixed(2)}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 2px solid #dee2e6; padding-top: 10px;">
            <span>Final Amount:</span>
            <span style="color: #007bff;">AED ${data.finalAmount}</span>
          </div>
        </div>
      </div>
    `;
    
    return `
      <style>
        @page { margin: 0; }
        .print-page { page-break-after: always; width: 210mm; height: 297mm; }
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
      </style>
      ${coverPageHtml}
      ${contentPages}
      ${courseDetailsPage}
    `;
    
  } catch (error) {
    console.error('Error generating proposal with template:', error);
    // Fallback to standard template
    return generateProposalPdf(data);
  }
};
