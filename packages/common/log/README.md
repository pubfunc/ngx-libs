# @pubfunc/ngx-common-log

A flexible logging library for Angular applications with support for multiple transports, log levels, namespaces, and dependency injection.

## Features

- **Transport system**: Pluggable transports (Browser Console, Stackdriver, custom)
- **Namespaces**: Organize logs with hierarchical namespaces
- **Angular DI support**: Use dependency injection or static logging
- **Context support**: Attach structured data and error objects to logs

## Installation

```bash
npm install @pubfunc/ngx-common-log
```

## Usage

### Static Logger

Configure the static logger for application-wide use:

```ts
import { Log, LogLevel, BrowserConsoleTransport } from '@pubfunc/ngx-common-log';

Log.configure({
  level: LogLevel.DEBUG,
  transport: new BrowserConsoleTransport(),
  namespace: 'MyApp',
});
```

Use the static logger:

```ts
import { Log } from '@pubfunc/ngx-common-log';

Log.trace('Detailed trace information');
Log.debug('Debug information', { context: { userId: 123 } });
Log.info('Application started');
Log.warn('Deprecated API used', { context: { api: 'oldEndpoint' } });
Log.error('An error occurred', {
  error: e,
  context: {
    id: 123,
    action: 'saveUser',
  },
});
```

### Dependency Injection

Provide the logger in your Angular application:

```ts
import { provideLogger, LogLevel, BrowserConsoleTransport } from '@pubfunc/ngx-common-log';

bootstrapApplication(AppComponent, {
  providers: [
    provideLogger({
      level: LogLevel.DEBUG,
      transport: new BrowserConsoleTransport(),
      namespace: 'MyApp',
    }),
    // ... other providers
  ],
});
```

Inject and use the logger in components or services:

```ts
import { Component, inject } from '@angular/core';
import { injectLogger } from '@pubfunc/ngx-common-log';

@Component({
  selector: 'app-my-component',
  template: '...',
})
export class MyComponent {
  private log = injectLogger('MyComponent');

  ngOnInit() {
    this.log.info('Component initialized');
  }

  handleError(error: Error) {
    this.log.error('Failed to load data', {
      error,
      context: { component: 'MyComponent' },
    });
  }
}
```

### Log Levels

The library supports five log levels (from most verbose to least):

- `LogLevel.TRACE` - Very detailed information for debugging
- `LogLevel.DEBUG` - Debug information for development
- `LogLevel.INFO` - General informational messages
- `LogLevel.WARN` - Warning messages for potentially harmful situations
- `LogLevel.ERROR` - Error messages for error events

Logs below the configured level are filtered out.

### Transports

#### Browser Console Transport

Formats logs with styled output for browser console:

```ts
import { BrowserConsoleTransport } from '@pubfunc/ngx-common-log';

const transport = new BrowserConsoleTransport();
```

#### Stackdriver Transport

Formats logs as JSON for Google Cloud Logging:

```ts
import { StackdriverTransport } from '@pubfunc/ngx-common-log';

const transport = new StackdriverTransport();
```

#### Custom Transport

Create your own transport by implementing `ILogTransport`:

```ts
import { ILogTransport, ILogObject } from '@pubfunc/ngx-common-log';

class CustomTransport implements ILogTransport {
  push(logObject: ILogObject) {
    // Your custom logging logic
    // e.g., send to external service, write to file, etc.
  }
}
```

### Namespaces

Namespaces help organize logs hierarchically. When using dependency injection, you can create subnamespaces:

```ts
export class UserService {
  private log = injectLogger('UserService');

  getUser(id: string) {
    const userLog = this.log.createSubnamespace('getUser');
    userLog.debug('Fetching user', { id });
    // Logs will appear as: MyApp/UserService/getUser
  }
}
```

### Context and Error Objects

Attach structured context data and error objects to any log:

```ts
this.log.error('Payment processing failed', {
  error: paymentError,
  context: {
    userId: '123',
    orderId: '456',
    amount: 99.99,
    paymentMethod: 'credit_card',
  },
});
```
