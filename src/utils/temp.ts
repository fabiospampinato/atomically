
/* IMPORT */

import * as crypto from 'crypto';
import * as fs from 'fs';
import {NOOP} from '../consts';
import {Disposer} from '../types';

/* TEMP */

//TODO: Maybe publish this as a standalone package

const Temp = {

  store: <Record<string, boolean>> {}, // filePath => purge

  get: ( filePath: string, purge: boolean = true ): [string, Disposer] => {

    const hash = crypto.randomBytes ( 3 ).toString ( 'hex' ), // 6 random hex characters
          timestamp = Date.now ().toString ().slice ( -10 ), // 10 precise timestamp digits
          prefix = 'tmp-',
          suffix = `.${prefix}${timestamp}${hash}`,
          tempPath = `${filePath}${suffix}`;

    if ( tempPath in Temp.store ) return Temp.get ( filePath ); // Collision found, try again

    Temp.store[tempPath] = purge;

    const disposer = () => delete Temp.store[tempPath];

    return [tempPath, disposer];

  },

  purge: ( filePath: string ): void => {

    delete Temp.store[filePath];

    fs.unlink ( filePath, NOOP );

  },

  purgeAll: (): void => {

    for ( const filePath in Temp.store ) {

      if ( !Temp.store[filePath] ) continue;

      delete Temp.store[filePath];

      try {

        fs.unlinkSync ( filePath );

      } catch {}

    }

  }

};

/* INIT */

process.on ( 'exit', Temp.purgeAll ); // Ensuring purgeable temp files are purged on exit

/* EXPORT */

export default Temp;
