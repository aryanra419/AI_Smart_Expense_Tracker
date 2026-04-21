import { createWorker } from 'tesseract.js';

/**
 * Scans an image and extracts financial data.
 * @param {File} imageFile 
 * @returns {Promise<{ merchant: string, amount: number, date: string }>}
 */
export async function parseReceipt(imageFile) {
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(imageFile);
    await worker.terminate();

    console.log("OCR raw text:", text);

    return {
        description: extractMerchant(text),
        amount: extractTotal(text),
        date: extractDate(text)
    };
}

function extractMerchant(text) {
    // Usually the first few non-empty lines are the merchant
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    // Exclude common header lines
    const noise = ['WELCOME', 'RECEIPT', 'TRANSACTION', 'MERCHANT', 'STORE', 'SALE', 'INVOICE'];
    for (let line of lines) {
       if (!noise.some(n => line.toUpperCase().includes(n))) {
           return line.charAt(0).toUpperCase() + line.slice(1).toLowerCase();
       }
    }
    return 'Scanned Receipt';
}

function extractTotal(text) {
    // Look for patterns like "Total", "TOTAL", "Sum", followed by a number
    // Or just a large number near the bottom
    const amountRegex = /(?:total|sum|amount|paid|due)[\s:]*[\$]?\s*(\d+[\.,]\d{2})/gi;
    let match;
    let fallbackAmount = 0;
    
    // Find all currency-like numbers
    const allNumbers = text.match(/[\$]?\s*\d+[\.,]\d{2}/g) || [];
    const parsedNumbers = allNumbers.map(n => parseFloat(n.replace(/[^\d\.]/g, '')));
    
    // 1. Try regex with keywords
    while ((match = amountRegex.exec(text)) !== null) {
        if (match[1]) return parseFloat(match[1].replace(',', '.'));
    }

    // 2. Fallback: Largest number on the receipt is often the total
    if (parsedNumbers.length > 0) {
        return Math.max(...parsedNumbers);
    }

    return 0;
}

function extractDate(text) {
    // Regex for standard date formats: MM/DD/YYYY, DD-MM-YYYY, YYYY-MM-DD
    const dateRegex = /(\d{1,4}[\/\.-]\d{1,2}[\/\.-]\d{1,4})/g;
    const match = text.match(dateRegex);
    return match ? match[0] : new Date().toLocaleDateString();
}
