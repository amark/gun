import { Observable } from 'rxjs/Observable';

export function rx$(node): Observable<any> {
    return Observable.fromEventPattern(
        // needed to clone the object because of #355
        h => node.on(v => h({ ...v })),
        (_, s) => s.off()
    );
}