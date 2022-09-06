import { Injectable } from '@angular/core';

import { NGXLogger }  from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class CommonLoggerService {


  constructor(private logger: NGXLogger) { }

  
  /**
   * Prints the requested log to the console for debugging purposes.
   * @param logType Represents the type of log to be printed to console. Can be
   * * trace
   * * info
   * * warn
   * * error
   * @param content The main content to be printed.
   * @param debug String where 'true' prints more log messages than just info. Anything
   * else will display info messages.
   * @param debugLevel The minimum log level to be printed. If no logLevel is given,
   * default is `info` which is automatically printed.
   */
  print(logType: string, content: any, debug?: string, debugLevel?: string): void {

    switch(logType) {
      case 'info':
        this.logger[logType](content);
        break;
      case 'trace':
        if (debug === 'true' && debugLevel === 'trace') {
          this.logger[logType](content);
        }
        break;
      case 'warn':
        if (debug === 'true' && (debugLevel === 'warn' || debugLevel === 'trace')) {
          this.logger[logType](content);
        }
        break;
      case 'error':
        this.logger[logType](content);
        break;
      default:
        this.logger.fatal("Log type not supported. Must be 'trace', 'info', 'warn', 'error'.");
    }
  }

}
