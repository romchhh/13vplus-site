/**
 * Simple leveled logger. In production only warn/error are emitted unless LOG_LEVEL is set.
 */

const LOG_LEVEL = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "development" ? "debug" : "info");
const levels = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = levels[LOG_LEVEL as keyof typeof levels] ?? levels.info;

function log(level: keyof typeof levels, prefix: string, ...args: unknown[]) {
  if (levels[level] < currentLevel) return;
  const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  const tag = prefix ? `[${prefix}]` : "";
  if (args.length === 0) fn(tag);
  else if (typeof args[0] === "string" && args.length === 1) fn(tag, args[0]);
  else fn(tag, ...args);
}

export function createLogger(prefix: string) {
  return {
    debug: (...args: unknown[]) => log("debug", prefix, ...args),
    info: (...args: unknown[]) => log("info", prefix, ...args),
    warn: (...args: unknown[]) => log("warn", prefix, ...args),
    error: (...args: unknown[]) => log("error", prefix, ...args),
  };
}

export const logger = createLogger("app");
export const apiLogger = createLogger("api");
