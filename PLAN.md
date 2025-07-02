# Deep Research Progress UI Implementation Plan

## 1. Objective

Implement a new user interface section to visualize the deep research process, featuring a step-by-step progress tracker on the left (acting as navigation tabs) and a scrollable detailed log of AI actions on the right. Clicking a step on the left will scroll the right panel to the corresponding section.

## 2. Current State Analysis

*   **`src/app/page.tsx`**: Main application page, likely orchestrates the research flow.
*   **`src/components/research/ResearchInterface.tsx`**: Contains the primary UI for interacting with the research process.
*   **`src/lib/stores/research-store.ts`**: Manages the state of the research process (e.g., `currentResearch`, `isResearching`, `currentStep`). This will be crucial for updating the UI.
*   **`src/lib/research/ai-agent.ts`**: Contains the core AI logic for `conductResearch` and `generateResearchReport`. This is where the AI's "thinking" and "actions" originate.
*   **`src/app/api/research/start/route.ts`**: API endpoint that initiates the research process and interacts with `ai-agent.ts`.

## 3. Proposed Changes & Implementation Steps

### 3.1. Data Model Enhancement (Backend/Shared Types)

To capture the AI's progress and detailed actions, we need to enhance our data models.

*   **Modify `src/types/research.ts`**:
    *   Introduce a new interface `ResearchLogEntry` to represent individual actions/logs within a step.
    *   Modify `ResearchStep` to include a `logs: ResearchLogEntry[]` array.
    *   Potentially add a `currentPhase: string` or `currentSubStep: string` to `ResearchStep` to allow the AI to indicate its current high-level activity (e.g., "Thinking", "Clarifying Request", "Gathering Sources").

    ```typescript
    // src/types/research.ts (additions/modifications)

    export interface ResearchLogEntry {
      timestamp: string; // ISO string
      message: string;
      type: 'info' | 'debug' | 'tool_call' | 'result' | 'error';
      details?: Record<string, any>; // e.g., tool name, args, output
    }

    export interface ResearchStep {
      id: string;
      type: 'search' | 'analysis' | 'synthesis' | 'verification' | 'planning' | 'reporting'; // Add 'planning', 'reporting'
      description: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      progress: number;
      startTime?: Date;
      endTime?: Date;
      error?: string;
      sources?: Source[];
      findings?: string[];
      // New:
      logs?: ResearchLogEntry[]; // Detailed logs for this step
      phase?: string; // e.g., "Thinking", "Clarifying Request", "Executing Search"
    }

    // Update ResearchResult to include a more detailed history of steps
    export interface ResearchResult {
      // ... existing fields ...
      steps: ResearchStep[]; // This already exists, but its content will be richer
      // New:
      currentPhase?: string; // High-level phase for UI display
    }
    ```

### 3.2. AI Agent (Backend) Modifications

The AI agent needs to generate these structured progress updates.

*   **Modify `src/lib/research/ai-agent.ts`**:
    *   **Progress Reporting Mechanism**: Introduce a callback or a stream-based approach to send real-time updates to the frontend. This could be passed into `conductResearch` as `onProgressUpdate: (update: ResearchStepUpdate) => void`.
    *   **Dynamic Step Generation**: The AI should dynamically define the `ResearchStep` objects.
        *   Initial steps: "Thinking", "Clarifying the request".
        *   Subsequent steps: Based on the research plan (e.g., "Executing Web Search", "Analyzing Sources", "Synthesizing Findings", "Generating Report").
    *   **Log Generation**: Within `conductResearch`, every significant action (tool call, analysis, synthesis, decision) should generate a `ResearchLogEntry` and append it to the current `ResearchStep`'s `logs` array.
    *   **Update `ResearchResult`**: Ensure the `ResearchResult` object, especially its `steps` array, is populated with these detailed `ResearchStep` objects.

    ```typescript
    // src/lib/research/ai-agent.ts (conceptual changes)

    // ... existing imports and functions ...

    // New type for progress updates
    interface ResearchStepUpdate {
      stepId: string;
      phase?: string;
      status?: 'pending' | 'running' | 'completed' | 'failed';
      progress?: number;
      logEntry?: ResearchLogEntry;
    }

    export async function conductResearch(
      query: string,
      depth: "surface" | "deep" = "deep",
      onProgress?: (update: ResearchStepUpdate) => void // New callback
    ) {
      // ...
      let currentStepId: string;

      // Initial "Thinking" phase
      currentStepId = "thinking-phase";
      onProgress?.({ stepId: currentStepId, phase: "Thinking", status: "running" });
      onProgress?.({ stepId: currentStepId, logEntry: { timestamp: new Date().toISOString(), message: "AI is formulating a research plan.", type: "info" } });

      // Clarifying Request phase
      currentStepId = "clarifying-request";
      onProgress?.({ stepId: currentStepId, phase: "Clarifying the request", status: "running" });
      onProgress?.({ stepId: currentStepId, logEntry: { timestamp: new Date().toISOString(), message: "Analyzing user query and context.", type: "info" } });

      // Example: Tool call
      // const searchResults = await searchWeb(subQuery, numResults);
      // onProgress?.({
      //   stepId: currentStepId,
      //   logEntry: {
      //     timestamp: new Date().toISOString(),
      //     message: `Called webSearch tool for "${subQuery}"`,
      //     type: "tool_call",
      //     details: { toolName: "webSearch", args: { query: subQuery, numResults } }
      //   }
      // });
      // onProgress?.({
      //   stepId: currentStepId,
      //   logEntry: {
      //     timestamp: new Date().toISOString(),
      //     message: `Received ${searchResults.results.length} web results.`,
      //     type: "result",
      //     details: { results: searchResults.results.map(r => r.url) }
      //   }
      // });

      // ... other research logic ...

      // Final "Reporting" phase
      currentStepId = "generating-report";
      onProgress?.({ stepId: currentStepId, phase: "Generating Final Report", status: "running" });
      onProgress?.({ stepId: currentStepId, logEntry: { timestamp: new Date().toISOString(), message: "Compiling all findings into a structured report.", type: "info" } });

      onProgress?.({ stepId: currentStepId, status: "completed", progress: 100 });
    }
    ```

### 3.3. Frontend Component Development

Create a new React component to display the progress.

*   **Create `src/components/research/ResearchProgressDisplay.tsx`**:
    *   This component will receive the `ResearchResult` object (or relevant parts of it) as props.
    *   **Left Panel (Steps/Tabs)**:
        *   Map over `researchResult.steps` to render each step's `phase` or `description` as a clickable item.
        *   Use `scrollIntoView` or a similar method (e.g., `react-scroll` library for smoother scrolling) to navigate the right panel.
        *   Highlight the currently active/scrolled step.
    *   **Right Panel (Detailed Actions)**:
        *   Map over `researchResult.steps` again. For each step, render a header (e.g., `<h2>`) with a unique ID (e.g., `id={step.id}`).
        *   Below each header, iterate through `step.logs` to display each `ResearchLogEntry` (timestamp, message, type, details).
        *   Style log entries differently based on `type` (info, debug, tool_call, result, error).
        *   Ensure the right panel has `overflow-y-auto` for scrolling.

    ```typescript
    // src/components/research/ResearchProgressDisplay.tsx (conceptual)

    import React, { useRef, useEffect } from 'react';
    import { ResearchResult, ResearchStep, ResearchLogEntry } from '@/types/research'; // Adjust path

    interface ResearchProgressDisplayProps {
      researchResult: ResearchResult;
    }

    const ResearchProgressDisplay: React.FC<ResearchProgressDisplayProps> = ({ researchResult }) => {
      const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

      const scrollToStep = (stepId: string) => {
        stepRefs.current[stepId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };

      return (
        <div className="flex h-full">
          {/* Left Panel: Steps/Tabs */}
          <div className="w-1/4 p-4 border-r border-gray-200 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Research Steps</h3>
            <ul>
              {researchResult.steps.map((step) => (
                <li key={step.id} className="mb-2">
                  <button
                    onClick={() => scrollToStep(step.id)}
                    className="text-left w-full p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    // Add active styling based on current scroll position or active step
                  >
                    {step.phase || step.description}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Panel: Detailed Logs */}
          <div className="w-3/4 p-4 overflow-y-auto">
            {researchResult.steps.map((step) => (
              <div key={step.id} id={step.id} ref={el => stepRefs.current[step.id] = el} className="mb-8">
                <h2 className="text-xl font-bold mb-4 sticky top-0 bg-white py-2">{step.phase || step.description}</h2>
                <div className="space-y-2">
                  {step.logs?.map((log, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md text-sm">
                      <span className="text-gray-500 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className={`font-medium ${log.type === 'error' ? 'text-red-600' : ''}`}>
                        {log.type.toUpperCase()}:
                      </span>{' '}
                      {log.message}
                      {log.details && (
                        <pre className="mt-1 text-xs text-gray-700 bg-gray-100 p-2 rounded-md overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    export default ResearchProgressDisplay;
    ```

### 3.4. Frontend Integration

*   **Modify `src/app/page.tsx` or `src/components/research/ResearchInterface.tsx`**:
    *   Import `ResearchProgressDisplay`.
    *   Pass the `currentResearch` object from the `research-store` to `ResearchProgressDisplay`.
    *   Conditionally render `ResearchProgressDisplay` when research is active.

    ```typescript
    // src/components/research/ResearchInterface.tsx (conceptual)

    import { useResearchStore } from '@/lib/stores/research-store';
    import ResearchProgressDisplay from './ResearchProgressDisplay'; // New import

    const ResearchInterface: React.FC = () => {
      const { currentResearch, isResearching } = useResearchStore();

      return (
        <div className="h-full flex flex-col">
          {/* ... existing UI elements ... */}

          {isResearching && currentResearch && (
            <div className="flex-grow"> {/* This div will contain the new progress display */}
              <ResearchProgressDisplay researchResult={currentResearch} />
            </div>
          )}

          {/* ... existing UI elements ... */}
        </div>
      );
    };
    ```

### 3.5. API Endpoint (Backend) Modifications

The API endpoint needs to handle the real-time updates from the AI agent and push them to the frontend.

*   **Modify `src/app/api/research/start/route.ts`**:
    *   Instead of just returning the final report, this endpoint should establish a streaming connection (e.g., Server-Sent Events - SSE) or use WebSockets to push `ResearchStepUpdate` objects to the client as they occur.
    *   Alternatively, if SSE/WebSockets are too complex for a first iteration, the frontend can poll the `research-store` state at regular intervals, and the `research-store` would be updated by the API endpoint. However, a streaming approach is preferred for real-time updates.

    ```typescript
    // src/app/api/research/start/route.ts (conceptual for SSE)

    import { conductResearch } from '@/lib/research/ai-agent';
    import { ResearchStepUpdate } from '@/types/research'; // New import
    import { NextResponse } from 'next/server';

    export async function POST(req: Request) {
      const { query, depth } = await req.json();

      // For SSE, we need to return a ReadableStream
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          const onProgressUpdate = (update: ResearchStepUpdate) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}

`));
          };

          try {
            await conductResearch(query, depth, onProgressUpdate); // Pass the callback
            controller.enqueue(encoder.encode('event: end
data: Research completed

'));
          } catch (error: any) {
            controller.enqueue(encoder.encode(`event: error
data: ${JSON.stringify({ message: error.message })}

`));
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
    }
    ```

### 3.6. State Management (Frontend)

*   **Modify `src/lib/stores/research-store.ts`**:
    *   The store needs to be able to receive and accumulate the `ResearchStepUpdate` objects.
    *   When a `ResearchStepUpdate` comes in, it should find the corresponding `ResearchStep` in `currentResearch.steps` (creating it if it's a new step) and update its `status`, `progress`, `phase`, and append `logEntry` to its `logs` array.

    ```typescript
    // src/lib/stores/research-store.ts (conceptual)

    import { create } from 'zustand';
    import { ResearchResult, ResearchStep, ResearchStepUpdate } from '@/types/research'; // New import

    interface ResearchState {
      currentResearch?: ResearchResult;
      researchHistory: ResearchResult[];
      isResearching: boolean;
      currentStep?: ResearchStep; // This might become redundant if steps are within currentResearch
      // ... other state ...
      updateResearchProgress: (update: ResearchStepUpdate) => void; // New action
      startNewResearch: (initialResearch: ResearchResult) => void; // Modify to accept initial structure
    }

    export const useResearchStore = create<ResearchState>((set, get) => ({
      currentResearch: undefined,
      researchHistory: [],
      isResearching: false,
      currentStep: undefined,
      // ... other actions ...

      startNewResearch: (initialResearch: ResearchResult) => {
        set({
          currentResearch: initialResearch,
          isResearching: true,
          currentStep: undefined, // Reset current step
        });
      },

      updateResearchProgress: (update) => {
        set((state) => {
          if (!state.currentResearch) return state;

          const updatedSteps = [...state.currentResearch.steps];
          let targetStep = updatedSteps.find(s => s.id === update.stepId);

          if (!targetStep) {
            // Create new step if it doesn't exist (e.g., initial "Thinking" step)
            targetStep = {
              id: update.stepId,
              description: update.phase || 'Unknown Step', // Use phase as description initially
              type: 'planning', // Default type, can be refined by AI
              status: 'pending',
              progress: 0,
              startTime: new Date(),
              logs: [],
              phase: update.phase,
            };
            updatedSteps.push(targetStep);
          }

          // Update step properties
          if (update.phase) targetStep.phase = update.phase;
          if (update.status) targetStep.status = update.status;
          if (update.progress !== undefined) targetStep.progress = update.progress;
          if (update.logEntry) targetStep.logs?.push(update.logEntry);
          if (update.status === 'completed' || update.status === 'failed') targetStep.endTime = new Date();

          return {
            currentResearch: {
              ...state.currentResearch,
              steps: updatedSteps,
              currentPhase: update.phase || state.currentResearch.currentPhase, // Update overall phase
            },
            isResearching: update.status !== 'completed' && update.status !== 'failed',
          };
        });
      },
    }));
    ```

### 3.7. Styling

*   Use Tailwind CSS classes to achieve the desired layout and appearance as per the screenshot.
*   Ensure the left panel has a fixed width and the right panel takes the remaining space.
*   Apply appropriate padding, margins, borders, and background colors.
*   Consider using `sticky` positioning for the right panel's step headers to keep them visible while scrolling through their logs.

## 4. Testing

*   **Unit Tests**:
    *   Test the `updateResearchProgress` action in `research-store.ts` to ensure it correctly updates the `currentResearch` object.
    *   Test any new utility functions in `ai-agent.ts` for generating logs.
*   **Integration Tests**:
    *   Verify that the AI agent's progress updates are correctly sent to the frontend via the API.
    *   Ensure the `ResearchProgressDisplay` component correctly renders the steps and logs.
    *   Test the scrolling functionality when clicking on left-panel tabs.
*   **Manual Testing**:
    *   Run the application and initiate a research query.
    *   Observe the new UI section to ensure it updates in real-time and displays information accurately.
    *   Check responsiveness on different screen sizes.

## 5. Future Considerations

*   **Error Handling**: More robust error handling and display for failed steps or tool calls.
*   **Tool Output Display**: Enhance the display of `tool_call` logs to show tool arguments and outputs in a more readable format.
*   **Searchable Logs**: Add a search bar to the right panel to filter logs.
*   **Collapsible Sections**: Allow users to collapse/expand detailed logs for each step.
*   **Progress Bar**: Add a global progress bar based on the overall `progress` of `currentResearch`.

This plan provides a comprehensive roadmap for implementing the desired research progress display.
