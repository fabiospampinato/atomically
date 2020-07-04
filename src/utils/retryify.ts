
/* IMPORT */

import {Exception, FN} from '../types';

/* RETRYIFY */

//TODO: Maybe publish this as a standalone package
//TODO: Implement a more sophisticaed, less intensive, retry strategy

const retryifyAsync = <T extends FN> ( fn: T, isRetriableError: FN<[Exception], boolean | void> ): FN<[number], T> => {

  return function ( timestamp: number ) {

    return function attempt () {

      return fn.apply ( undefined, arguments ).catch ( error => {

        if ( Date.now () > timestamp ) throw error;

        if ( isRetriableError ( error ) ) return attempt.apply ( undefined, arguments );

        throw error;

      });

    } as T;

  };

};

const retryifySync = <T extends FN> ( fn: T, isRetriableError: FN<[Exception], boolean | void> ): FN<[number], T> => {

  return function ( timestamp: number ) {

    return function attempt () {

      try {

        return fn.apply ( undefined, arguments );

      } catch ( error ) {

        if ( Date.now () > timestamp ) throw error;

        if ( isRetriableError ( error ) ) return attempt.apply ( undefined, arguments );

        throw error;

      }

    } as T;

  };

};

/* EXPORT */

export {retryifyAsync, retryifySync};
