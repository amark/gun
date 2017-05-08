import { Observable } from 'rxjs/Observable';
import { Gun } from 'gun/gun';
import { pick } from 'underscore';

export function on$(node, cleanup = true): Observable<any> {
    return Observable.fromEventPattern(
        h => {
            // there is no way to off() an on() until at least one value is trigerred
            // so that we can access the event listener to off() it
            const signal = { stop: false };
            node.on((data, key, at, ev) => {
                if (signal.stop) {
                    ev.off();
                } else {
                    // modifying data directly does not seem to work...
                    h(cleanup ? pick(data, (v, k, o) => v !== null && k !== '_') : data);
                }
            });
            return signal;
        },
        (h, signal) => { signal.stop = true; }
    );
}

export function val$(node): Observable<any> {
    return new Observable(o => node.val(v => {
        o.next(v);
        o.complete();
    }));
}
