
/* IMPORT */

import {LIMIT_FILES_DESCRIPTORS} from '../consts';

/* RETRYIFY QUEUE */

const RetryfyQueue = {

  queue: new Set (),

  schedule: ( id: any, limit: number = LIMIT_FILES_DESCRIPTORS ): Promise<Function> => {

    const add = () => RetryfyQueue.queue.add ( id ),
          remove = () => RetryfyQueue.queue.delete ( id );

    return new Promise ( resolve => {

      const check = () => {

        if ( RetryfyQueue.queue.size >= limit ) return setTimeout ( check, 150 );

        add ();
        resolve ( remove );

      };

      check ();

    });

  }

};

/* EXPORT */

export default RetryfyQueue;
