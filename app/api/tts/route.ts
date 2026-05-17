import { NextRequest } from "next/server"

const OPENAI_TTS_URL = "https://api.openai.com/v1/audio/speech"

export async function POST(req: NextRequest) {
  try {
    const { text, voice } = await req.json()

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return Response.json({ error: "text is required" }, { status: 400 })
    }

    const openaiKey = process.env.OPENAI_API_KEY

    if (!openaiKey) {
      return Response.json(
        {
          error: "OpenAI API key not configured",
          fallbackToBrowser: true,
          message: "OPENAI_API_KEY is not set. The browser will use built-in speech synthesis.",
        },
        { status: 501 }
      )
    }

    const response = await fetch(OPENAI_TTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice ?? "alloy",
        response_format: "mp3",
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("OpenAI TTS error:", response.status, errorBody)
      return Response.json(
        { error: "TTS generation failed", fallbackToBrowser: true },
        { status: 500 }
      )
    }

    const audioArrayBuffer = await response.arrayBuffer()

    return new Response(audioArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioArrayBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (error) {
    console.error("TTS route error:", error)
    return Response.json(
      { error: "Internal server error", fallbackToBrowser: true },
      { status: 500 }
    )
  }
}
