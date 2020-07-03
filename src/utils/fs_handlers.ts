
/* IMPORT */

import {IS_USER_ROOT} from '../consts';
import {Exception} from '../types';

/* FS HANDLERS */

const Handlers = {

  onChownError: ( error: Exception ): void => { //URL: https://github.com/isaacs/node-graceful-fs/blob/master/polyfills.js#L315-L342

    const {code} = error;

    if ( code === 'ENOSYS' ) return;

    if ( !IS_USER_ROOT && ( code === 'EINVAL' || code === 'EPERM' ) ) return;

    throw error;

  }

};

/* EXPORT */

export default Handlers;
