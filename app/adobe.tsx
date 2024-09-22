import React from 'react';
import { DocumentSandbox, PDFExport } from '@adobe/express-sdk';

interface PdfExportProps {
  data: Record<string, string | number>;
}

const PdfExport: React.FC<PdfExportProps> = ({ data }) => {

  const createPDF = async (data: Record<string, string | number>): Promise<void> => {
    try {
      // Initialize Document Sandbox
      const sandbox = new DocumentSandbox();

      // Create a new document in the sandbox
      const document = await sandbox.createDocument();

      // Loop over the object keys and add the key-value pairs to the document
      Object.keys(data).forEach((key, index) => {
        document.addText(`${key}: ${data[key]}`, {
          fontSize: 12,
          fontFamily: 'Helvetica',
          color: '#000000',
          position: {
            x: 50,
            y: 50 + (index * 20), // Adjust y position based on index
          }
        });
      });

      // Export the document as a PDF
      const pdf = await PDFExport(document);

      // Create a download link for the PDF
      const blob = new Blob([pdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'exported-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  return (
    <div>
      <button onClick={() => createPDF(data)}>Export PDF</button>
    </div>
  );
};

export default PdfExport;