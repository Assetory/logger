"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
/* eslint-disable no-underscore-dangle */
var events_1 = require("events");
var redis_1 = __importDefault(require("redis"));
var log4js_1 = __importDefault(require("log4js"));
var Logger = /** @class */ (function (_super) {
    __extends(Logger, _super);
    /**
     * @constructor
     * @example const logger = new Logger({});
     * @param  { any } options Options for constructor population.
     */
    function Logger(options) {
        var _this = _super.call(this) || this;
        _this.options = options || {};
        _this.serviceName = options.serviceName || 'default';
        _this._logger = log4js_1.default.getLogger(_this.serviceName);
        _this._logger.level = 'debug';
        if (options.redis instanceof redis_1.default.RedisClient) {
            _this.client = options.redis;
        }
        else {
            _this.client = redis_1.default.createClient(_this.options.connectOptions.port, _this.options.connectOptions.host, {
                auth_pass: _this.options.connectOptions.password,
                tls: {
                    servername: _this.options.connectOptions.servername,
                },
            });
            _this.client.on('error', function (error) {
                _this._logger.error('Database Error: ', error);
            });
            _this.client.on('connect', function () {
                _this._logger.info('logger connected');
            });
        }
        return _this;
    }
    /**
     * @method _formatContent
     * @private
     * @description Format content according to datatype
     * @param { any } content Content of log message.
     */
    Logger.prototype._formatContent = function (content) {
        if (content instanceof Error) {
            return content.message;
        }
        if (typeof content === 'object') {
            return JSON.stringify(content);
        }
        return content;
    };
    /**
     * @method _packContent
     * @private
     * @description Unifies content informations as JSON.
     * @param { any } content Content of log message.
     */
    Logger.prototype._packContent = function (content) {
        return JSON.stringify({
            content: content,
            timestamp: Math.round(Date.now() / 1000),
        });
    };
    /**
     * @method _log
     * @private
     * @description Creates a log message containing of type and content message.
     * @param { string } type Type of log message.
     * @param { any } content Content of log message.
     */
    Logger.prototype._log = function (type) {
        var _this = this;
        return function (content) {
            var formattedContent = _this._formatContent(content);
            var packedContent = _this._packContent(formattedContent);
            switch (type) {
                case 'fatal':
                    _this._logger.fatal(content);
                    break;
                case 'error':
                    _this._logger.error(content);
                    break;
                case 'warn':
                    _this._logger.warn(content);
                    break;
                case 'info':
                    _this._logger.info(content);
                    break;
                case 'debug':
                    _this._logger.debug(content);
                    break;
                case 'trace':
                    _this._logger.trace(content);
                    break;
                default:
                    _this._logger.info(content);
                    break;
            }
            _this.client.lpush(_this.serviceName + ":" + type, packedContent, function (err, result) {
                if (err) {
                    _this._logger.error(err);
                    if (_this.options.throwErrors) {
                        throw err;
                    }
                    _this.emit('error', err);
                    return;
                }
                if (_this.options.limitAmount && result > _this.options.limitAmount) {
                    _this.client.ltrim(_this.serviceName + ":" + type, 0, _this.options.limitAmount - 1, function (error) {
                        if (error) {
                            _this._logger.error(err);
                            if (_this.options.throwErrors) {
                                throw err;
                            }
                            _this.emit('error', err);
                        }
                    });
                }
            });
        };
    };
    /**
     * @method close
     * @description Closes redis database connection.
     * @example logger.close();
     * @returns { boolean }
     */
    Logger.prototype.close = function () {
        return this.client.quit();
    };
    /**
     * @method all
     * @description Returns all log messages of specified type.
     * @param { string } type Type of message.
     * @param { number= } from Indicator from where messages are shown.
     * @param { number= } end Indicator to where messages are shown.
     * @example logger.all('info');
     * @returns { IMessageType[] }
     */
    Logger.prototype.all = function (type, from, end) {
        var _this = this;
        if (from === void 0) { from = 0; }
        if (end === void 0) { end = -1; }
        return new Promise(function (resolve, reject) {
            _this.client.lrange(_this.serviceName + ":" + type, from, end, function (error, result) {
                if (error) {
                    _this._logger.error(error);
                    return reject(error);
                }
                return resolve(result.map(function (item) {
                    try {
                        var content = JSON.parse(item);
                        content.time = new Date(content.timestamp * 1000);
                        return content;
                    }
                    catch (e) {
                        return item;
                    }
                }));
            });
        });
    };
    /**
     * @method flush
     * @description Deletes all log messages in database.
     * @example logger.flush();
     * @returns { boolean }
     */
    Logger.prototype.flush = function () {
        return this.client.flushdb();
    };
    /**
     * @method fatal
     * @description Creates a message of type fatal.
     * @param { string } content Content of log message.
     * @example logger.fatal('Hello world!');
     * @returns { IMessageType }
     */
    Logger.prototype.fatal = function (content) {
        this._log('fatal')(content);
        return { type: 'fatal', message: content };
    };
    /**
     * @method error
     * @description Creates a message of type error.
     * @param { string } content Content of log message.
     * @example logger.error('Hello world!');
     * @returns { IMessageType }
     */
    Logger.prototype.error = function (content) {
        this._log('error')(content);
        return { type: 'fatal', message: content };
    };
    /**
     * @method warn
     * @description Creates a message of type warn.
     * @param { string } content Content of log message.
     * @example logger.warn('Hello world!');
     * @returns { IMessageType }
     */
    Logger.prototype.warn = function (content) {
        this._log('warn')(content);
        return { type: 'fatal', message: content };
    };
    /**
     * @method info
     * @description Creates a message of type info.
     * @param { string } content Content of log message.
     * @example logger.info('Hello world!');
     * @returns { IMessageType }
     */
    Logger.prototype.info = function (content) {
        this._log('info')(content);
        return { type: 'fatal', message: content };
    };
    /**
     * @method debug
     * @description Creates a message of type debug.
     * @param { string } content Content of log message.
     * @example logger.debug('Hello world!');
     * @returns { IMessageType }
     */
    Logger.prototype.debug = function (content) {
        this._log('debug')(content);
        return { type: 'fatal', message: content };
    };
    /**
     * @method trace
     * @description Creates a message of type trace.
     * @param { string } content Content of log message.
     * @example logger.trace('Hello world!');
     * @returns { IMessageType }
     */
    Logger.prototype.trace = function (content) {
        this._log('trace')(content);
        return { type: 'fatal', message: content };
    };
    return Logger;
}(events_1.EventEmitter));
exports.Logger = Logger;
