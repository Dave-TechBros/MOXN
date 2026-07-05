/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { TrendingUp, BarChart3, Calendar, PieChart } from "lucide-react";

interface DailyViewsData {
  name: string;
  views: number;
  reads: number;
  comments: number;
}

interface WriterAnalyticsProps {
  dailyViews: DailyViewsData[];
}

export function WriterViewsChart({ dailyViews }: WriterAnalyticsProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!dailyViews || dailyViews.length === 0) {
    return <div className="h-48 flex items-center justify-center text-gray-400">No telemetry log found.</div>;
  }

  // Calculate SVG dimensions
  const width = 600;
  const height = 240;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find max values for scaling
  const maxVal = Math.max(...dailyViews.map(d => Math.max(d.views, d.reads, d.comments)), 100);

  // Map points for SVGs
  const getPoints = (key: "views" | "reads" | "comments") => {
    return dailyViews.map((d, i) => {
      const x = padding + (i / (dailyViews.length - 1)) * chartWidth;
      const y = padding + chartHeight - (d[key] / maxVal) * chartHeight;
      return `${x},${y}`;
    }).join(" ");
  };

  const viewsPoints = getPoints("views");
  const readsPoints = getPoints("reads");

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-50 text-[#1E3A8A] rounded-lg">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-gray-800">Weekly Performance Traffic</h3>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-bold">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
            <span className="text-gray-500">Page Views</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
            <span className="text-gray-500">Reads Completed</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
          {/* Grids */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + chartHeight * ratio;
            return (
              <g key={i}>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={width - padding} 
                  y2={y} 
                  stroke="#F3F4F6" 
                  strokeWidth="1" 
                  strokeDasharray="4 4"
                />
                <text 
                  x={padding - 10} 
                  y={y + 4} 
                  className="text-[10px] font-mono fill-gray-400 text-right" 
                  textAnchor="end"
                >
                  {Math.round(maxVal * (1 - ratio))}
                </text>
              </g>
            );
          })}

          {/* Line: Views */}
          <polyline
            fill="none"
            stroke="#2563EB"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={viewsPoints}
            className="drop-shadow-[0_2px_8px_rgba(37,99,235,0.2)]"
          />

          {/* Line: Reads */}
          <polyline
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={readsPoints}
            className="drop-shadow-[0_2px_8px_rgba(16,185,129,0.2)]"
          />

          {/* Interactive Hover Areas */}
          {dailyViews.map((d, i) => {
            const x = padding + (i / (dailyViews.length - 1)) * chartWidth;
            const yViews = padding + chartHeight - (d.views / maxVal) * chartHeight;
            const yReads = padding + chartHeight - (d.reads / maxVal) * chartHeight;

            return (
              <g 
                key={i} 
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer"
              >
                {/* Vertical hover line */}
                {hoverIndex === i && (
                  <line
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={height - padding}
                    stroke="#D1D5DB"
                    strokeWidth="1"
                  />
                )}

                {/* X labels */}
                <text
                  x={x}
                  y={height - padding + 20}
                  className={`text-[11px] font-bold text-center ${hoverIndex === i ? "fill-[#1E3A8A] font-extrabold" : "fill-gray-400"}`}
                  textAnchor="middle"
                >
                  {d.name}
                </text>

                {/* Data dots */}
                {hoverIndex === i && (
                  <>
                    <circle cx={x} cy={yViews} r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx={x} cy={yReads} r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Live Floating Tooltip */}
        {hoverIndex !== null && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 text-white p-3 rounded-xl border border-gray-800 shadow-xl text-left pointer-events-none z-50 text-[11px] flex flex-col space-y-1">
            <p className="font-bold border-b border-gray-800 pb-1 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Performance Log: {dailyViews[hoverIndex].name}</span>
            </p>
            <div className="flex items-center justify-between space-x-8">
              <span>Views:</span>
              <span className="font-mono font-bold text-blue-400">{dailyViews[hoverIndex].views}</span>
            </div>
            <div className="flex items-center justify-between space-x-8">
              <span>Reads:</span>
              <span className="font-mono font-bold text-green-400">{dailyViews[hoverIndex].reads}</span>
            </div>
            <div className="flex items-center justify-between space-x-8">
              <span>Comments:</span>
              <span className="font-mono font-bold text-yellow-400">{dailyViews[hoverIndex].comments}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Global Category Coverage breakdown for Editor Dashboards
interface CategoryBreakdown {
  name: string;
  count: number;
}

export function CategoryBreakdownChart({ breakdown }: { breakdown: CategoryBreakdown[] }) {
  if (!breakdown || breakdown.length === 0) {
    return <div className="h-48 flex items-center justify-center text-gray-400">No coverage breakdown.</div>;
  }

  const maxCount = Math.max(...breakdown.map(b => b.count), 1);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
            <PieChart className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-gray-800">Curation Matrix (Catergory Spread)</h3>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed mb-6">
          Quantifying story curation across the active categories. High indices represent heavy newsroom emphasis.
        </p>
      </div>

      <div className="space-y-3.5">
        {breakdown.map((item, idx) => {
          const percentage = Math.max(8, (item.count / maxCount) * 100);
          return (
            <div key={idx} className="flex flex-col space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-gray-700">{item.name}</span>
                <span className="font-mono text-gray-400">{item.count} dispatches</span>
              </div>
              <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden border border-gray-100">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
