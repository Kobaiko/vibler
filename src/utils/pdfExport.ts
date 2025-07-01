import html2pdf from 'html2pdf.js';

interface PDFExportOptions {
  filename: string;
  elementId: string;
  title?: string;
  margin?: number;
  format?: string;
  orientation?: 'portrait' | 'landscape';
}

export const exportToPDF = async (options: PDFExportOptions) => {
  const {
    filename,
    elementId,
    title = 'Document',
    margin = 10,
    format = 'a4',
    orientation = 'portrait'
  } = options;

  try {
    const element = document.getElementById(elementId);
    
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Create a temporary container for the PDF content
    const pdfContainer = document.createElement('div');
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    pdfContainer.style.top = '0';
    pdfContainer.style.width = '210mm'; // A4 width
    pdfContainer.style.backgroundColor = 'white';
    pdfContainer.style.padding = '20px';
    pdfContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    
    // Add title if provided
    if (title) {
      const titleElement = document.createElement('h1');
      titleElement.textContent = title;
      titleElement.style.marginBottom = '20px';
      titleElement.style.color = '#1f2937';
      titleElement.style.fontSize = '24px';
      titleElement.style.fontWeight = 'bold';
      pdfContainer.appendChild(titleElement);
    }
    
    // Style the cloned content for PDF
    styleElementForPDF(clonedElement);
    pdfContainer.appendChild(clonedElement);
    
    // Append to body temporarily
    document.body.appendChild(pdfContainer);

    const opt = {
      margin: margin,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { 
        unit: 'mm', 
        format: format, 
        orientation: orientation,
        putOnlyUsedFonts: true,
        floatPrecision: 16
      }
    };

    // Generate PDF and trigger download
    await html2pdf().set(opt).from(pdfContainer).save();
    
    // Clean up
    document.body.removeChild(pdfContainer);
    
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
};

// Helper function to style elements for PDF export
const styleElementForPDF = (element: HTMLElement) => {
  // Ensure proper styling for PDF
  element.style.backgroundColor = 'white';
  element.style.color = '#1f2937';
  element.style.width = '100%';
  element.style.maxWidth = 'none';
  element.style.boxShadow = 'none';
  element.style.border = 'none';
  
  // Style all child elements
  const allElements = element.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    
    // Remove shadows and borders that don't translate well to PDF
    htmlEl.style.boxShadow = 'none';
    htmlEl.style.textShadow = 'none';
    
    // Ensure text is readable
    if (htmlEl.style.color === 'transparent' || htmlEl.style.color === '') {
      htmlEl.style.color = '#1f2937';
    }
    
    // Handle cards and containers
    if (htmlEl.classList.contains('card') || 
        htmlEl.classList.contains('border') ||
        htmlEl.tagName === 'SECTION') {
      htmlEl.style.border = '1px solid #e5e7eb';
      htmlEl.style.borderRadius = '8px';
      htmlEl.style.padding = '16px';
      htmlEl.style.marginBottom = '16px';
      htmlEl.style.backgroundColor = '#ffffff';
    }
    
    // Handle badges and tags
    if (htmlEl.classList.contains('badge') || 
        htmlEl.classList.contains('bg-blue') ||
        htmlEl.classList.contains('bg-gray')) {
      htmlEl.style.backgroundColor = '#f3f4f6';
      htmlEl.style.color = '#374151';
      htmlEl.style.border = '1px solid #d1d5db';
      htmlEl.style.padding = '4px 8px';
      htmlEl.style.borderRadius = '4px';
      htmlEl.style.display = 'inline-block';
      htmlEl.style.margin = '2px';
    }
    
    // Handle buttons
    if (htmlEl.tagName === 'BUTTON') {
      htmlEl.style.display = 'none'; // Hide interactive elements in PDF
    }
    
    // Handle icons
    if (htmlEl.tagName === 'SVG') {
      htmlEl.style.display = 'inline-block';
      htmlEl.style.width = '16px';
      htmlEl.style.height = '16px';
      htmlEl.style.verticalAlign = 'middle';
    }
    
    // Ensure proper spacing for lists
    if (htmlEl.tagName === 'UL' || htmlEl.tagName === 'OL') {
      htmlEl.style.paddingLeft = '20px';
      htmlEl.style.marginBottom = '12px';
    }
    
    if (htmlEl.tagName === 'LI') {
      htmlEl.style.marginBottom = '4px';
    }
    
    // Handle headings
    if (htmlEl.tagName.match(/^H[1-6]$/)) {
      htmlEl.style.color = '#1f2937';
      htmlEl.style.fontWeight = 'bold';
      htmlEl.style.marginTop = '16px';
      htmlEl.style.marginBottom = '8px';
    }
    
    // Handle paragraphs
    if (htmlEl.tagName === 'P') {
      htmlEl.style.marginBottom = '8px';
      htmlEl.style.lineHeight = '1.5';
    }
  });
};

// Specific export functions for different page types
export const exportICPToPDF = async (brandName: string = 'Brand') => {
  return exportToPDF({
    filename: `${brandName}-ideal-customer-profile.pdf`,
    elementId: 'icp-content',
    title: `${brandName} - Ideal Customer Profile`
  });
};

export const exportStrategyToPDF = async (brandName: string = 'Brand') => {
  return exportToPDF({
    filename: `${brandName}-marketing-strategy.pdf`,
    elementId: 'strategy-content',
    title: `${brandName} - Marketing Strategy`
  });
}; 