type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const getImportMetaEnv = (): Record<string, string | undefined> => {
  try {
    return new Function(
      'return typeof import !== "undefined" && import.meta && import.meta.env ? import.meta.env : {};'
    )() as Record<string, string | undefined>;
  } catch {
    return {};
  }
};

const resolveLevel = (): LogLevel => {
  const importMetaEnv = getImportMetaEnv();
  const processEnv =
    typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>) : {};

  const rawLevel = importMetaEnv.VITE_LOG_LEVEL || processEnv.VITE_LOG_LEVEL || 'info';
  const level = rawLevel.toLowerCase();
  if (['debug', 'info', 'warn', 'error'].includes(level)) {
    return level as LogLevel;
  }
  return 'info';
};

const activeLevel = resolveLevel();

const shouldLog = (level: LogLevel) => LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[activeLevel];

const formatArgs = (args: unknown[]) => args;

const createLogger = () => ({
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.debug(...formatArgs(args));
    }
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) {
      console.info(...formatArgs(args));
    }
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn(...formatArgs(args));
    }
  },
  error: (...args: unknown[]) => {
    if (shouldLog('error')) {
      console.error(...formatArgs(args));
    }
  },
});

export const logger = createLogger();
