import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!explanation) {
      throw new Error("Failed to extract explanation from Gemini response");
    }

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Error generating explanation:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
