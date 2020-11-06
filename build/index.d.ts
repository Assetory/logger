/// <reference types="node" />
import { EventEmitter } from 'events';
import { RedisClient } from 'redis';
import { IMessageType } from './IMessageType';
export declare class Logger extends EventEmitter {
    private options;
    client: RedisClient;
    private _logger;
    private serviceName;
    /**
     * @constructor
     * @example const logger = new Logger({});
     * @param  { any } options Options for constructor population.
     */
    constructor(options: any);
    /**
     * @method _formatContent
     * @private
     * @description Format content according to datatype
     * @param { any } content Content of log message.
     */
    private _formatContent;
    /**
     * @method _packContent
     * @private
     * @description Unifies content informations as JSON.
     * @param { any } content Content of log message.
     */
    private _packContent;
    /**
     * @method _log
     * @private
     * @description Creates a log message containing of type and content message.
     * @param { string } type Type of log message.
     * @param { any } content Content of log message.
     */
    private _log;
    /**
     * @method close
     * @description Closes redis database connection.
     * @example logger.close();
     * @returns { boolean }
     */
    close(): boolean;
    /**
     * @method all
     * @description Returns all log messages of specified type.
     * @param { string } type Type of message.
     * @param { number= } from Indicator from where messages are shown.
     * @param { number= } end Indicator to where messages are shown.
     * @example logger.all('info');
     * @returns { IMessageType[] }
     */
    all(type: string, from?: number, end?: number): Promise<unknown>;
    /**
     * @method flush
     * @description Deletes all log messages in database.
     * @example logger.flush();
     * @returns { boolean }
     */
    flush(): boolean;
    /**
     * @method fatal
     * @description Creates a message of type fatal.
     * @param { string } content Content of log message.
     * @example logger.fatal('Hello world!');
     * @returns { IMessageType }
     */
    fatal(content: string): IMessageType;
    /**
     * @method error
     * @description Creates a message of type error.
     * @param { string } content Content of log message.
     * @example logger.error('Hello world!');
     * @returns { IMessageType }
     */
    error(content: string): IMessageType;
    /**
     * @method warn
     * @description Creates a message of type warn.
     * @param { string } content Content of log message.
     * @example logger.warn('Hello world!');
     * @returns { IMessageType }
     */
    warn(content: string): IMessageType;
    /**
     * @method info
     * @description Creates a message of type info.
     * @param { string } content Content of log message.
     * @example logger.info('Hello world!');
     * @returns { IMessageType }
     */
    info(content: string): IMessageType;
    /**
     * @method debug
     * @description Creates a message of type debug.
     * @param { string } content Content of log message.
     * @example logger.debug('Hello world!');
     * @returns { IMessageType }
     */
    debug(content: string): IMessageType;
    /**
     * @method trace
     * @description Creates a message of type trace.
     * @param { string } content Content of log message.
     * @example logger.trace('Hello world!');
     * @returns { IMessageType }
     */
    trace(content: string): IMessageType;
}
