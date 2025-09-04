import React from "react";

export type ATSSuggestion = {
  type: "good" | "improve";
  tip: string;
};

export type ATSProps = {
  score: number; // 1-100
  suggestions: ATSSuggestion[];
};

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  const clamped = Math.max(1, Math.min(100, Math.round(score)));

  // Background gradient start color based on score
  const fromColor = clamped > 69 ? "from-green-100" : clamped > 49 ? "from-yellow-100" : "from-red-100";

  // Icon based on score
  const icon = clamped > 69 ? "/icons/ats-good.svg" : clamped > 49 ? "/icons/ats-warning.svg" : "/icons/ats-bad.svg";

  return (
    <div className={`w-full rounded-2xl shadow-md bg-gradient-to-b ${fromColor} to-white p-6`}> 
      {/* Top section */}
      <div className="flex items-center gap-4">
        <img src={icon} alt="ATS status" className="h-12 w-12" />
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">ATS Score - {clamped}/100</h2>
          <p className="text-sm text-gray-500">Automated resume screening compatibility</p>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold">How to interpret this</h3>
        <p className="text-sm text-gray-600 mt-1">
          This score estimates how well your resume can be parsed and ranked by common Applicant Tracking Systems. Improve clarity, structure, and keyword usage for better ATS performance.
        </p>

        {/* Suggestions list */}
        {suggestions?.length > 0 && (
          <ul className="mt-4 space-y-2">
            {suggestions.map((s, i) => {
              const sugIcon = s.type === "good" ? "/icons/check.svg" : "/icons/warning.svg";
              const sugAlt = s.type === "good" ? "Good" : "Improve";
              return (
                <li key={i} className="flex items-start gap-2">
                  <img src={sugIcon} alt={sugAlt} className="h-5 w-5 mt-0.5" />
                  <span className="text-sm text-gray-800">{s.tip}</span>
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-sm text-gray-700 mt-4">
          Keep refining your resume to boost ATS compatibility and stand out in automated screenings.
        </p>
      </div>
    </div>
  );
};

export default ATS;
