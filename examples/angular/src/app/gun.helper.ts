import { Observable } from 'rxjs/Observable';
import { Gun } from 'gun/gun';

export function on$(node): Observable<any> {
    return Observable.fromEventPattern(
        // note: passing directly node.on doesn't seem to work...
        h => node.on(v => h(v)),
        // TODO this is incorrect
        (_, s) => s.off()
    );
}

export function val$(node): Observable<any> {
    return new Observable(o => node.val(v => {
        o.next(v);
        o.complete();
    }));
}
