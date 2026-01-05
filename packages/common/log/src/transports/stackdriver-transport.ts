import { ILogObject, ILogTransport, LogLevel } from '../types';

/**
 * See https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
 */
type StackdriverSeverity =
  | 'DEFAULT'
  | 'DEBUG'
  | 'INFO'
  | 'NOTICE'
  | 'WARNING'
  | 'ERROR'
  | 'CRITICAL'
  | 'ALERT'
  | 'EMERGENCY';

/**
 * See https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry
 */
type StackdriverLogEntry = {
  severity: StackdriverSeverity;
  message?: string;
  ['logging.googleapis.com/labels']?: Record<string, string>;
} & Record<string, any>;

export class StackdriverTransport implements ILogTransport {
  push(logObject: ILogObject) {
    const { level, message, namespace, context } = logObject;
    try {
      const obj: StackdriverLogEntry = {
        severity: this.getSeverity(level),
        message,
        context,
        ['logging.googleapis.com/labels']: {
          namespace: namespace ?? 'default',
        },
      };
      console.log(JSON.stringify(obj));
    } catch (error) {
      console.error(
        JSON.stringify({
          severity: 'ERROR',
          message: 'Error serializing log object.',
          error,
        }),
      );
    }
  }

  /**
   * See https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
   */
  getSeverity(level: LogLevel): StackdriverSeverity {
    switch (level) {
      case LogLevel.DEBUG:
        return 'DEBUG';
      case LogLevel.ERROR:
        return 'ERROR';
      case LogLevel.INFO:
        return 'INFO';
      case LogLevel.WARN:
        return 'WARNING';
      case LogLevel.TRACE:
      default:
        return 'DEFAULT';
    }
  }
}
