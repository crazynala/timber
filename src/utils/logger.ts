// Lightweight configurable logger with module-level thresholds for dev/prod
export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export interface EnvLogConfig {
  defaultLevel: LogLevel;
  modules?: Record<string, LogLevel>;
}

export interface LogConfig {
  dev: EnvLogConfig;
  prod: EnvLogConfig;
}

const levelRank: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

let currentConfig: LogConfig = {
  dev: { defaultLevel: "debug", modules: {} },
  prod: { defaultLevel: "warn", modules: {} },
};

export function setLoggerConfig(cfg: LogConfig) {
  // Shallow validate
  if (!cfg || !cfg.dev || !cfg.prod) return;
  currentConfig = cfg;
}

function isDevEnv() {
  // Prefer Vite/Remix define, fallback to NODE_ENV
  const viteFlag = typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.DEV;
  if (typeof viteFlag === "boolean") return viteFlag;
  const proc = (globalThis as any).process;
  if (proc && proc.env && typeof proc.env.NODE_ENV === "string") return proc.env.NODE_ENV !== "production";
  // Browser heuristic
  if (typeof document !== "undefined") return document.baseURI.includes("localhost");
  return false;
}

function getEnvConfig() {
  return isDevEnv() ? currentConfig.dev : currentConfig.prod;
}

function levelForModule(module: string): LogLevel {
  const env = getEnvConfig();
  if (env.modules && module in env.modules) return env.modules[module]!;
  return env.defaultLevel;
}

function shouldLog(module: string, level: LogLevel) {
  const required = levelForModule(module);
  return levelRank[level] >= levelRank[required];
}

function fmtPrefix(module: string, level: LogLevel) {
  const ts = new Date().toISOString();
  return `[${ts}] [${level.toUpperCase()}] [${module}]`;
}

export function debug(module: string, ...args: any[]) {
  if (!shouldLog(module, "debug")) return;
  // eslint-disable-next-line no-console
  console.debug(fmtPrefix(module, "debug"), ...args);
}

export function info(module: string, ...args: any[]) {
  if (!shouldLog(module, "info")) return;
  // eslint-disable-next-line no-console
  console.info(fmtPrefix(module, "info"), ...args);
}

export function warn(module: string, ...args: any[]) {
  if (!shouldLog(module, "warn")) return;
  // eslint-disable-next-line no-console
  console.warn(fmtPrefix(module, "warn"), ...args);
}

export function error(module: string, ...args: any[]) {
  if (!shouldLog(module, "error")) return;
  // eslint-disable-next-line no-console
  console.error(fmtPrefix(module, "error"), ...args);
}

export function createLogger(module: string) {
  return {
    debug: (...args: any[]) => debug(module, ...args),
    info: (...args: any[]) => info(module, ...args),
    warn: (...args: any[]) => warn(module, ...args),
    error: (...args: any[]) => error(module, ...args),
  } as const;
}
