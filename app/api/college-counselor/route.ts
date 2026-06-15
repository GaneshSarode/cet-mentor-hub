import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  console.log('GROQ_API_KEY present:', !!process.env.GROQ_API_KEY);
  try {
    const { messages, userMessage } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('No GROQ_API_KEY found');
      return NextResponse.json({ error: "API key not configured", debug: "missing_key" }, { status: 500 });
    }

    // Step 1: Fetch college data (non-blocking — continues even if this fails)
    const supabase = getAdminClient();
    let collegeData: any[] = [];
    try {
      const { data, error } = await supabase
        .from('cutoffs')
        .select('percentile, category, branch:branches!inner(name, college:colleges!inner(name))')
        .limit(200);
      if (!error && data) collegeData = data;
      console.log('Supabase data fetched:', collegeData.length, 'rows');
    } catch (supabaseError) {
      console.error('Supabase fetch failed:', supabaseError);
    }

    // Step 2: Build system prompt
    let collegeContext = "";
    if (collegeData.length > 0) {
      const formattedData = collegeData
        .map(
          (c: any) =>
            `${c.branch?.college?.name} | ${c.branch?.name} | ${c.category} | ${c.percentile}%ile`
        )
        .join("\n");
      collegeContext = `Here is the actual CAP Round cutoff data:\n${formattedData}`;
    } else {
      collegeContext = `I don't have live cutoff data right now, but I can still give general guidance based on my knowledge of Maharashtra engineering admissions.`;
    }

    const systemPrompt = `Your name is LEO, the AI assistant for CET Mentor Hub. You are an MHT-CET college counselor for Maharashtra engineering admissions 2024. Be friendly and conversational — like a helpful senior student who cracked MHT-CET, not a formal advisor.
${collegeContext}

Rules:
- Always cite actual cutoff percentiles from the data when recommending colleges
- Be honest — if a college seems out of reach, say so
- Ask for category (OPEN/OBC/SC/ST/EWS) if student does not mention it
- Keep replies under 120 words, use bullet points for college lists
- If you don't have data for something, say 'I don't have that data'`;

    // Step 3: Build conversation history (OpenAI format)
    const recentMessages = (messages || []).slice(-8);
    const chatHistory = recentMessages.map((msg: any) => ({
      role: msg.role === "model" ? "assistant" : "user",
      content: msg.content,
    }));

    // Step 4: Call Groq API
    console.log('Calling Groq API with', chatHistory.length, 'history messages');
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
          max_tokens: 300,
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
      console.error('Groq returned no choices:', JSON.stringify(data));
      return NextResponse.json(
        { error: 'Groq returned empty response', debug: JSON.stringify(data) },
        { status: 500 }
      );
    }

    const reply = data.choices[0].message.content;
    console.log('LEO reply generated successfully, length:', reply?.length);

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('LEO API Error:', error);
    return NextResponse.json(
      { error: "Failed", debug: error?.message || String(error) },
      { status: 500 }
    );
  }
}
