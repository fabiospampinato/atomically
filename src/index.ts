
/* IMPORT */

import {DEFAULT_ENCODING, DEFAULT_MODE, DEFAULT_OPTIONS, DEFAULT_TIMEOUT_ASYNC, DEFAULT_TIMEOUT_SYNC, IS_POSIX} from './consts';
import FS from './utils/fs';
import Lang from './utils/lang';
import Scheduler from './utils/scheduler';
import Temp from './utils/temp';
import {Path, Data, Disposer, Options, Callback} from './types';

/* ATOMICALLY */

const writeFile = ( filePath: Path, data: Data, options?: Options | Callback, callback?: Callback ): Promise<void> => {

  if ( Lang.isFunction ( options ) ) return writeFile ( filePath, data, DEFAULT_OPTIONS, options );

  const promise = writeFileAsync ( filePath, data, options );

  if ( callback ) promise.then ( callback, callback );

  return promise;

};

const writeFileAsync = async ( filePath: Path, data: Data, options: Options = DEFAULT_OPTIONS ): Promise<void> => {

  if ( Lang.isString ( options ) ) return writeFileAsync ( filePath, data, { encoding: options } );

  const timeout = Date.now () + ( options.timeout || DEFAULT_TIMEOUT_ASYNC );

  let schedulerCustomDisposer: Disposer | null = null,
      schedulerDisposer: Disposer | null = null,
      tempDisposer: Disposer | null = null,
      tempPath: string | null = null,
      fd: number | null = null;

  try {

    if ( options.schedule ) schedulerCustomDisposer = await options.schedule ( filePath );

    schedulerDisposer = await Scheduler.schedule ( filePath );

    filePath = await FS.realpathAttempt ( filePath ) || filePath;

    [tempPath, tempDisposer] = Temp.get ( filePath, options.tmpCreate || Temp.create, !( options.tmpPurge === false ) );

    const useStatChown = IS_POSIX && Lang.isUndefined ( options.chown ),
          useStatMode = Lang.isUndefined ( options.mode );

    if ( useStatChown || useStatMode ) {

      const stat = await FS.statAttempt ( filePath );

      if ( stat ) {

        options = { ...options };

        if ( useStatChown ) options.chown = { uid: stat.uid, gid: stat.gid };

        if ( useStatMode ) options.mode = stat.mode;

      }

    }

    fd = await FS.openRetry ( timeout )( tempPath, 'w', options.mode || DEFAULT_MODE );

    if ( options.tmpCreated ) options.tmpCreated ( tempPath );

    if ( Lang.isString ( data ) ) {

      await FS.writeRetry ( timeout )( fd, data, 0, options.encoding || DEFAULT_ENCODING );

    } else if ( !Lang.isUndefined ( data ) ) {

      await FS.writeRetry ( timeout )( fd, data, 0, data.length, 0 );

    }

    if ( options.fsync !== false ) {

      if ( options.fsyncWait !== false ) {

        await FS.fsyncRetry ( timeout )( fd );

      } else {

        FS.fsyncAttempt ( fd );

      }

    }

    await FS.closeRetry ( timeout )( fd );

    fd = null;

    if ( options.chown ) await FS.chownAttempt ( tempPath, options.chown.uid, options.chown.gid );

    if ( options.mode ) await FS.chmodAttempt ( tempPath, options.mode );

    try {

      await FS.renameRetry ( timeout )( tempPath, filePath );

    } catch ( error ) {

      if ( error.code !== 'ENAMETOOLONG' ) throw error;

      await FS.renameRetry ( timeout )( tempPath, Temp.truncate ( filePath ) );

    }

    tempDisposer ();

    tempPath = null;

  } finally {

    if ( fd ) await FS.closeAttempt ( fd );

    if ( tempPath ) Temp.purge ( tempPath );

    if ( schedulerCustomDisposer ) schedulerCustomDisposer ();

    if ( schedulerDisposer ) schedulerDisposer ();

  }

};

const writeFileSync = ( filePath: Path, data: Data, options: Options = DEFAULT_OPTIONS ): void => {

  if ( Lang.isString ( options ) ) return writeFileSync ( filePath, data, { encoding: options } );

  const timeout = Date.now () + ( options.timeout || DEFAULT_TIMEOUT_SYNC );

  let tempDisposer: Disposer | null = null,
      tempPath: string | null = null,
      fd: number | null = null;

  try {

    filePath = FS.realpathSyncAttempt ( filePath ) || filePath;

    [tempPath, tempDisposer] = Temp.get ( filePath, options.tmpCreate || Temp.create, !( options.tmpPurge === false ) );

    const useStatChown = IS_POSIX && Lang.isUndefined ( options.chown ),
          useStatMode = Lang.isUndefined ( options.mode );

    if ( useStatChown || useStatMode ) {

      const stat = FS.statSyncAttempt ( filePath );

      if ( stat ) {

        options = { ...options };

        if ( useStatChown ) options.chown = { uid: stat.uid, gid: stat.gid };

        if ( useStatMode ) options.mode = stat.mode;

      }

    }

    fd = FS.openSyncRetry ( timeout )( tempPath, 'w', options.mode || DEFAULT_MODE );

    if ( options.tmpCreated ) options.tmpCreated ( tempPath );

    if ( Lang.isString ( data ) ) {

      FS.writeSyncRetry ( timeout )( fd, data, 0, options.encoding || DEFAULT_ENCODING );

    } else if ( !Lang.isUndefined ( data ) ) {

      FS.writeSyncRetry ( timeout )( fd, data, 0, data.length, 0 );

    }

    if ( options.fsync !== false ) {

      if ( options.fsyncWait !== false ) {

        FS.fsyncSyncRetry ( timeout )( fd );

      } else {

        FS.fsyncAttempt ( fd );

      }

    }

    FS.closeSyncRetry ( timeout )( fd );

    fd = null;

    if ( options.chown ) FS.chownSyncAttempt ( tempPath, options.chown.uid, options.chown.gid );

    if ( options.mode ) FS.chmodSyncAttempt ( tempPath, options.mode );

    try {

      FS.renameSyncRetry ( timeout )( tempPath, filePath );

    } catch ( error ) {

      if ( error.code !== 'ENAMETOOLONG' ) throw error;

      FS.renameSyncRetry ( timeout )( tempPath, Temp.truncate ( filePath ) );

    }

    tempDisposer ();

    tempPath = null;

  } finally {

    if ( fd ) FS.closeSyncAttempt ( fd );

    if ( tempPath ) Temp.purge ( tempPath );

  }

};

/* EXPORT */

export {writeFile, writeFileSync};
