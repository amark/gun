import { Component, OnInit } from '@angular/core';
import { $rx } from 'gun-edge/edge/observable/rx';
import Gun from 'gun/gun';
import { Observable } from 'rxjs/Observable';

import { GunDb } from 'app/app.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  newTodo = '';

  todos = this.db.gun.get('todos');
  todos$: Observable<string[]> = $rx(this.todos)
    .startWith([])
    .map(o => Object.keys(o).filter(k => typeof o[k] === 'string').map(k => ({ key: k, val: (o[k] as string) })));

  constructor(private db: GunDb) { }

  ngOnInit() {
    $rx(this.todos).subscribe(x => console.log(x));
  }

  add() {
    if (this.newTodo) {
      this.todos.path(Gun.text.random()).put(this.newTodo);
      this.newTodo = '';
    }
  }
}
