import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/Rx';
import {MdTreeDataSource, MdTreeNodes, TreeData} from '@angular/material';

export interface Character extends TreeData {
  name: string;
  movie: string;
  villan?: boolean;
  icon?: string;
  children: Character[];
  hasChildren: boolean;
}

export const CHARACTERS = [
  {id: 'goofy', name: 'Goofy', movie: 'A Goofy Movie', icon: 'check', children: [
    {id: 'jane', name: 'Jane', movie: 'Tarzan'},
    {id: 'pumbaa', name: 'Pumbaa', movie: 'The Lion King'},
    {id: 'mulan', name: 'Mulan', movie: 'Mulan', children: [
      {id: 'thumper', name: 'Thumper', movie: 'Bambi', icon: 'favorite'},
      {id: 'madhatter', name: 'Mad Hatter', movie: 'Alice in Wonderland', children: [
        {id: 'jafar', name: 'Jafar', movie: 'Aladdin', villan: true},
        {id: 'lilo', name: 'Lilo', movie: 'Lilo and Stitch'},
      ]},
    ]}
  ]},
  {id: 'tinkerbell', name: 'Tinker Bell', icon: 'favorite', movie: 'Peter Pan', children: null},
  {id: 'kronk', name: 'Kronk', movie: 'The Emperor\'s New Groove', villan: true},
  {id: 'gusgus', name: 'Gus Gus', movie: 'Cinderella'},
  {id: 'jiminy', name: 'Jiminy Cricket', movie: 'Pinocchio'},
  {id: 'tigger', name: 'Tigger', movie: 'Winnie the Pooh'},
  {id: 'gaston', name: 'Gaston', movie: 'Beauty and the Beast', villan: true},
  {id: 'sebastian', name: 'Sebastian', movie: 'The Little Mermaid'}
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

  getChildren(node: Character): Promise<Character[]> {
    return new Promise((resolve, reject) => {
      console.log(`get children`);
      setTimeout(() => {
        resolve([{name: 'Dumbo', movie: 'Dumbo'},
          {name: 'Jafar', movie: 'Aladdin', villan: true},
          {name: 'Lilo', movie: 'Lilo and Stitch'}]);
      }, 2000);

    });

  }

}