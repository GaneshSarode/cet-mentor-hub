import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { messages, userMessage } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const supabase = getAdminClient();
    const { data: cutoffsData, error: dbError } = await supabase
      .from("cutoffs")
      .select("percentile, category, branch:branches!inner(name, college:colleges!inner(name))")
      .limit(500);

    if (dbError) {
      console.error("Database error fetching cutoffs:", dbError);
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }

    const formattedData = cutoffsData
      ?.map(
        (c: any) =>
          `- ${c.branch?.college?.name} | ${c.branch?.name} | ${c.category} | ${c.percentile}%ile`
      )
      .join("\n");

    const systemPrompt = `Your name is LEO, the AI assistant for CET Mentor Hub. You are an
   MHT-CET college counselor for Maharashtra engineering admissions 2024.
   Be friendly and conversational — like a helpful senior student who
   cracked MHT-CET, not a formal advisor.
   Here is the actual CAP Round cutoff data:
   ${formattedData}
   
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API error: ${response.status} ${response.statusText}`, errText);
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      throw new Error("Failed to extract reply from Gemini response");
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error generating counselor reply:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
