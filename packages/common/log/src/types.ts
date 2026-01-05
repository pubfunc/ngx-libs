export type LogFn = (message: string, context?: Omit<ILogObject, 'message' | 'level'>) => void;

export interface ILogger {
  log: (logObject: ILogObject) => void;
  trace: LogFn;
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

export interface ILogTransport {
  push: (logObject: ILogObject) => void;
}

export interface ILogObject {
  level: LogLevel;
  namespace?: string;
  message?: string;
  context?: Record<string, any>;
  error?: unknown;
}

export const enum LogLevel {
  TRACE,
  DEBUG,
  INFO,
  WARN,
  ERROR,
}
