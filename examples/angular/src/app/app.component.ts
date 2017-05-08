import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import Gun from 'gun/gun';

import { GunDb } from 'app/gun.service';
import { on$ } from 'app/gun.helper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  newTodo = '';

  todos = this.db.gun.get('todos');
  todos$: Observable<string[]> = on$(this.todos);

  todosSub: Subscription;

  constructor(private db: GunDb) { }

  ngOnInit() { }

  add() {
    if (this.newTodo) {
      this.todos.get(Gun.text.random()).put(this.newTodo);
      this.newTodo = '';
    }
  }

  delete(key: string) {
    this.todos.get(key).put(null);
  }

  sub() {
    this.todosSub = this.todos$.subscribe(v => console.log(v));
  }

  unsub() {
    this.todosSub.unsubscribe();
  }
}
