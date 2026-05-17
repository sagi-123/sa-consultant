import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';

// Use local worker provided by Vite to avoid CDN/CORS issues
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export async function extractTextFromPDF(file: File): Promise<string> {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Only PDF files are supported for AI parsing right now.');
  }

  const arrayBuffer = await file.arrayBuffer();
  
  // Configure getDocument with CMaps for better font support
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
    useSystemFonts: true,
  });
  
  const pdfDocument = await loadingTask.promise;
  
  let fullText = '';
  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    try {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      fullText += pageText + '\n';
    } catch (pageError) {
      console.warn(`Error extracting text from page ${pageNum}:`, pageError);
    }
  }
  
  const finalString = fullText.trim();
  if (finalString.length === 0) {
    throw new Error('No text could be extracted from this PDF. It might be an image-based/scanned PDF.');
  }

  return finalString;
}
