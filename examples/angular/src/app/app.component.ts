import { Component, OnInit } from '@angular/core';
import { $rx } from 'gun-edge/edge/observable/rx';
import Gun from 'gun/gun';
import { Observable } from 'rxjs/Observable';
import { GunDb } from 'app/gun.service';
import { omit } from 'underscore';

import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  newTodo = '';

  todos = this.db.gun.get('todos');
  todos$: Observable<string[]> = $rx(this.todos)
    .map(o => omit(o, '_'));

  constructor(private db: GunDb) { }

  ngOnInit() { }

  add() {
    if (this.newTodo) {
      this.todos.path(Gun.text.random()).put(this.newTodo);
      this.newTodo = '';
    }
  }

  delete(key: string) {
    this.todos.path(key).put(null);
  }
}
