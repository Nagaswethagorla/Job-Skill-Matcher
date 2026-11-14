import React from 'react';

interface MatchBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export const MatchBadge: React.FC<MatchBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  // Determine categories and colors
  let category = 'Low Match';
  let strokeColor = '#f43f5e'; // rose-500
  let textColor = 'text-rose-600 dark:text-rose-400';
  let bgColor = 'bg-rose-50 text-rose-700 border-rose-200';
  let badgeLabelColor = 'text-rose-600 bg-rose-50 border-rose-200';

  if (score >= 80) {
    category = 'Excellent Match';
    strokeColor = '#10b981'; // emerald-500
    textColor = 'text-emerald-600 dark:text-emerald-400';
    bgColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    badgeLabelColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (score >= 60) {
    category = 'Good Match';
    strokeColor = '#3b82f6'; // blue-500
    textColor = 'text-blue-600 dark:text-blue-400';
    bgColor = 'bg-blue-50 text-blue-700 border-blue-200';
    badgeLabelColor = 'text-blue-700 bg-blue-50 border-blue-200';
  } else if (score >= 40) {
    category = 'Moderate Match';
    strokeColor = '#f59e0b'; // amber-500
    textColor = 'text-amber-600 dark:text-amber-400';
    bgColor = 'bg-amber-50 text-amber-700 border-amber-200';
    badgeLabelColor = 'text-amber-700 bg-amber-50 border-amber-200';
  }

  // Size dimensions for circular SVG progress
  const dimensions = {
    sm: { dimension: 44, strokeWidth: 4, textSize: 'text-xs', labelSize: 'text-[10px]' },
    md: { dimension: 64, strokeWidth: 5, textSize: 'text-sm font-bold', labelSize: 'text-xs' },
    lg: { dimension: 88, strokeWidth: 7, textSize: 'text-xl font-extrabold', labelSize: 'text-xs' },
    xl: { dimension: 120, strokeWidth: 9, textSize: 'text-3xl font-black', labelSize: 'text-sm' },
  }[size];

  const radius = (dimensions.dimension - dimensions.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 select-none">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dimensions.dimension}
          height={dimensions.dimension}
          className="transform -rotate-90 transition-all duration-700 ease-out"
        >
          {/* Background Track */}
          <circle
            cx={dimensions.dimension / 2}
            cy={dimensions.dimension / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={dimensions.strokeWidth}
            fill="transparent"
          />
          {/* Colored Progress Arc */}
          <circle
            cx={dimensions.dimension / 2}
            cy={dimensions.dimension / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={dimensions.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${dimensions.textSize} ${textColor}`}>
            {score}%
          </span>
        </div>
      </div>

      {showLabel && (
        <span
          className={`px-2 py-0.5 rounded-full font-semibold border ${dimensions.labelSize} ${badgeLabelColor}`}
        >
          {category}
        </span>
      )}
    </div>
  );
};
