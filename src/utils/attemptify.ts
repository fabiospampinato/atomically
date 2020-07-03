
/* IMPORT */

import {NOOP} from '../consts';
import {Exception} from '../types';

/* ATTEMPTIFY */

//TODO: Maybe publish this as a standalone package
//TODO: The types here aren't exactly correct

const attemptifyAsync = <FN extends ( ...args: any[] ) => Promise<any>> ( fn: FN, handler: ( error: Exception ) => any = NOOP ): FN => {

  return function () {

    return fn.apply ( undefined, arguments ).catch ( handler || NOOP );

  } as FN;

};

const attemptifySync = <FN extends ( ...args: any[] ) => any> ( fn: FN, handler: ( error: Exception ) => any = NOOP ): FN => {

  return function () {

    try {

      return fn.apply ( undefined, arguments );

    } catch ( error ) {

      return handler ( error );

    }

  } as FN;

};

/* EXPORT */

export {attemptifyAsync, attemptifySync};
