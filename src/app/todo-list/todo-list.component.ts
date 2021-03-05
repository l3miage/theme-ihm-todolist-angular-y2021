import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { TodoItem, TodoList, TodolistService } from '../todolist.service';

interface TodoAll extends TodoList {
  remaining: number;
}

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent implements OnInit {
  readonly observable: Observable<TodoAll>;

  constructor(private TDLS: TodolistService) {
    this.observable = this.TDLS.observable.pipe(
      map( tdl => ({...tdl,
                    remaining: tdl.items.reduce( (nb, item) => item.isDone ? nb : nb + 1, 0)
                  })
      )
    );
  }

  ngOnInit(): void {
  }

  append(label: string): void {
    this.TDLS.append(label);
  }

  remove(item: TodoItem): void {
    this.TDLS.remove(item);
  }

  updateItem(u: Partial<TodoItem>, item: TodoItem): void {
    this.TDLS.update(u, item);
  }

  updateItems(u: Partial<TodoItem>, items: Readonly<TodoItem[]>): void {
    this.TDLS.update(u, ...items);
  }
}
