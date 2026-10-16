import React, { useMemo, useState } from 'react';

interface Log {
  _id: string;
  level: string;
  createdAt: string;
}

interface ErrorHeatmapProps {
  logs: Log[];
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getCellColor(count: number, max: number): string {
  if (count === 0 || max === 0) return '';
  const intensity = count / max;
  if (intensity < 0.2) return 'bg-red-100 dark:bg-red-900/30';
  if (intensity < 0.4) return 'bg-red-200 dark:bg-red-800/50';
  if (intensity < 0.6) return 'bg-red-300 dark:bg-red-700/60';
  if (intensity < 0.8) return 'bg-red-400 dark:bg-red-600/70';
  return 'bg-red-500 dark:bg-red-500/80';
}

export const ErrorHeatmap: React.FC<ErrorHeatmapProps> = ({ logs }) => {
  const [tooltip, setTooltip] = useState<{
    day: number;
    hour: number;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const { grid, max } = useMemo(() => {
    // grid[day][hour]
    const g: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    let maxVal = 0;

    logs.forEach(log => {
      if (log.level !== 'error' && log.level !== 'fatal') return;
      const date = new Date(log.createdAt);
      const day = date.getDay();
      const hour = date.getHours();
      g[day][hour]++;
      if (g[day][hour] > maxVal) maxVal = g[day][hour];
    });

    return { grid: g, max: maxVal };
  }, [logs]);

  // If no real data, generate mock for visual demo
  const { displayGrid, displayMax } = useMemo(() => {
    if (max > 0) return { displayGrid: grid, displayMax: max };
    // Mock data
    const mock: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    let m = 0;
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const isBusinessHour = h >= 8 && h <= 20;
        const isWeekday = d >= 1 && d <= 5;
        const base = isBusinessHour && isWeekday ? Math.random() * 15 : Math.random() * 4;
        mock[d][h] = Math.round(base);
        if (mock[d][h] > m) m = mock[d][h];
      }
    }
    return { displayGrid: mock, displayMax: m };
  }, [grid, max]);

  const totalErrors = displayGrid.flat().reduce((s, v) => s + v, 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Distribuição de Erros</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {totalErrors} erros · por hora e dia da semana
            {max === 0 && <span className="ml-2 text-xs text-gray-400">(dados de exemplo)</span>}
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <span>Menos</span>
          <div className="flex gap-0.5">
            {['bg-gray-100 dark:bg-gray-700', 'bg-red-100 dark:bg-red-900/30', 'bg-red-200 dark:bg-red-800/50', 'bg-red-400 dark:bg-red-600/70', 'bg-red-500 dark:bg-red-500/80'].map((cls, i) => (
              <div key={i} className={`w-3.5 h-3.5 rounded-sm ${cls}`} />
            ))}
          </div>
          <span>Mais</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex ml-10 mb-1">
            {HOURS.map(h => (
              <div
                key={h}
                className="flex-1 text-center text-xs text-gray-400 dark:text-gray-500"
                style={{ minWidth: 0 }}
              >
                {h % 4 === 0 ? `${h}h` : ''}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {DAYS.map((day, dayIdx) => (
            <div key={dayIdx} className="flex items-center mb-1">
              <span className="w-10 text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 pr-2 text-right">
                {day}
              </span>
              <div className="flex flex-1 gap-0.5">
                {HOURS.map(hour => {
                  const count = displayGrid[dayIdx][hour];
                  const color = getCellColor(count, displayMax);
                  return (
                    <div
                      key={hour}
                      className={`flex-1 h-6 rounded-sm cursor-pointer transition-transform hover:scale-110 ${
                        color || 'bg-gray-100 dark:bg-gray-700'
                      }`}
                      title={`${day} ${hour}h: ${count} erros`}
                      onMouseEnter={e => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setTooltip({ day: dayIdx, hour, count, x: rect.left, y: rect.top });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 bg-gray-900 dark:bg-gray-950 text-white text-xs rounded-lg shadow-xl pointer-events-none"
          style={{ top: tooltip.y - 44, left: tooltip.x + 4 }}
        >
          <div className="font-medium">{DAYS[tooltip.day]} {tooltip.hour}:00–{tooltip.hour + 1}:00</div>
          <div className="text-gray-300">
            {tooltip.count} {tooltip.count === 1 ? 'erro' : 'erros'}
          </div>
        </div>
      )}
    </div>
  );
};
