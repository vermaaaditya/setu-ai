import Groq from 'groq-sdk';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Initialize Groq. We allow browser since this is a client-side prototype.
const groq = new Groq({ 
  apiKey: import.meta.env.VITE_GROQ_API_KEY || 'dummy_key',
  dangerouslyAllowBrowser: true 
});

export async function generateDispatch(
  surgeHeight: number, 
  strandedPop: number, 
  lang: 'en-US' | 'hi-IN'
): Promise<string> {
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    console.warn("No Groq API key found. Using fallback text.");
    return lang === 'en-US' 
      ? `Alert. Flood surge level is ${surgeHeight} meters. Estimated ${strandedPop} individuals stranded. Deploy NDRF units now.`
      : `चेतावनी। जल स्तर ${surgeHeight} मीटर है। ${strandedPop} लोग फंसे हैं। बचाव दल तुरंत भेजें।`;
  }

  const prompt = `Write a short 2-sentence military dispatch alert for flood surge ${surgeHeight} meters with ${strandedPop} stranded people.
  Language: ${lang === 'hi-IN' ? 'Pure Hindi' : 'English'}.
  CRITICAL RULES:
  1. DO NOT use markdown formatting like asterisks (**), hashtags, or quotes.
  2. Maximum 2 short, crisp spoken sentences.
  3. No yapping, greetings, or explanations. Plain text only.`;

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'qwen/qwen3.6-27b',
    });
    const raw = response.choices[0]?.message?.content || 'Dispatch generated.';
    // Strip any markdown asterisks or special symbols so TTS does not read them out
    return raw.replace(/[*#_~`"']/g, '').trim();
  } catch (error) {
    console.error("Groq API Error:", error);
    return 'Error generating dispatch with Groq.';
  }
}

export function speakText(text: string, lang: 'en-US' | 'hi-IN') {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // clear queue
    const cleanText = text.replace(/[*#_~`"']/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 1.1; // Slightly faster for urgency
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Web Speech API not supported.");
  }
}

export async function generateManifestPDF(surgeHeight: number, strandedPop: number) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage([600, 400]);

  page.drawText('TACTICAL EVACUATION MANIFEST', { x: 50, y: 350, size: 20, font, color: rgb(0.95, 0.25, 0.36) });
  page.drawText(`Date: ${new Date().toLocaleString()}`, { x: 50, y: 320, size: 12, font });
  page.drawText('----------------------------------------------------', { x: 50, y: 300, size: 12, font });
  
  page.drawText(`Threat Level: BRAHMAPUTRA BREACH`, { x: 50, y: 270, size: 14, font });
  page.drawText(`Current Surge Simulation: ${surgeHeight} Meters`, { x: 50, y: 240, size: 14, font });
  page.drawText(`Estimated Stranded Population: ${strandedPop} individuals`, { x: 50, y: 210, size: 14, font });
  
  page.drawText('----------------------------------------------------', { x: 50, y: 180, size: 12, font });
  page.drawText('ACTION REQUIRED: Deploy NDRF teams to high-ground camps immediately.', { x: 50, y: 150, size: 12, font });

  const pdfBytes = await pdfDoc.save();
  
  // Trigger download
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Evac_Manifest_Surge_${surgeHeight}m.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
