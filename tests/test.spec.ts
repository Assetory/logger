import { expect } from 'chai';
import { Logger } from '../src/index';

let logger : Logger;

const options = {
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
};

describe('testing Logger', () =>
{
    it('should not be initialized yet', () =>
    {
        expect(logger).to.be.undefined;
    });

    it('should instantiate a new Logger', () =>
    {
        logger = new Logger(options);

        expect(logger).instanceOf(Logger);
    });

    it('should be connected to database', () =>
    {
        setTimeout(async () =>
        {
            const connection = logger.client.connected;
            expect(connection).to.equal(true);
        }, 1000);
    });

    it('should send a message of type "fatal"', () =>
    {
        setTimeout(async () =>
        {
            const message = logger.fatal('test');
            expect(message.type).to.equal('fatal');
        }, 1000);
    });

    it('should send a message of type "error"', () =>
    {
        setTimeout(async () =>
        {
            const message = logger.error('test');
            expect(message.type).to.equal('error');
        }, 1000);
    });

    it('should send a message of type "warn"', () =>
    {
        setTimeout(async () =>
        {
            const message = logger.warn('test');
            expect(message.type).to.equal('warn');
        }, 1000);
    });

    it('should send a message of type "info"', () =>
    {
        setTimeout(async () =>
        {
            const message = logger.info('test');
            expect(message.type).to.equal('info');
        }, 1000);
    });

    it('should send a message of type "debug"', () =>
    {
        setTimeout(async () =>
        {
            const message = logger.debug('test');
            expect(message.type).to.equal('debug');
        }, 1000);
    });

    it('should send a message of type "trace"', () =>
    {
        setTimeout(async () =>
        {
            const message = logger.trace('test');
            expect(message.type).to.equal('trace');
        }, 1000);
    });
    
    it('should get all messages of type', () =>
    {
        setTimeout(async () =>
        {
            expect(await logger.all('info')).to.not.equal(null);
        }, 1000);
    });

    it('should delete all logger messages connected to service', () =>
    {
        setTimeout(async () =>
        {
            expect(logger.flush()).to.equal(true);
        }, 1000);
    });

    it('should close connection to logger database', () =>
    {
        setTimeout(async () =>
        {
            expect(logger.close()).to.equal(true);
        }, 1000);
    });
});
