import {
  conductResearch,
  generateResearchReport,
} from "@/lib/research/ai-agent";
import createLogger from "@/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";

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

    logger.debug("Starting AI research agent...");
    // Start AI agent research process
    const result = await conductResearch(query, depth);

    if (!result.success) {
      logger.debug(`Research failed: ${result.error}`);
      return NextResponse.json(
        { error: result.error || "Research failed" },
        { status: 500 }
      );
    }

    // Generate structured report if research was successful
    let structuredReport = null;
    try {
      logger.debug("Attempting to generate structured report...");
      // Assert result is of type { success: true, ... } here
      const successfulResult = result as {
        success: true;
        content: string;
        toolCalls: {
          toolCallId: string;
          toolName: string;
          args: Record<string, unknown>;
        }[];
        usage: {
          promptTokens: number;
          completionTokens: number;
          totalTokens: number;
        };
      };
      structuredReport = await generateResearchReport({
        query,
        content: successfulResult.content,
        toolCalls: successfulResult.toolCalls,
        depth,
      });
    } catch (reportError) {
      console.warn("Failed to generate structured report:", reportError);
      logger.debug("Structured report generation failed.", reportError);
      // Continue without structured report
    }

    logger.debug("Research and report generation complete. Sending response.");

    return NextResponse.json({
      success: true,
      query,
      depth,
      content: result.content,
      toolCalls: result.toolCalls?.map((call) => ({
        id: call.toolCallId,
        name: call.toolName,
        args: call.args,
      })),
      usage: result.usage,
      structuredReport,
      timestamp: new Date().toISOString(),
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
