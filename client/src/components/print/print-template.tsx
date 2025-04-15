import { FC, ReactNode, forwardRef, ForwardedRef } from 'react';

interface PrintTemplateProps {
  children: ReactNode;
  orientation?: 'portrait' | 'landscape';
}

const PrintTemplate = forwardRef<HTMLDivElement, PrintTemplateProps>(
  ({ children, orientation = 'portrait' }, ref) => {
    return (
      <div 
        ref={ref} 
        className={`hidden print:block ${orientation === 'portrait' ? 'print-a4' : 'print-a4-landscape'}`}
        style={{
          fontFamily: 'Arial, sans-serif',
          color: '#000',
          margin: '0 auto',
          padding: '10mm',
        }}
      >
        {children}
      </div>
    );
  }
);

PrintTemplate.displayName = 'PrintTemplate';

export default PrintTemplate;

// CSS to be added in global styles
// @media print {
//   .print-a4 {
//     width: 210mm;
//     height: 297mm;
//   }
//   .print-a4-landscape {
//     width: 297mm;
//     height: 210mm;
//   }
// }
