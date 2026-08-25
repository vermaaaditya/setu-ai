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

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an automated NDRF emergency radio dispatcher. Output ONLY the exact final broadcast text to be spoken over the radio. Maximum 2 short sentences. Absolutely NO preambles, NO markdown, NO asterisks, NO quotes, NO rules, and NO explanations.'
        },
        {
          role: 'user',
          content: `Broadcast language: ${lang === 'hi-IN' ? 'Hindi' : 'English'}. Current flood surge: ${surgeHeight} meters. Estimated stranded population: ${strandedPop}.`
        }
      ],
      model: 'qwen/qwen3.6-27b',
    });
    let raw = response.choices[0]?.message?.content || 'Dispatch generated.';
    // Clean all markdown, quotes, and common LLM preamble prefixes
    raw = raw.replace(/[*#_~`"']/g, '');
    raw = raw.replace(/^(here is|dispatch|alert|broadcast|warning|note|critical rules):?/gi, '');
    return raw.trim();
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

export async function chatWithGroq(
  messages: { role: 'user' | 'assistant', content: string }[],
  liveContext: { activeBasinName: string, surgeHeight: number, weatherText: string }
): Promise<string> {
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    return "API key not configured. Fallback: Please move to higher ground and wait for official updates.";
  }

  const systemPrompt = `You are a helpful, concise citizen safety assistant for a flood disaster response app. 
Answer only questions about current weather conditions, flood risk, and basic safety guidance (what to do if stranded, when to evacuate, what NDRF/authorities recommend). 
If asked anything unrelated, politely redirect to weather or flood safety topics.
Keep your answers brief, friendly, and practical (max 2-3 short sentences).

Live Context:
- Sector: ${liveContext.activeBasinName}
- Current Flood Surge Level: +${liveContext.surgeHeight} meters
- Local Weather: ${liveContext.weatherText || 'Data temporarily unavailable'}
`;

  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      model: 'llama-3.1-8b-instant', // Fast conversational model
      max_tokens: 150,
      temperature: 0.5
    });
    
    return response.choices[0]?.message?.content?.trim() || "I'm having trouble retrieving information right now. Please prioritize your safety and move to high ground.";
  } catch (error) {
    console.error("Groq Chat API Error:", error);
    return "I'm currently unable to connect to the safety network. Please follow standard evacuation protocols and move to higher ground.";
  }
}
