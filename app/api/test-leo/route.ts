import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;
  const keyPresent = !!apiKey;
  const keyLast4 = apiKey ? `...${apiKey.slice(-4)}` : "none";
  let groqWorking = false;
  let responseText = "";
  let errorText = "";

  if (keyPresent) {
    try {
      const groqResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: "Say hello as LEO in one sentence" }],
            max_tokens: 50,
          }),
        }
      );

      if (groqResponse.ok) {
        const data = await groqResponse.json();
        if (data.choices && data.choices[0]) {
          groqWorking = true;
          responseText = data.choices[0].message.content;
        } else {
          errorText = "API responded ok, but no choices returned: " + JSON.stringify(data);
        }
      } else {
        errorText = `HTTP ${groqResponse.status}: ${await groqResponse.text()}`;
      }
    } catch (err: any) {
      errorText = err.message || JSON.stringify(err);
    }
  } else {
    errorText = "No GROQ_API_KEY found in environment";
  }

  return NextResponse.json({
    keyPresent,
    keyLast4,
    groqWorking,
    response: responseText,
    error: errorText,
  });
}
