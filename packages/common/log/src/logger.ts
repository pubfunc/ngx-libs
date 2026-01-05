import { ILogObject, ILogger, ILogTransport, LogLevel } from './types';
import { DEFAULT_TRANSPORT } from './provide';

export class Logger implements ILogger {
  private configured = false;

  constructor(
    private level: LogLevel,
    public namespace: string,
    private transport: ILogTransport,
  ) {}

  configure(options: { namespace?: string; transport?: ILogTransport; level?: LogLevel }) {
    if (this.configured) {
      this.warn('Attempting to configure RootLogger that has already been configured.');
    }

    this.configured = true;
    this.level = options.level ?? this.level;
    this.transport = options.transport ?? this.transport;
    this.namespace = options.namespace ?? this.namespace;

    this.debug(`Log configured with namespace ${options.namespace}`);
  }

  log(logObject: ILogObject) {
    if (this.level > logObject.level) return;
    this.transport.push({
      ...logObject,
      namespace: logObject.namespace ? `${this.namespace}/${logObject.namespace}` : this.namespace,
    });
  }

  trace(message: string, context?: Omit<ILogObject, 'message' | 'level'>) {
    this.log({ level: LogLevel.TRACE, message, ...context });
  }

  debug(message: string, context?: Omit<ILogObject, 'message' | 'level'>) {
    this.log({ level: LogLevel.DEBUG, message, ...context });
  }

  info(message: string, context?: Omit<ILogObject, 'message' | 'level'>) {
    this.log({ level: LogLevel.INFO, message, ...context });
  }

  warn(message: string, context?: Omit<ILogObject, 'message' | 'level'>) {
    this.log({ level: LogLevel.WARN, message, ...context });
  }

  error(message: string, context?: Omit<ILogObject, 'message' | 'level'>) {
    this.log({ level: LogLevel.ERROR, message, ...context });
  }

  createSubnamespace(namespace: string) {
    return new ChildLogger(this, namespace);
  }
}

class ChildLogger implements ILogger {
  constructor(
    private parent: ILogger,
    private namespace: string,
  ) {}

  log(logObject: ILogObject) {
    this.parent.log({
      ...logObject,
      namespace: logObject.namespace ? `${this.namespace}/${logObject.namespace}` : this.namespace,
    });
  }

  trace(message: string, context?: Omit<ILogObject, 'message' | 'level'>) {
    this.log({ level: LogLevel.TRACE, message, ...context });
  }

  debug(message: string, context?: Omit<ILogObject, 'message' | 'level'>) {
    this.log({ level: LogLevel.DEBUG, message, ...context });
  }

  info(message: string, context?: Omit<ILogObject, 'message' | 'level'>) {
    this.log({ level: LogLevel.INFO, message, ...context });
  }

  warn(message: string, context?: Omit<ILogObject, 'message' | 'level'>) {
    this.log({ level: LogLevel.WARN, message, ...context });
  }

  error(message: string, context?: Omit<ILogObject, 'message' | 'level'>) {
    this.log({ level: LogLevel.ERROR, message, ...context });
  }
}

export const Log = new Logger(LogLevel.DEBUG, 'App', DEFAULT_TRANSPORT);
