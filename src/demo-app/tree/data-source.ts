import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/Rx';
import {MdTreeDataSource, MdTreeNodes} from '@angular/material';

export interface Character {
  name: string;
  movie: string;
  villan?: boolean;
}

export const CHARACTERS = [
  {name: 'Goofy', movie: 'A Goofy Movie', icon: 'check', items: [
    {name: 'Jane', movie: 'Tarzan'},
    {name: 'Pumbaa', movie: 'The Lion King'},
    {name: 'Mulan', movie: 'Mulan'}
  ]},
  {name: 'Tinker Bell', icon: 'favorite', movie: 'Peter Pan'},
  {name: 'Thumper', movie: 'Bambi', icon: 'favorite'},
  {name: 'Mad Hatter', movie: 'Alice in Wonderland'},
  {name: 'Kronk', movie: 'The Emperor\'s New Groove', villan: true},
  {name: 'Gus Gus', movie: 'Cinderella'},
  {name: 'Jiminy Cricket', movie: 'Pinocchio'},
  {name: 'Tigger', movie: 'Winnie the Pooh'},
  {name: 'Gaston', movie: 'Beauty and the Beast', villan: true},
  {name: 'Dumbo', movie: 'Dumbo'},
  {name: 'Jafar', movie: 'Aladdin', villan: true},
  {name: 'Lilo', movie: 'Lilo and Stitch'},
  {name: 'Sebastian', movie: 'The Little Mermaid'}
];

export class TreeDemoDataSource implements MdTreeDataSource<Character> {
  private readonly nodeSubject =
    new BehaviorSubject<MdTreeNodes<Character>>({nodes: [], nodeCount: 0});

  constructor() {
    this.loadTableRows();
  }

  /**
   * Returns an observable the table watches in order to update rows.
   * @override
   */
  getNodes(): Observable<MdTreeNodes<Character>> {
    console.log(`get nodes`)
    return this.nodeSubject.asObservable();
  }

  /**
   * Updates the table based on the table settings and filters.
   */
  loadTableRows() {
    this.getRowsFromServer().subscribe(filteredRows => {
      const nodes = {nodes: filteredRows, nodeCount: filteredRows.length};
      console.log(`nodes ${nodes}`);
      this.nodeSubject.next(nodes);
    });
  }

  /**
   * Simulates getting a list of filtered rows from the server with a delay.
   */
  getRowsFromServer(): Observable<Character[]> {
    const filteredRows = CHARACTERS;

    return Observable.of(filteredRows);
  }

}