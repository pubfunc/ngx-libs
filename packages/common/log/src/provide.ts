import { inject, InjectionToken } from '@angular/core';
import { ILogger, ILogTransport, LogLevel } from './types';
import { Logger } from './logger';

export const LOGGER = new InjectionToken<ILogger>('LOGGER');

export const DEFAULT_TRANSPORT: ILogTransport = { push: console.log };

export function provideLogger(options: {
  namespace?: string;
  transport?: ILogTransport;
  level?: LogLevel;
}) {
  return {
    provide: LOGGER,
    useValue: new Logger(
      options.level ?? LogLevel.DEBUG,
      options.namespace ?? 'App',
      options.transport ?? DEFAULT_TRANSPORT,
    ),
  };
}

export function injectLogger(namespace?: string): ILogger {
  const logger = inject<Logger>(LOGGER);
  return namespace ? logger.createSubnamespace(namespace) : logger;
}
