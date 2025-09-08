type LogLevel = "silent" | "error" | "warn" | "info" | "debug" | "trace";
const rank: Record<LogLevel, number> = { silent: 999, error: 50, warn: 40, info: 30, debug: 20, trace: 10 };

const IS_BROWSER = typeof window !== "undefined";
const DEV_FLAG = (IS_BROWSER && ((window as any).__LOG_DEV__ === true || (window as any).__LOG_CALLER__ === true)) || (!IS_BROWSER && (globalThis as any).process?.env?.NODE_ENV !== "production");

const CALLER_FLAG = IS_BROWSER ? (window as any).__LOG_CALLER__ === true : DEV_FLAG;
const EXPAND_FLAG = IS_BROWSER ? (window as any).__LOG_EXPAND__ === true : DEV_FLAG;

// Matches Chrome/Firefox: " at /path/file.js:line:col" and Safari: "@/path/file.js:line:col"
const STACK_RE = /(?:\bat\b|@)\s*(.*?):(\d+):(\d+)/;

function getCaller(skip = 3, exclude: RegExp[] = []) {
  const err = new Error();
  if (!err.stack) return null;
  const lines = err.stack.split("\n").slice(skip);
  const frame = lines.find((ln) => {
    const m = ln.match(STACK_RE);
    if (!m) return false;
    const file = m[1];
    return !exclude.some((re) => re.test(file));
  });
  const m = frame?.match(STACK_RE);
  if (!m) return null;
  const [, file, lineStr, colStr] = m;
  const line = Number(lineStr),
    col = Number(colStr);
  return { file, line, col, label: `@ ${file}:${line}:${col}` };
}

function getStack(skip = 3, exclude: RegExp[] = [], max = 8): string[] {
  const err = new Error();
  const out: string[] = [];
  const stack = err.stack?.split("\n").slice(skip) ?? [];
  for (const ln of stack) {
    const m = ln.match(STACK_RE);
    if (!m) continue;
    const file = m[1];
    if (exclude.some((re) => re.test(file))) continue;
    out.push(`${m[1]}:${m[2]}:${m[3]}`);
    if (out.length >= max) break;
  }
  return out;
}

function getLevels(): Record<string, LogLevel> {
  if (IS_BROWSER) {
    const lvls = (window as any).__LOG_LEVELS__;
    return lvls && typeof lvls === "object" ? (lvls as Record<string, LogLevel>) : { default: "info" };
  }
  try {
    const raw = (globalThis as any).process?.env?.LOG_LEVELS ?? "{}";
    const parsed = JSON.parse(raw);
    return { default: "info", ...parsed };
  } catch {
    return { default: "info" };
  }
}

function shouldLog(levels: Record<string, LogLevel>, moduleName: string, level: LogLevel) {
  const moduleLevel = levels[moduleName] ?? levels.default ?? "info";
  return rank[level] >= rank[moduleLevel] && level !== "silent";
}

function ship(level: LogLevel, moduleName: string, payload: any) {
  if (!IS_BROWSER) return; // server: no beacon (server already has pino)
  if (rank[level] < rank.warn) return; // only warn+error
  const body = JSON.stringify({ level, module: moduleName, time: Date.now(), ...payload });
  navigator.sendBeacon?.("/log", body) || fetch("/log", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
}

function toKV(fields: Record<string, unknown> | null | undefined): string {
  if (!fields || typeof fields !== "object") return "";
  const keys = Object.keys(fields).sort();
  const parts: string[] = [];
  for (const k of keys) {
    const v = (fields as any)[k];
    if (v == null) {
      parts.push(`${k}=null`);
    } else if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      parts.push(`${k}=${String(v)}`);
    } else {
      // keep short
      try {
        const s = JSON.stringify(v);
        parts.push(`${k}=${s.length > 80 ? s.slice(0, 77) + "…" : s}`);
      } catch {
        parts.push(`${k}=[object]`);
      }
    }
  }
  return parts.join(" ");
}

const bound = {
  trace: console.trace.bind(console),
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  groupCollapsed: console.groupCollapsed?.bind(console) ?? console.debug.bind(console),
  groupEnd: console.groupEnd?.bind(console) ?? (() => {}),
};

export function getLogger(moduleName: string) {
  const tag = `[${moduleName}]`;
  const exclude = [/pinoLogger\./i, /timber\/dist\//i, /timber\/src\//i];

  const emit = (level: LogLevel, obj?: any, msg?: string) => {
    const levels = getLevels();
    if (!shouldLog(levels, moduleName, level)) return;

    const fields = obj && typeof obj === "object" ? obj : undefined;
    const text = msg ?? (typeof obj === "string" ? obj : "");
    const caller = getCaller(3, exclude); // always compute; cheap
    const kv = toKV(fields);
    const suffix = caller ? ` ${caller.label}` : "";
    const summary = kv ? `${tag} ${text} ${kv}${suffix}` : `${tag} ${text}${suffix}`;

    if (level === "debug" || level === "trace") {
      bound.groupCollapsed(summary);
      // Always show caller + stack so the group is never empty
      if (caller) bound.debug(`caller: ${caller.label}`);
      const stack = getStack(4, exclude, 8);
      if (stack.length) bound.debug("stack:", stack);
      // Fields optionally expanded
      if (fields && (EXPAND_FLAG || level === "trace")) bound.debug("fields:", fields);
      bound.groupEnd();
    } else {
      switch (level) {
        case "error":
          fields ? bound.error(summary, EXPAND_FLAG ? fields : undefined) : bound.error(summary);
          break;
        case "warn":
          fields ? bound.warn(summary, EXPAND_FLAG ? fields : undefined) : bound.warn(summary);
          break;
        default:
          fields ? bound.info(summary, EXPAND_FLAG ? fields : undefined) : bound.info(summary);
      }
    }

    ship(level, moduleName, { ...(fields || {}), msg: text, caller: caller?.label });
  };

  return {
    error: (o?: any, m?: string) => emit("error", o, m),
    warn: (o?: any, m?: string) => emit("warn", o, m),
    info: (o?: any, m?: string) => emit("info", o, m),
    debug: (o?: any, m?: string) => emit("debug", o, m),
    trace: (o?: any, m?: string) => emit("trace", o, m),
  } as const;
}
