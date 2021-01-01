import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TodoItem {
  readonly label: string;
  readonly isDone: boolean;
}

export interface TodoList {
  readonly label: string;
  readonly items: Readonly< TodoItem[] >;
}

@Injectable({
  providedIn: 'root'
})
export class TodolistService {
  private current: TodoList = {label: 'MIAGE', items: [] };
  private subj = new BehaviorSubject<TodoList>(this.current);
  readonly observable = this.subj.asObservable();
  private previous: TodoList[] = [];
  private futures: TodoList[] = [];

  constructor() {
    this.managePersistency();
    this.manageUndoRedo();
  }

  append(...labels: Readonly<string[]>): this {
    const L: TodoList = this.subj.getValue();
    this.subj.next( {
      ...L,
      items: [...L.items, ...labels.map( label => ({label, isDone: false}) ) ]
    } );
    return this;
  }

  remove(...items: Readonly<TodoItem[]>): this {
    const L = this.subj.getValue();
    const NL = {...L, items: L.items.filter(item => items.indexOf(item) === -1 ) };
    this.subj.next( NL );
    return this;
  }

  update(data: Partial<TodoItem>, ...items: Readonly<TodoItem[]>): this {
    if(data.label !== "") {
      const L = this.subj.getValue();
      const NL = {...L, items: L.items.map(item => items.indexOf(item) >= 0 ? {...item, ...data} : item ) };
      this.subj.next( NL );
    } else {
      this.remove(...items);
    }
    return this;
  }

  undo(): this {
    if (this.previous.length > 0) {
      this.subj.next( this.previous[this.previous.length - 1] );
    }
    return this;
  }

  redo(): this {
    if (this.futures.length > 0) {
      this.subj.next( this.futures[this.futures.length - 1] );
    }
    return this;
  }

  private managePersistency() {
    const str = localStorage.getItem('TDL_L3_MIAGE');
    if (str && str !== tdlToString(this.current) ) {
      this.subj.next( strToTdl(str) );
    }
  }

  private manageUndoRedo() {
    this.observable.subscribe( tdl => {
      if (tdl !== this.current) {
        localStorage.setItem('TDL_L3_MIAGE', tdlToString(tdl));
        // Undo-redo
        const indexInPrevious = this.previous.indexOf(tdl);
        if (indexInPrevious >= 0) { // Is it a previous version of the list ?
          const L = this.previous.splice(indexInPrevious, this.previous.length);
          this.futures.push(this.current, ...L.reverse());
          this.futures.pop(); // On enlève la liste courante
        } else {
          const indexInFutures = this.futures.indexOf(tdl);
          if (indexInFutures >= 0) { // Is it a future version of the list ?
            const L = this.futures.splice(indexInFutures, this.futures.length);
            this.previous.push(this.current, ...L.reverse());
            this.previous.pop();
          } else {
            // This is a new version
            if (this.futures.length) {
              const L = [...this.futures, this.current];
              const RL = [...L].reverse().map(TDL => ({...TDL}));
              RL.pop();
              this.previous.push(...RL, ...L);
            } else {
              this.previous.push(this.current);
            }
            this.futures = [];
          }
        }
        this.current = tdl;
      }
    } );
  }

}

export function tdlToString(tdl: TodoList): string {
  return JSON.stringify(tdl);
}

export function strToTdl(str: string): TodoList {
  return JSON.parse(str);
}
