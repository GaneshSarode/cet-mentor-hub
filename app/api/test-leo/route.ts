import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  const keyPresent = !!apiKey;
  const keyLast4 = apiKey ? `...${apiKey.slice(-4)}` : "none";
  let geminiWorking = false;
  let responseText = "";
  let errorText = "";

  if (keyPresent) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;
      const geminiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Say hello as LEO in one sentence" }] }],
          generationConfig: { maxOutputTokens: 50 },
        }),
      });

      if (geminiResponse.ok) {
        const data = await geminiResponse.json();
        if (data.candidates && data.candidates[0]) {
          geminiWorking = true;
          responseText = data.candidates[0].content.parts[0].text;
        } else {
          errorText = "API responded ok, but no candidates returned: " + JSON.stringify(data);
        }
      } else {
        errorText = `HTTP ${geminiResponse.status}: ${await geminiResponse.text()}`;
      }
    } catch (err: any) {
      errorText = err.message || JSON.stringify(err);
    }
  } else {
    errorText = "No API key found in environment";
  }

  return NextResponse.json({
    keyPresent,
    keyLast4,
    geminiWorking,
    response: responseText,
    error: errorText,
  });
}
