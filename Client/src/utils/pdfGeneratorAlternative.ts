import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { InfographicData } from '../types';

/**
 * Alternative PDF generation using popup window approach
 * This method is more reliable for complex HTML content
 */
export const generateInfographicPDFAlternative = async (
  infographic: InfographicData,
  onProgress?: (step: string) => void
): Promise<void> => {
  try {
    onProgress?.('Opening content in new window...');

    // Create a new window with the content
    const newWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!newWindow) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }

    // Write the complete HTML to the new window
    newWindow.document.write(infographic.htmlCode);
    newWindow.document.close();

    // Wait for content to load
    await new Promise<void>((resolve) => {
      newWindow.onload = () => resolve();
      // Fallback timeout
      setTimeout(resolve, 3000);
    });

    onProgress?.('Waiting for content to render...');

    // Additional wait for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));

    onProgress?.('Capturing screenshot...');

    // Capture the document body
    const canvas = await html2canvas(newWindow.document.body, {
      logging: false,
      allowTaint: true,
      useCORS: true,
      width: 1200,
      height: newWindow.document.body.scrollHeight,
    });

    // Close the popup window
    newWindow.close();

    onProgress?.('Creating PDF...');

    // Create PDF
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const padding = 10;
    const availableWidth = pdfWidth - (2 * padding);
    const availableHeight = pdfHeight - (2 * padding);
    
    const canvasAspectRatio = canvas.width / canvas.height;
    const availableAspectRatio = availableWidth / availableHeight;

    let finalWidth, finalHeight;
    if (canvasAspectRatio > availableAspectRatio) {
      finalWidth = availableWidth;
      finalHeight = availableWidth / canvasAspectRatio;
    } else {
      finalHeight = availableHeight;
      finalWidth = availableHeight * canvasAspectRatio;
    }

    const x = (pdfWidth - finalWidth) / 2;
    const y = (pdfHeight - finalHeight) / 2;

    // Add image to PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);

    // Add metadata
    const currentDate = new Date().toLocaleDateString();
    const timestamp = new Date().toLocaleTimeString();
    const footerText = `AgentSwot Infographic • ${currentDate} at ${timestamp}`;
    
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(footerText, padding, pdfHeight - 5);

    // Save
    const timestamp_filename = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `agentswot-infographic-${timestamp_filename}-${infographic.id.slice(-6)}.pdf`;
    pdf.save(filename);

    onProgress?.('Complete!');

  } catch (error) {
    console.error('Error in alternative PDF generation:', error);
    throw error;
  }
};

/**
 * Simple blob-based PDF generation for basic HTML
 * Most reliable method for simple content
 */
export const generateSimplePDF = async (
  infographic: InfographicData,
  onProgress?: (step: string) => void
): Promise<void> => {
  try {
    onProgress?.('Preparing PDF generation...');

    // Create a simple container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-10000px';
    container.style.left = '0';
    container.style.width = '1200px';
    container.style.minHeight = '600px';
    container.style.background = 'white';
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '14px';
    container.style.lineHeight = '1.5';
    document.body.appendChild(container);

    onProgress?.('Extracting and applying styles...');

    // Extract and apply styles first
    const styleMatches = infographic.htmlCode.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    let tempStyleElement: HTMLStyleElement | null = null;
    
    if (styleMatches) {
      const allStyles = styleMatches.map(match => {
        const styleContent = match.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        return styleContent ? styleContent[1] : '';
      }).join('\n');
      
      tempStyleElement = document.createElement('style');
      tempStyleElement.textContent = allStyles;
      tempStyleElement.setAttribute('data-pdf-temp', 'true');
      document.head.appendChild(tempStyleElement);
    }

    // Extract body content or use full HTML
    let content = infographic.htmlCode;
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      content = bodyMatch[1];
    }

    onProgress?.('Rendering content...');
    
    container.innerHTML = content;
    
    // Wait for rendering and any dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));

    onProgress?.('Capturing high-quality image...');

    // Use html2canvas on the container
    const canvas = await html2canvas(container, {
      logging: false,
      width: 1200,
      height: Math.max(container.scrollHeight, 600),
      allowTaint: true,
      useCORS: true,
    });

    onProgress?.('Creating PDF document...');

    // Clean up DOM
    document.body.removeChild(container);
    if (tempStyleElement) {
      document.head.removeChild(tempStyleElement);
    }

    // Create PDF with better quality settings
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // Calculate optimal scaling
    const availableWidth = pdfWidth - (2 * margin);
    const availableHeight = pdfHeight - (2 * margin) - 10; // Extra space for footer
    
    const canvasAspectRatio = canvas.width / canvas.height;
    const availableAspectRatio = availableWidth / availableHeight;

    let finalWidth, finalHeight;
    if (canvasAspectRatio > availableAspectRatio) {
      // Canvas is wider - fit to width
      finalWidth = availableWidth;
      finalHeight = availableWidth / canvasAspectRatio;
    } else {
      // Canvas is taller - fit to height
      finalHeight = availableHeight;
      finalWidth = availableHeight * canvasAspectRatio;
    }

    // Center the content
    const x = (pdfWidth - finalWidth) / 2;
    const y = (pdfHeight - finalHeight) / 2 - 5; // Slightly higher to make room for footer

    // Add image with high quality
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', x, y, finalWidth, finalHeight);

    // Add professional footer
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`AgentSwot Infographic • Generated ${currentDate} at ${currentTime}`, margin, pdfHeight - 5);
    pdf.text(`ID: ${infographic.id}`, pdfWidth - margin - 30, pdfHeight - 5);

    onProgress?.('Saving PDF...');

    // Generate descriptive filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const shortId = infographic.id.slice(-6);
    const filename = `agentswot-infographic-${timestamp}-${shortId}.pdf`;
    
    pdf.save(filename);
    onProgress?.('PDF saved successfully!');

  } catch (error) {
    console.error('Error in simple PDF generation:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};