import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
  try {
    const { messages, userMessage } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const supabase = getAdminClient();
    
    let collegeData: any[] = [];
    try {
      const { data, error } = await supabase
        .from('cutoffs')
        .select('percentile, category, branch:branches!inner(name, college:colleges!inner(name))')
        .limit(500);
      if (!error && data) collegeData = data;
    } catch (supabaseError) {
      console.error('Supabase fetch failed, continuing without college data:', supabaseError);
      // Do NOT throw — continue to Gemini even without college data
    }

    let collegeContext = "";
    if (collegeData.length > 0) {
      const formattedData = collegeData
        .map(
          (c: any) =>
            `- ${c.branch?.college?.name} | ${c.branch?.name} | ${c.category} | ${c.percentile}%ile`
        )
        .join("\n");
      collegeContext = `Here is the actual CAP Round cutoff data:\n${formattedData}`;
    } else {
      collegeContext = `I don't have live cutoff data right now, but I can still give general 
     guidance based on my knowledge of Maharashtra engineering admissions.`;
    }

    const systemPrompt = `Your name is LEO, the AI assistant for CET Mentor Hub. You are an
   MHT-CET college counselor for Maharashtra engineering admissions 2024.
   Be friendly and conversational — like a helpful senior student who
   cracked MHT-CET, not a formal advisor.
   ${collegeContext}
   
   Rules:
   - Always cite actual cutoff percentiles from the data when recommending colleges
   - Be honest — if a college seems out of reach, say so
   - Ask for category (OPEN/OBC/SC/ST/EWS) if student does not mention it
   - Keep replies under 120 words, use bullet points for college lists
   - If you don't have data for something, say 'I don't have that data'`;

    // Only keep last 8 messages
    const recentMessages = messages.slice(-8);

    const payload = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [
        ...recentMessages.map((msg: any) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })),
        { role: "user", parts: [{ text: userMessage }] },
      ],
      generationConfig: { maxOutputTokens: 300, temperature: 0.8 },
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const geminiResponse = await fetch(
      geminiUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API HTTP error:', geminiResponse.status, errorText);
      return NextResponse.json(
        { error: `Gemini API error: ${geminiResponse.status}` }, 
        { status: 500 }
      );
    }

    const data = await geminiResponse.json();
    
    if (!data.candidates || !data.candidates[0]) {
      console.error('Gemini returned no candidates:', JSON.stringify(data));
      return NextResponse.json(
        { error: 'Gemini returned empty response' }, 
        { status: 500 }
      );
    }

    const reply = data.candidates[0].content.parts[0].text;

    if (!reply) {
      throw new Error("Failed to extract reply from Gemini response");
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('LEO API Error:', error);
    console.error('LEO API Error details:', JSON.stringify(error));
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
