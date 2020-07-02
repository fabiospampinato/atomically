
/* IMPORT */

import {Exception} from '../types';

/* ATTEMPTIFY */

const attemptify = <FN extends ( ...args: any[] ) => any> ( fn: FN, handler?: ( error: Exception ) => any ): FN => {

  return function attemptWrapper () {

    try {

      return fn.apply ( undefined, arguments );

    } catch ( error ) {

      if ( handler ) handler ( error );

    }

  } as FN;

};

/* EXPORT */

export default attemptify;
