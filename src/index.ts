
/* IMPORT */

import {DEFAULT_ENCODING, DEFAULT_MODE, IS_POSIX} from './consts';
import FS from './utils/fs';
import Lang from './utils/lang';
import Scheduler from './utils/scheduler';
import Temp from './utils/temp';
import {Path, Data, Disposer, Options, Callback} from './types';

/* ATOMICALLY */

const writeFile = ( filePath: Path, data: Data, options?: Options | Callback, callback?: Callback ): Promise<void> => {

  if ( Lang.isFunction ( options ) ) return writeFile ( filePath, data, {}, options );

  const promise = writeFileAsync ( filePath, data, options );

  if ( callback ) promise.then ( callback, callback );

  return promise;

};

const writeFileAsync = async ( filePath: Path, data: Data, options: Options = {} ): Promise<void> => {

  if ( Lang.isString ( options ) ) return writeFileAsync ( filePath, data, { encoding: options } );

  let schedulerDisposer: Disposer | null = null,
      tempDisposer: Disposer | null = null,
      tempPath: string | null = null,
      fd: number | null = null;

  try {

    schedulerDisposer = await Scheduler.schedule ( filePath );

    filePath = await FS.realpathAttempt ( filePath ) || filePath;

    [tempPath, tempDisposer] = Temp.get ( filePath );

    const useStatChown = IS_POSIX && Lang.isUndefined ( options.chown ),
          useStatMode = Lang.isUndefined ( options.mode );

    if ( useStatChown || useStatMode ) {

      const stat = await FS.statAttempt ( filePath );

      if ( stat ) {

        if ( useStatChown ) options.chown = { uid: stat.uid, gid: stat.gid };

        if ( useStatMode ) options.mode = stat.mode;

      }

    }

    fd = await FS.open ( tempPath, 'w', options.mode || DEFAULT_MODE );

    if ( options.tmpCreated ) options.tmpCreated ( tempPath );

    if ( Lang.isString ( data ) ) {

      await FS.write ( fd, data, 0, options.encoding || DEFAULT_ENCODING );

    } else if ( !Lang.isUndefined ( data ) ) {

      await FS.write ( fd, data, 0, data.length, 0 );

    }

    if ( options.fsync !== false ) {

      if ( options.fsyncWait !== false ) {

        await FS.fsync ( fd );

      } else {

        FS.fsyncAttempt ( fd );

      }

    }

    await FS.close ( fd );

    fd = null;

    if ( options.chown ) await FS.chownAttempt ( tempPath, options.chown.uid, options.chown.gid );

    if ( options.mode ) await FS.chmodAttempt ( tempPath, options.mode );

    await FS.rename ( tempPath, filePath );

    tempDisposer ();

    tempPath = null;

  } finally {

    if ( fd ) await FS.closeAttempt ( fd );

    if ( tempPath ) Temp.purge ( tempPath );

    if ( schedulerDisposer ) schedulerDisposer ();

  }

};

const writeFileSync = ( filePath: Path, data: Data, options: Options = {} ): void => {

  if ( Lang.isString ( options ) ) return writeFileSync ( filePath, data, { encoding: options } );

  let tempDisposer: Disposer | null = null,
      tempPath: string | null = null,
      fd: number | null = null;

  try {

    filePath = FS.realpathSyncAttempt ( filePath ) || filePath;

    [tempPath, tempDisposer] = Temp.get ( filePath );

    const useStatChown = IS_POSIX && Lang.isUndefined ( options.chown ),
          useStatMode = Lang.isUndefined ( options.mode );

    if ( useStatChown || useStatMode ) {

      const stat = FS.statSyncAttempt ( filePath );

      if ( stat ) {

        if ( useStatChown ) options.chown = { uid: stat.uid, gid: stat.gid };

        if ( useStatMode ) options.mode = stat.mode;

      }

    }

    fd = FS.openSync ( tempPath, 'w', options.mode || DEFAULT_MODE );

    if ( options.tmpCreated ) options.tmpCreated ( tempPath );

    if ( Lang.isString ( data ) ) {

      FS.writeSync ( fd, data, 0, options.encoding || DEFAULT_ENCODING );

    } else if ( !Lang.isUndefined ( data ) ) {

      FS.writeSync ( fd, data, 0, data.length, 0 );

    }

    if ( options.fsync !== false ) {

      if ( options.fsyncWait !== false ) {

        FS.fsyncSync ( fd );

      } else {

        FS.fsyncAttempt ( fd );

      }

    }

    FS.closeSync ( fd );

    fd = null;

    if ( options.chown ) FS.chownSyncAttempt ( tempPath, options.chown.uid, options.chown.gid );

    if ( options.mode ) FS.chmodSyncAttempt ( tempPath, options.mode );

    FS.renameSync ( tempPath, filePath );

    tempDisposer ();

    tempPath = null;

  } finally {

    if ( fd ) FS.closeSyncAttempt ( fd );

    if ( tempPath ) Temp.purge ( tempPath );

  }

};

/* EXPORT */

export {writeFile, writeFileSync};
