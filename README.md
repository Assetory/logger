# logger
A redis logger, written in typescript

## install

```bash
npm install assetory-logger
```

## usage

Import Logger from module

```ts
import { Logger } from 'assetory-logger';
```

Initialize new Logger instance with options

| key | description |
| --- | ----------- |
| serviceName | Name of the service, to distinguish logs from other services. |


```js
const logger = new Logger({
    serviceName: process.env.SERVICE_NAME,
    limitAmount: 3,
    throwErrors: true,
    connectionOptions:
    {
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
        servername: process.env.REDIS_SERVERNAME,
        password: process.env.REDIS_PASSWORD,
    },
});
```

Create log message of one of the following types:
- fatal
- error
- warn
- info
- debug
- trace

**example:**

```js
logger.info('log message');
```

