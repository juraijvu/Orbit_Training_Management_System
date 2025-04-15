import certificateTemplateSvg from '@/assets/certificates/certificate-template.svg';

export interface CertificateData {
  studentName: string;
  courseName: string;
  issueDate: string;
  certificateNumber: string;
}

/**
 * Generate a certificate SVG with the provided data
 * @param data Certificate data for generating the certificate
 * @returns SVG string with the data filled in
 */
export const generateCertificateSvg = async (data: CertificateData): Promise<string> => {
  try {
    // Fetch the SVG template
    const response = await fetch(certificateTemplateSvg);
    let svgTemplate = await response.text();
    
    // Replace placeholders with actual data
    svgTemplate = svgTemplate.replace('{{studentName}}', data.studentName);
    svgTemplate = svgTemplate.replace('{{courseName}}', data.courseName);
    svgTemplate = svgTemplate.replace('{{issueDate}}', data.issueDate);
    svgTemplate = svgTemplate.replace('{{certificateNumber}}', data.certificateNumber);
    
    return svgTemplate;
  } catch (error) {
    console.error('Error generating certificate SVG:', error);
    throw new Error('Failed to generate certificate');
  }
};

/**
 * Convert SVG to a data URL for embedding in PDFs or displaying in images
 * @param svgString SVG content as a string
 * @returns Data URL representation of the SVG
 */
export const svgToDataUrl = (svgString: string): string => {
  const base64 = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${base64}`;
};

/**
 * Get SVG as a Blob for downloading or saving files
 * @param svgString SVG content as a string
 * @returns Blob object with SVG content
 */
export const svgToBlob = (svgString: string): Blob => {
  return new Blob([svgString], { type: 'image/svg+xml' });
};

/**
 * Create a downloadable link for an SVG certificate
 * @param svgString SVG content
 * @param filename Filename to use for download
 */
export const downloadSvgCertificate = (svgString: string, filename: string = 'certificate.svg'): void => {
  const blob = svgToBlob(svgString);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};