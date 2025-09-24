import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { InfographicData } from '../types';

/**
 * Debug function to test PDF generation with a simple HTML test
 */
export const testPDFGeneration = async (): Promise<void> => {
  console.log('Testing PDF generation with simple HTML...');
  
  // Create a test infographic
  const testInfographic: InfographicData = {
    id: 'test-123',
    contentType: 'infographic',
    htmlCode: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: white;
            margin: 0;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        .content {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #dee2e6;
        }
        .box {
            background: #007bff;
            color: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Test PDF Generation</h1>
        <p>This is a test infographic to verify PDF generation works</p>
    </div>
    <div class="content">
        <h2>Sample Content</h2>
        <div class="box">Box 1: This should appear in the PDF</div>
        <div class="box">Box 2: Colors and styles should be preserved</div>
        <div class="box">Box 3: Layout should be maintained</div>
        <p>If you can see this content with proper styling in the generated PDF, then the PDF generation is working correctly!</p>
    </div>
</body>
</html>
    `,
    rawCode: '',
    partIndex: 0
  };

  try {
    // Method 1: Direct div approach (most reliable)
    console.log('Testing Method 1: Direct div rendering...');
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-5000px';
    container.style.left = '0';
    container.style.width = '800px';
    container.style.background = 'white';
    container.style.padding = '0';
    container.style.margin = '0';
    document.body.appendChild(container);

    // Extract body content
    const bodyMatch = testInfographic.htmlCode.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : testInfographic.htmlCode;

    // Extract and apply styles
    const styleMatch = testInfographic.htmlCode.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    if (styleMatch) {
      const styleElement = document.createElement('style');
      styleElement.textContent = styleMatch[1];
      document.head.appendChild(styleElement);
    }

    container.innerHTML = bodyContent;
    
    // Wait for content to render
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Container dimensions:', {
      width: container.offsetWidth,
      height: container.offsetHeight,
      scrollHeight: container.scrollHeight,
      hasContent: container.innerHTML.length > 0
    });

    // Capture with html2canvas
    const canvas = await html2canvas(container, {
      width: 800,
      height: Math.max(container.scrollHeight, 600),
      logging: true, // Enable logging to see what's happening
      allowTaint: true,
      useCORS: true,
    });

    console.log('Canvas dimensions:', {
      width: canvas.width,
      height: canvas.height,
      dataURL: canvas.toDataURL('image/png').substring(0, 50) + '...'
    });

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Simple scaling
    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pdfHeight - 20) {
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, imgWidth, imgHeight);
    } else {
      const scaledHeight = pdfHeight - 20;
      const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 
                   (pdfWidth - scaledWidth) / 2, 10, scaledWidth, scaledHeight);
    }

    // Add debug info
    pdf.setFontSize(8);
    pdf.text(`Debug: Canvas ${canvas.width}x${canvas.height}, Generated at ${new Date().toLocaleTimeString()}`, 10, pdfHeight - 10);

    // Save
    pdf.save('agentswot-test-pdf.pdf');
    
    // Cleanup
    document.body.removeChild(container);
    console.log('✅ Test PDF generated successfully!');
    
  } catch (error) {
    console.error('❌ Test PDF generation failed:', error);
    throw error;
  }
};

/**
 * Debug function to inspect the infographic HTML structure
 */
export const debugInfographicHTML = (infographic: InfographicData): void => {
  console.log('🔍 Debugging infographic HTML structure:');
  console.log('ID:', infographic.id);
  console.log('Content Type:', infographic.contentType);
  console.log('HTML Length:', infographic.htmlCode.length);
  
  // Check for common HTML structure
  const hasDoctype = infographic.htmlCode.includes('<!DOCTYPE');
  const hasHtml = infographic.htmlCode.includes('<html');
  const hasHead = infographic.htmlCode.includes('<head');
  const hasBody = infographic.htmlCode.includes('<body');
  const hasStyle = infographic.htmlCode.includes('<style');
  
  console.log('HTML Structure:', {
    hasDoctype,
    hasHtml,
    hasHead,
    hasBody,
    hasStyle
  });
  
  // Extract and log styles
  const styleMatches = infographic.htmlCode.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  if (styleMatches) {
    console.log('Found styles:', styleMatches.length);
    styleMatches.forEach((style, index) => {
      console.log(`Style ${index + 1}:`, style.substring(0, 200) + '...');
    });
  }
  
  // Extract and log body content
  const bodyMatch = infographic.htmlCode.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    console.log('Body content preview:', bodyMatch[1].substring(0, 200) + '...');
  }
  
  console.log('Full HTML (first 500 chars):', infographic.htmlCode.substring(0, 500) + '...');
};