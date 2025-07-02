import {
  ResearchLogEntry,
  ResearchResult,
  ResearchStep,
} from "@/types/research";
import React, { useEffect, useRef, useState } from "react";

interface ResearchProgressDisplayProps {
  researchResult: ResearchResult;
}

const ResearchProgressDisplay: React.FC<ResearchProgressDisplayProps> = ({
  researchResult,
}) => {
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeStep, setActiveStep] = useState(
    researchResult.steps[0]?.id || ""
  );

  // Scroll to step and set active
  const scrollToStep = (stepId: string) => {
    stepRefs.current[stepId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setActiveStep(stepId);
  };

  // Highlight step on scroll
  useEffect(() => {
    const handleScroll = () => {
      let found = false;
      for (const step of researchResult.steps) {
        const ref = stepRefs.current[step.id];
        if (ref) {
          const rect = ref.getBoundingClientRect();
          if (!found && rect.top < window.innerHeight / 2) {
            setActiveStep(step.id);
            found = true;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [researchResult.steps]);

  return (
    <div className="flex h-full min-h-[600px]">
      {/* Left Panel: Timeline Steps */}
      <div className="w-1/4 p-6 border-r border-gray-200 dark:border-gray-800 overflow-y-auto min-h-full bg-[var(--background)]">
        <h3 className="text-lg font-bold mb-8 text-[var(--foreground)] tracking-wide">
          Completed
        </h3>
        <ol className="relative border-l-2 border-gray-300 dark:border-gray-700 ml-4">
          {researchResult.steps.map((step, idx) => {
            const isCompleted =
              idx < researchResult.steps.findIndex((s) => s.id === activeStep);
            const isActive = step.id === activeStep;
            return (
              <li
                key={step.id}
                className="mb-8 last:mb-0 flex items-start group"
              >
                <span
                  className={`absolute -left-5 flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all
                    ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                        ? "bg-blue-600 border-blue-400 text-white"
                        : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : isActive ? (
                    <span className="block w-3 h-3 bg-white rounded-full" />
                  ) : (
                    <span className="block w-2 h-2 bg-gray-400 rounded-full" />
                  )}
                </span>
                <button
                  onClick={() => scrollToStep(step.id)}
                  className={`text-left w-full pl-6 py-2 rounded-md transition-colors font-medium
                    ${
                      isActive
                        ? "bg-gray-100 dark:bg-gray-800 text-[var(--foreground)] shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[var(--foreground)]"
                    } focus:outline-none`}
                >
                  {step.phase || step.description}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Right Panel: Step Details */}
      <div className="w-3/4 p-8 overflow-y-auto min-h-full bg-[var(--background)]">
        {researchResult.steps.map((step: ResearchStep) => (
          <div
            key={step.id}
            id={step.id}
            ref={(el: HTMLDivElement | null) => {
              stepRefs.current[step.id] = el;
            }}
            className="mb-12"
          >
            <div className="sticky top-0 z-10 bg-[var(--background)] pb-2">
              <h2 className="text-2xl font-bold mb-2 text-[var(--foreground)] tracking-wide">
                {step.phase || step.description}
              </h2>
            </div>
            <div className="rounded-xl p-6 shadow-lg bg-gray-50 dark:bg-gray-900">
              <ul className="list-disc pl-6 space-y-3">
                {step.logs?.map((log: ResearchLogEntry) => (
                  <li
                    key={log.timestamp}
                    className="text-[var(--foreground)] text-base"
                  >
                    <span
                      className={`font-semibold ${
                        log.type === "error"
                          ? "text-red-500"
                          : "text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {log.type.toUpperCase()}:
                    </span>{" "}
                    {log.message}
                    {log.details && (
                      <pre className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-2 rounded-md overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchProgressDisplay;
