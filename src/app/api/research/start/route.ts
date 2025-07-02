import {
  conductResearch,
} from "@/lib/research/ai-agent";
import createLogger from "@/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";
import { ResearchStepUpdate } from "@/types/research";

const logger = createLogger("Research API");

export async function POST(request: NextRequest) {
  try {
    const { query, depth = "deep" } = await request.json();

    logger.debug(`Received request: query='${query}', depth='${depth}'`);

    if (!query) {
      return NextResponse.json(
        { error: "Research query is required" },
        { status: 400 }
      );
    }

    // Validate depth parameter
    if (depth !== "surface" && depth !== "deep") {
      return NextResponse.json(
        { error: 'Depth must be either "surface" or "deep"' },
        { status: 400 }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const onProgressUpdate = (update: ResearchStepUpdate) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}

`));
        };

        try {
          logger.debug("Starting AI research agent...");
          await conductResearch(query, depth, onProgressUpdate); // Pass the callback
          controller.enqueue(encoder.encode(`event: end
data: ${JSON.stringify({ message: "Research completed" })}

`));
        } catch (error: unknown) {
          console.error("Research API error during streaming:", error);
          logger.debug("Caught error during research streaming.", error);
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: error instanceof Error ? error.message : "An unknown error occurred during research." })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Research API error:", error);
    logger.debug("Caught top-level error in API route.", error);
    return NextResponse.json(
      { error: "Failed to conduct research" },
      { status: 500 }
    );
  }
}
