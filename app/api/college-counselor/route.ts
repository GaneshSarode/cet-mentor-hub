import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { messages, userMessage } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured", debug: "missing_key" }, { status: 500 });
    }

    // Fetch college data — limited to 80 rows with compact format to stay under token limits
    const supabase = getAdminClient();
    let collegeData: any[] = [];
    try {
      const { data, error } = await supabase
        .from('cutoffs')
        .select('percentile, category, branch:branches!inner(name, college:colleges!inner(name))')
        .limit(80);
      if (!error && data) collegeData = data;
    } catch (supabaseError) {
      console.error('Supabase fetch failed:', supabaseError);
    }

    // Build compact college context
    let collegeContext = "";
    if (collegeData.length > 0) {
      const formattedData = collegeData
        .map((c: any) => `${c.branch?.college?.name},${c.branch?.name},${c.category},${c.percentile}`)
        .join("\n");
      collegeContext = `CAP Round cutoff data (College,Branch,Category,Percentile):\n${formattedData}`;
    } else {
      collegeContext = `I don't have live cutoff data right now, but I can give general guidance on Maharashtra engineering admissions.`;
    }

    const systemPrompt = `You are LEO, AI assistant for CET Mentor Hub. MHT-CET college counselor. Be friendly like a helpful senior student.
${collegeContext}
Rules: Cite cutoff percentiles. Be honest if out of reach. Ask for category if not mentioned. Keep replies under 100 words. Use bullet points. Say "I don't have that data" if unsure.`;

    // Build conversation history (OpenAI format), last 6 messages
    const recentMessages = (messages || []).slice(-6);
    const chatHistory = recentMessages.map((msg: any) => ({
      role: msg.role === "model" ? "assistant" : "user",
      content: msg.content,
    }));

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
          messages: [
            { role: "system", content: systemPrompt },
            ...chatHistory,
            { role: "user", content: userMessage },
          ],
          max_tokens: 200,
          temperature: 0.8,
        }),
      }
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API HTTP error:', groqResponse.status, errorText);
      return NextResponse.json(
        { error: `Groq API error: ${groqResponse.status}`, debug: errorText },
        { status: 500 }
      );
    }

    const data = await groqResponse.json();

    if (!data.choices || !data.choices[0]) {
      return NextResponse.json(
        { error: 'Groq returned empty response', debug: JSON.stringify(data) },
        { status: 500 }
      );
    }

    const reply = data.choices[0].message.content;
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('LEO API Error:', error);
    return NextResponse.json(
      { error: "Failed", debug: error?.message || String(error) },
      { status: 500 }
    );
  }
}
