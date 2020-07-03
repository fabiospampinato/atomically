
/* IMPORT */

import * as crypto from 'crypto';
import {Disposer} from '../types';
import FS from './fs';

/* TEMP */

//TODO: Maybe publish this as a standalone package

const Temp = {

  store: <Record<string, boolean>> {}, // filePath => purge

  create: ( filePath: string ): string => {

    const hash = crypto.randomBytes ( 3 ).toString ( 'hex' ), // 6 random hex characters
          timestamp = Date.now ().toString ().slice ( -10 ), // 10 precise timestamp digits
          prefix = 'tmp-',
          suffix = `.${prefix}${timestamp}${hash}`,
          tempPath = `${filePath}${suffix}`;

    return tempPath;

  },

  get: ( filePath: string, creator: ( filePath: string ) => string, purge: boolean = true ): [string, Disposer] => {

    const tempPath = creator ( filePath );

    if ( tempPath in Temp.store ) return Temp.get ( filePath, creator, purge ); // Collision found, try again

    Temp.store[tempPath] = purge;

    const disposer = () => delete Temp.store[tempPath];

    return [tempPath, disposer];

  },

  purge: ( filePath: string ): void => {

    if ( !Temp.store[filePath] ) return;

    delete Temp.store[filePath];

    FS.unlinkAttempt ( filePath );

  },

  purgeSync: ( filePath: string ): void => {

    if ( !Temp.store[filePath] ) return;

    delete Temp.store[filePath];

    FS.unlinkSyncAttempt ( filePath );

  },

  purgeSyncAll: (): void => {

    for ( const filePath in Temp.store ) {

      Temp.purgeSync ( filePath );

    }

  }

};

/* INIT */

process.on ( 'exit', Temp.purgeSyncAll ); // Ensuring purgeable temp files are purged on exit

/* EXPORT */

export default Temp;
