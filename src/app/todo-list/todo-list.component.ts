import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { TodoItem, TodoList, TodolistService } from '../todolist.service';

interface TodoAll extends TodoList {
  remaining: number;
  filter: FctFilter;
}

type FctFilter = (item: TodoItem) => boolean;

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent implements OnInit {
  readonly observable: Observable<TodoAll>;
  readonly filterAll: FctFilter = () => true;
  readonly filterCompleted: FctFilter = item =>  item.isDone;
  readonly filterRemaining: FctFilter = item => !item.isDone;
  private filterSubj = new BehaviorSubject<FctFilter>( this.filterAll );

  constructor(private TDLS: TodolistService) {
    this.observable = combineLatest([this.TDLS.observable, this.filterSubj]).pipe(
      map( ([tdl, f]) => ({
        ...tdl,
        remaining: tdl.items.reduce( (nb, item) => item.isDone ? nb : nb + 1, 0),
        filter: f
      }) )
    );
  }

  ngOnInit(): void {
  }

  get filter(): FctFilter {return this.filterSubj.value;}
  set filter(f: FctFilter) {this.filterSubj.next(f);}

  append(label: string): void {
    this.TDLS.append(label);
  }

  remove(item: TodoItem): void {
    this.TDLS.remove(item);
  }

  removeItems(items: TodoItem[]): void {
    this.TDLS.remove(...items);
  }

  updateItem(u: Partial<TodoItem>, item: TodoItem): void {
    this.TDLS.update(u, item);
  }

  updateItems(u: Partial<TodoItem>, items: Readonly<TodoItem[]>): void {
    this.TDLS.update(u, ...items);
  }

  trackById(index: number, item: TodoItem): number {
    return item.id;
  }

}
