
/* IMPORT */

import * as fs from 'fs';
import {promisify} from 'util';
import {attemptifyAsync, attemptifySync} from './attemptify';
import Handlers from './fs_handlers';
import {retryifyAsync, retryifySync} from './retryify';

/* FS */

const FS = {

  chmodAttempt: attemptifyAsync ( promisify ( fs.chmod ), Handlers.onChangeError ),
  chownAttempt: attemptifyAsync ( promisify ( fs.chown ), Handlers.onChangeError ),
  closeAttempt: attemptifyAsync ( promisify ( fs.close ) ),
  fsyncAttempt: attemptifyAsync ( promisify ( fs.fsync ) ),
  realpathAttempt: attemptifyAsync ( promisify ( fs.realpath ) ),
  statAttempt: attemptifyAsync ( promisify ( fs.stat ) ),
  unlinkAttempt: attemptifyAsync ( promisify ( fs.unlink ) ),

  closeRetry: retryifyAsync ( promisify ( fs.close ), Handlers.isRetriableError ),
  fsyncRetry: retryifyAsync ( promisify ( fs.fsync ), Handlers.isRetriableError ),
  openRetry: retryifyAsync ( promisify ( fs.open ), Handlers.isRetriableError ),
  renameRetry: retryifyAsync ( promisify ( fs.rename ), Handlers.isRetriableError ),
  writeRetry: retryifyAsync ( promisify ( fs.write ), Handlers.isRetriableError ),

  chmodSyncAttempt: attemptifySync ( fs.chmodSync, Handlers.onChangeError ),
  chownSyncAttempt: attemptifySync ( fs.chownSync, Handlers.onChangeError ),
  closeSyncAttempt: attemptifySync ( fs.closeSync ),
  realpathSyncAttempt: attemptifySync ( fs.realpathSync ),
  statSyncAttempt: attemptifySync ( fs.statSync ),
  unlinkSyncAttempt: attemptifySync ( fs.unlinkSync ),

  closeSyncRetry: retryifySync ( fs.closeSync, Handlers.isRetriableError ),
  fsyncSyncRetry: retryifySync ( fs.fsyncSync, Handlers.isRetriableError ),
  openSyncRetry: retryifySync ( fs.openSync, Handlers.isRetriableError ),
  renameSyncRetry: retryifySync ( fs.renameSync, Handlers.isRetriableError ),
  writeSyncRetry: retryifySync ( fs.writeSync, Handlers.isRetriableError )

};

/* EXPORT */

export default FS;
