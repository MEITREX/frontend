import React from "react";

interface ProgressSection {
  color: string;
  widthPercent: number;
}

interface CompetencyProgressbarProps {
  competencyName: string;
  heightValue?: number;
  progressValue: number; // between 0 and 100
  barSections: ProgressSection[]; // bar sections for each skill
}

const CompetencyProgressbar: React.FC<CompetencyProgressbarProps> = ({
  competencyName,
  heightValue = 10,
  progressValue,
  barSections,
}) => {
  const clampedProgress = Math.min(Math.max(progressValue, 0), 100); 

  return (
    <div className="mb-1">
      <div className="text-sm font-medium text-slate-700 mb-1">
        {competencyName}
      </div>
      <div
        className="w-full rounded-full overflow-hidden flex"
        style={{ height: `${heightValue}px` }}
      >
        {/* dynamic bar sections */}
        {barSections.map((section, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: section.color,
              width: `${section.widthPercent}%`,
              transition: "width 0.3s ease-in-out",
            }}
          />
        ))}

        {/* if not a 100%, fill up with grey */}
        {clampedProgress < 100 && (
          <div
            style={{
              backgroundColor: "#E5E7EB",
              width: `${100 - clampedProgress}%`,
              transition: "width 0.3s ease-in-out",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CompetencyProgressbar;
