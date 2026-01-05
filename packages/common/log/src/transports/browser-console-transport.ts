import { DateTime } from 'luxon';
import { ILogObject, ILogTransport, LogLevel } from '../types';

const dateStyle = 'font-weight: normal; color: grey;';
const namespaceStyle = 'font-weight: bold;';
const messageStyle = null;

export class BrowserConsoleTransport implements ILogTransport {
  push(logObject: ILogObject) {
    const { level, message, namespace, context, error } = logObject;
    const date = DateTime.now();
    const formatted = `%c[${date.toFormat('yyyy-MM-dd HH:mm:ss ZZZ')}] %c${String(
      namespace,
    )}: %c${String(message)}`;

    let logFn = console.log;
    if (level === LogLevel.ERROR) logFn = console.error;
    else if (level === LogLevel.WARN) logFn = console.warn;
    else if (level === LogLevel.INFO) logFn = console.info;
    else if (level === LogLevel.DEBUG) logFn = console.debug;
    else if (level === LogLevel.TRACE) logFn = console.debug;

    logFn(formatted, dateStyle, namespaceStyle, messageStyle, context, error);
  }
}
