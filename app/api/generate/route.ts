import { generateTitle } from "@/lib/agents/title-agent";
import { generateCast } from "@/lib/agents/casting-agent";
import { generateScreenplay } from "@/lib/agents/screenplay-agent";

export async function POST(req: Request) {
  try {
    let body: { situation?: string };

    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const { situation } = body;

    if (
      !situation ||
      typeof situation !== "string" ||
      situation.trim().length < 3
    ) {
      return Response.json(
        { error: "Please enter a situation with at least 3 characters." },
        { status: 400 }
      );
    }

    const trimmedSituation = situation.trim();

    const titleData = await generateTitle(trimmedSituation);
    const castData = await generateCast(trimmedSituation, titleData);
    const script = await generateScreenplay(
      trimmedSituation,
      titleData,
      castData
    );

    return Response.json(script);
  } catch (error) {
    console.error("Script generation failed:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Generation failed. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
