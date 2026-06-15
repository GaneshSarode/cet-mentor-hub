import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
  try {
    const { question, options, correctAnswer, studentAnswer, subject } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
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

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const geminiResponse = await fetch(
      geminiUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
        }),
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

    const explanation = data.candidates[0].content.parts[0].text;

    if (!explanation) {
      throw new Error("Failed to extract explanation from Gemini response");
    }

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('LEO API Error:', error);
    console.error('LEO API Error details:', JSON.stringify(error));
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
