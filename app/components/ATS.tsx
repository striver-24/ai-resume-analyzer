import React from "react";

export type ATSSuggestion = {
  type: "good" | "improve";
  tip: string;
};

export type ATSProps = {
  score: number; // 1-100
  suggestions?: ATSSuggestion[];
};

const ATS: React.FC<ATSProps> = ({ score }) => {
  const clamped = Math.max(1, Math.min(100, Math.round(score)));

  // Background gradient start color based on score
  const fromColor = clamped > 69 ? "from-green-100" : clamped > 49 ? "from-yellow-100" : "from-red-100";

  // Icon based on score
  const icon = clamped > 69 ? "/icons/ats-good.svg" : clamped > 49 ? "/icons/ats-warning.svg" : "/icons/ats-bad.svg";

  return (
    <div className={`w-full rounded-2xl shadow-md bg-gradient-to-b ${fromColor} to-white p-6`}> 
      <div className="flex items-center gap-4">
        <img src={icon} alt="ATS status" className="h-12 w-12" />
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">ATS Score - {clamped}/100</h2>
        </div>
      </div>
    </div>
  );
};

export default ATS;
