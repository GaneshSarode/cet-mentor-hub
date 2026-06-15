import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  const keyPresent = !!apiKey;
  let availableModels: any[] = [];
  let errorText = "";

  if (keyPresent) {
    try {
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const response = await fetch(listUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        availableModels = data.models?.map((m: any) => m.name) || [];
      } else {
        errorText = `HTTP ${response.status}: ${await response.text()}`;
      }
    } catch (err: any) {
      errorText = err.message || JSON.stringify(err);
    }
  } else {
    errorText = "No API key found in environment";
  }

  return NextResponse.json({
    keyPresent,
    availableModels,
    error: errorText,
  });
}
