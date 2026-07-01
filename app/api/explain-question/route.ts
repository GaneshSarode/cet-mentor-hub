import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log('GROQ_API_KEY present:', !!process.env.GROQ_API_KEY);
  try {
    const { question, options, correctAnswer, studentAnswer, subject } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `Your name is LEO, the AI assistant for CET Mentor Hub. You are an expert 
MHT-CET ${subject} tutor helping a 12th-grade student. Be friendly and 
clear — like a helpful senior student, not a formal teacher.

   Question: ${question}
   Options: ${options.join('\n')}
   Correct Answer: ${correctAnswer}
   Student's Answer: ${studentAnswer}
   
   Explain in exactly 3 parts:
   1. WHY CORRECT: Why ${correctAnswer} is right — explain the concept or formula used.
   2. WHY OTHERS WRONG: One line for each wrong option explaining why it's incorrect.
   3. EXAM TIP: One sentence tip to remember this for the MHT-CET exam.
   
   Keep total response under 180 words. Simple language for a 12th-grade student.`;

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
          messages: [{ role: "user", content: prompt }],
          max_tokens: 400,
          temperature: 0.7,
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

    const explanation = data.choices[0].message.content;

    if (!explanation) {
      throw new Error("Failed to extract explanation from Groq response");
    }

    return NextResponse.json({ explanation });
  } catch (error: any) {
    console.error('LEO API Error:', error);
    return NextResponse.json(
      { error: "Failed", debug: error?.message || String(error) }, 
      { status: 500 }
    );
  }
}
