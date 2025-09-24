import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { InfographicData } from '../types';

/**
 * Generates and downloads a PDF from an infographic's HTML content
 * @param infographic - The infographic data to convert to PDF
 * @param onProgress - Optional callback to track progress
 * @returns Promise that resolves when PDF is generated and downloaded
 */
export const generateInfographicPDF = async (
  infographic: InfographicData,
  onProgress?: (step: string) => void
): Promise<void> => {
  try {
    onProgress?.('Creating temporary element...');

    // Create a temporary div container instead of iframe
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '1200px';
    tempContainer.style.minHeight = '800px';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.zIndex = '-1000';
    tempContainer.style.padding = '20px';
    tempContainer.style.boxSizing = 'border-box';
    document.body.appendChild(tempContainer);

    onProgress?.('Loading content...');

    // Extract just the body content from the HTML
    const htmlContent = infographic.htmlCode;
    let bodyContent = htmlContent;
    
    // If it's a complete HTML document, extract just the body content
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      bodyContent = bodyMatch[1];
    }

    // Extract styles from head section
    let styles = '';
    const styleMatches = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (styleMatches) {
      styles = styleMatches.map(match => {
        const styleContent = match.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        return styleContent ? styleContent[1] : '';
      }).join('\n');
    }

    // Create a style element for the extracted styles
    let tempStyleElement: HTMLStyleElement | null = null;
    if (styles) {
      tempStyleElement = document.createElement('style');
      tempStyleElement.textContent = styles;
      tempStyleElement.setAttribute('data-temp-pdf', 'true');
      document.head.appendChild(tempStyleElement);
    }

    // Set the content directly
    tempContainer.innerHTML = bodyContent;

    // Wait for content to render and any dynamic styles to apply
    await new Promise(resolve => setTimeout(resolve, 2000));

    onProgress?.('Capturing high-resolution image...');

    // Capture the content directly
    const canvas = await html2canvas(tempContainer, {
      width: 1200,
      height: Math.max(tempContainer.scrollHeight, 800),
      logging: true,
      allowTaint: true,
      useCORS: true,
    });

    onProgress?.('Creating PDF document...');

    // Create PDF with appropriate orientation
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions to fit A4 with padding
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const padding = 10; // 10mm padding on all sides
    const availableWidth = pdfWidth - (2 * padding);
    const availableHeight = pdfHeight - (2 * padding);
    
    const canvasAspectRatio = canvas.width / canvas.height;
    const availableAspectRatio = availableWidth / availableHeight;

    let finalWidth, finalHeight;
    if (canvasAspectRatio > availableAspectRatio) {
      // Canvas is wider, fit to available width
      finalWidth = availableWidth;
      finalHeight = availableWidth / canvasAspectRatio;
    } else {
      // Canvas is taller, fit to available height
      finalHeight = availableHeight;
      finalWidth = availableHeight * canvasAspectRatio;
    }

    // Center the image
    const x = (pdfWidth - finalWidth) / 2;
    const y = (pdfHeight - finalHeight) / 2;

    // Add image to PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95); // Use JPEG with high quality
    pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);

    // Add metadata footer
    const currentDate = new Date().toLocaleDateString();
    const timestamp = new Date().toLocaleTimeString();
    const footerText = `AgentSwot Infographic • Generated ${currentDate} at ${timestamp}`;
    
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(footerText, padding, pdfHeight - 5);

    // Add a watermark/branding (optional)
    pdf.setFontSize(6);
    pdf.setTextColor(200, 200, 200);
    pdf.text('Powered by AgentSwot AI', pdfWidth - 40, pdfHeight - 5);

    onProgress?.('Saving PDF...');

    // Generate filename with timestamp
    const timestamp_filename = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `agentswot-infographic-${timestamp_filename}-${infographic.id.slice(-6)}.pdf`;

    // Save the PDF
    pdf.save(filename);

    onProgress?.('Complete!');

    // Clean up
    document.body.removeChild(tempContainer);
    
    // Remove the temporary style element if we added one
    const tempStyles = document.querySelectorAll('style[data-temp-pdf]');
    tempStyles.forEach(style => style.remove());

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

/**
 * Opens an infographic in a new tab for better viewing/printing
 * @param infographic - The infographic data to display
 */
export const openInfographicInNewTab = (infographic: InfographicData): void => {
  // Enhanced HTML template for better printing
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgentSwot Infographic - ${infographic.id}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: white;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        .header h1 {
            margin: 0;
            color: #333;
            font-size: 24px;
        }
        .header .meta {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
        }
        .content {
            max-width: 1200px;
            margin: 0 auto;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #888;
            font-size: 12px;
        }
        @media print {
            body { padding: 10px; }
            .header, .footer { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 AgentSwot Infographic</h1>
        <div class="meta">Generated on ${new Date().toLocaleString()}</div>
    </div>
    <div class="content">
        ${infographic.htmlCode}
    </div>
    <div class="footer">
        <p>Powered by AgentSwot AI • ID: ${infographic.id}</p>
        <p>Use Ctrl+P (Cmd+P on Mac) to print this infographic</p>
    </div>
</body>
</html>`;

  const blob = new Blob([htmlTemplate], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const newWindow = window.open(url, '_blank');
  
  // Clean up the URL after the window loads
  if (newWindow) {
    newWindow.onload = () => {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  } else {
    // Fallback if popup blocked
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};