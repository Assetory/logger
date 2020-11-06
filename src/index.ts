/* eslint-disable no-underscore-dangle */
import { EventEmitter } from 'events';
import redis, { RedisClient } from 'redis';
import log4js from 'log4js';
import { IMessageType } from './IMessageType';

export class Logger extends EventEmitter
{
    private options : any;
    client : RedisClient;
    private _logger : log4js.Logger;
    private serviceName : string;

    /**
     * @constructor
     * @example const logger = new Logger({});
     * @param  { any } options Options for constructor population.
     */
    constructor(options : any)
    {
        super();
        
        this.options = options || {};
        this.serviceName = options.serviceName || 'default';
        this._logger = log4js.getLogger(this.serviceName);

        this._logger.level = 'debug';
        
        if (options.redis instanceof redis.RedisClient)
        {
            this.client = options.redis;
        }
        else
        {
            this.client = redis.createClient(
                this.options.connectOptions.port,
                this.options.connectOptions.host,
                {
                    auth_pass: this.options.connectOptions.password,
                    tls:
                    {
                        servername: this.options.connectOptions.servername,
                    },
                }
            );

            this.client.on('error', (error) =>
            {
                this._logger.error('Database Error: ', error);
            });

            this.client.on('connect', () =>
            {
                this._logger.info('logger connected');
            });
        }
    }

    /**
     * @method _formatContent
     * @private
     * @description Format content according to datatype
     * @param { any } content Content of log message.
     */
    private _formatContent (content : any)
    {
        if(content instanceof Error)
        {
            return content.message;
        }
        if(typeof content === 'object')
        {
            return JSON.stringify(content);
        }

        return content;
    }

    /**
     * @method _packContent
     * @private
     * @description Unifies content informations as JSON.
     * @param { any } content Content of log message.
     */
    private _packContent (content : any)
    {
        return JSON.stringify({
            content: content,
            timestamp: Math.round(Date.now() / 1000),
        });
    }

    /**
     * @method _log
     * @private 
     * @description Creates a log message containing of type and content message.
     * @param { string } type Type of log message.
     * @param { any } content Content of log message.
     */
    private _log(type : string)
    {
        return (content : any) =>
        {
            const formattedContent = this._formatContent(content);
            const packedContent = this._packContent(formattedContent);

            switch (type) {
                case 'fatal':
                    this._logger.fatal(content);
                    break;
                case 'error':
                    this._logger.error(content);
                    break;
                case 'warn':
                    this._logger.warn(content);
                    break;
                case 'info':
                    this._logger.info(content);
                    break;
                case 'debug':
                    this._logger.debug(content);
                    break;
                case 'trace':
                    this._logger.trace(content);
                    break;
                default:
                    this._logger.info(content);
                    break;
            }

            this.client.lpush(`${this.serviceName}:${type}`, packedContent, (err, result) =>
            {
                if (err)
                {
                    this._logger.error(err);

                    if (this.options.throwErrors)
                    {
                        throw err;
                    }

                    this.emit('error', err);

                    return;
                }
                if (this.options.limitAmount && result > this.options.limitAmount)
                {
                    this.client.ltrim(`${this.serviceName}:${type}`, 0, this.options.limitAmount - 1, (error) =>
                    {
                        if (error)
                        {
                            this._logger.error(err);
                            
                            if (this.options.throwErrors)
                            {
                                throw err;
                            }

                            this.emit('error', err);
                        }
                    });
                }
            });
        };
    }

    /**
     * @method close
     * @description Closes redis database connection.
     * @example logger.close();
     * @returns { boolean }
     */
    close() : boolean
    {
        return this.client.quit();
    }

    /**
     * @method all
     * @description Returns all log messages of specified type.
     * @param { string } type Type of message.
     * @param { number= } from Indicator from where messages are shown.
     * @param { number= } end Indicator to where messages are shown.
     * @example logger.all('info');
     * @returns { IMessageType[] }
     */
    all(type : string, from : number = 0, end : number = -1)
    {
        return new Promise((resolve, reject) =>
        {
            this.client.lrange(`${this.serviceName}:${type}`, from, end, (error, result) =>
            {
                if (error)
                {
                    this._logger.error(error);
                    
                    return reject(error);
                }

                return resolve(result.map((item) =>
                {
                    try
                    {
                        const content = JSON.parse(item);

                        content.time = new Date(content.timestamp * 1000);

                        return content;
                    }
                    catch (e)
                    {
                        return item;
                    }
                }));
            });
        });
    }

    /**
     * @method flush
     * @description Deletes all log messages in database.
     * @example logger.flush();
     * @returns { boolean }
     */
    flush() : boolean
    {
        return this.client.flushdb();
    }

    /**
     * @method fatal
     * @description Creates a message of type fatal.
     * @param { string } content Content of log message.
     * @example logger.fatal('Hello world!');
     * @returns { IMessageType }
     */
    fatal(content : string) : IMessageType
    {
        this._log('fatal')(content);

        return { type: 'fatal', message: content };
    }

    /**
     * @method error
     * @description Creates a message of type error.
     * @param { string } content Content of log message.
     * @example logger.error('Hello world!');
     * @returns { IMessageType }
     */
    error(content : string) : IMessageType
    {
        this._log('error')(content);

        return { type: 'fatal', message: content };
    }

    /**
     * @method warn
     * @description Creates a message of type warn.
     * @param { string } content Content of log message.
     * @example logger.warn('Hello world!');
     * @returns { IMessageType }
     */
    warn(content : string) : IMessageType
    {
        this._log('warn')(content);

        return { type: 'fatal', message: content };
    }

    /**
     * @method info
     * @description Creates a message of type info.
     * @param { string } content Content of log message.
     * @example logger.info('Hello world!');
     * @returns { IMessageType }
     */
    info(content : string) : IMessageType
    {
        this._log('info')(content);

        return { type: 'fatal', message: content };
    }

    /**
     * @method debug
     * @description Creates a message of type debug.
     * @param { string } content Content of log message.
     * @example logger.debug('Hello world!');
     * @returns { IMessageType }
     */
    debug(content : string) : IMessageType
    {
        this._log('debug')(content);

        return { type: 'fatal', message: content };
    }

    /**
     * @method trace
     * @description Creates a message of type trace.
     * @param { string } content Content of log message.
     * @example logger.trace('Hello world!');
     * @returns { IMessageType }
     */
    trace(content : string) : IMessageType
    {
        this._log('trace')(content);

        return { type: 'fatal', message: content };
    }
}
