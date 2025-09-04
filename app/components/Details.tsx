import React from "react";
import { Accordion, AccordionContent, AccordionHeader, AccordionItem } from "./Accordion";
import { cn } from "~/lib/utils";

// Assume Feedback type is imported or globally available
// type Feedback = { ... };

type Tip = {
  type: "good" | "improve";
  tip: string;
  explanation: string;
};

type Category = {
  score?: number | null;
  tips?: Tip[] | null;
};

// Helper Component: ScoreBadge
const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const color = score > 69 ? "green" : score > 39 ? "yellow" : "red";
  const bg =
    color === "green"
      ? "bg-green-100 border-green-200"
      : color === "yellow"
      ? "bg-yellow-100 border-yellow-200"
      : "bg-red-100 border-red-200";
  const text =
    color === "green"
      ? "text-green-700"
      : color === "yellow"
      ? "text-yellow-700"
      : "text-red-700";
  const icon = color === "green" ? (
    // check icon
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ) : color === "yellow" ? (
    // alert icon
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ) : (
    // x icon
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border", bg, text)}>
      {icon}
      <span>{score}/100</span>
    </span>
  );
};

// Helper Component: CategoryHeader
const CategoryHeader: React.FC<{ title: string; categoryScore: number }> = ({ title, categoryScore }) => {
  return (
    <div className="flex items-center justify-between w-full">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <ScoreBadge score={categoryScore} />
    </div>
  );
};

// Helper Component: CategoryContent
const CategoryContent: React.FC<{ tips: Tip[] }> = ({ tips }) => {
  const list = tips ?? [];
  return (
    <div className="space-y-4">
      {/* Two-column grid of tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {list.map((t, idx) => (
          <div key={idx} className={cn("flex items-start gap-2 rounded-md border p-3", t.type === "good" ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50") }>
            <div className={cn("mt-0.5", t.type === "good" ? "text-green-600" : "text-yellow-600") }>
              {t.type === "good" ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{t.tip}</p>
              <p className="text-xs text-gray-600">{t.explanation}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Explanation boxes list */}
      <div className="space-y-2">
        {list.map((t, idx) => (
          <div
            key={`exp-${idx}`}
            className={cn(
              "rounded-md p-3 text-sm",
              t.type === "good"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-yellow-50 text-yellow-800 border border-yellow-200"
            )}
          >
            <span className="font-semibold mr-2">{t.type === "good" ? "Good:" : "Improve:"}</span>
            {t.explanation}
          </div>
        ))}
      </div>
    </div>
  );
};

interface DetailsProps {
  feedback: Feedback; // assumed available globally/imported
}

const Details: React.FC<DetailsProps> = ({ feedback }) => {
  // We attempt to read category scores and tips; use optional chaining and defaults
  const toneAndStyle: Category = (feedback as any)?.toneAndStyle ?? {};
  const content: Category = (feedback as any)?.content ?? {};
  const structure: Category = (feedback as any)?.structure ?? (feedback as any)?.strucutre ?? {};
  const skills: Category = (feedback as any)?.skills ?? {};

  const sections = [
    { id: "tone-and-style", title: "Tone & Style", data: toneAndStyle },
    { id: "content", title: "Content", data: content },
    // Intentionally keep the spelled title as requested: "Strucutre"
    { id: "structure", title: "Strucutre", data: structure },
    { id: "skills", title: "Skills", data: skills },
  ];

  return (
    <div className="w-full">
      <Accordion allowMultiple className="divide-y divide-gray-200">
        {sections.map((section) => (
          <AccordionItem key={section.id} id={section.id}>
            <AccordionHeader itemId={section.id} className="bg-white hover:bg-gray-50">
              <CategoryHeader title={section.title} categoryScore={Number(section.data.score ?? 0)} />
            </AccordionHeader>
            <AccordionContent itemId={section.id}>
              <CategoryContent tips={(section.data.tips as Tip[]) ?? []} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Details;
