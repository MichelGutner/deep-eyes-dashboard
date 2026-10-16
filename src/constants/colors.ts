export const LOG_LEVEL_COLORS = {
  debug: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-700 dark:text-gray-300',
    badge: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    border: 'border-gray-400',
    bar: '#6b7280',
    hex: '#6b7280',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    border: 'border-blue-400',
    bar: '#3b82f6',
    hex: '#3b82f6',
  },
  warn: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-300',
    badge: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-400',
    bar: '#f59e0b',
    hex: '#f59e0b',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
    badge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    border: 'border-red-400',
    bar: '#ef4444',
    hex: '#ef4444',
  },
  fatal: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-300',
    badge: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    border: 'border-purple-500',
    bar: '#8b5cf6',
    hex: '#8b5cf6',
  },
} as const;

export type LogLevel = keyof typeof LOG_LEVEL_COLORS;

export function getLevelColors(level: string) {
  return LOG_LEVEL_COLORS[level as LogLevel] ?? LOG_LEVEL_COLORS.info;
}

export const CHART_COLORS = {
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  debug: '#6b7280',
  success: '#10b981',
  primary: '#3b82f6',
} as const;
