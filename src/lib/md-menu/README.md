# md2-menu

Native Angular2 Material Menu directive

## Installation
`npm install --save md2-menu`

## API

Example:
 
HTML sample code
 ```html
//simple menu
<div md2-menu>
  <button class="btn btn-primary" md2-menu-open>Default Menu <span class="caret"></span></button>
  //add directional class to open menu from specific direction i.e. class="md2-menu-content right top"
  <ul class="md2-menu-content">
    <li><a class="md2-menu-item">Badman</a></li>
    <li><a class="md2-menu-item">Sadman</a></li>
    <li><a class="md2-menu-item">Lieman</a></li>
  </ul>
</div>

//Multi level menu
<div md2-menu>
  <button class="btn btn-primary" md2-menu-open>Default Menu <span class="caret"></span></button>
  <ul class="md2-menu-content">
    <li><a class="md2-menu-item">Badman</a></li>
    <li><a class="md2-menu-item">Sadman</a></li>
    <li><a class="md2-menu-item">Lieman</a></li>
    <li md2-menu>
      // add 'md2-menu-not-closable' attribute directive to open next level menu.
      <a class="md2-menu-item" md2-menu-not-closable md2-menu-open>2nd Level Menu <span class="caret"></span></a>
      <ul class="md2-menu-content">
        <li><a class="md2-menu-item">Badman</a></li>
        <li><a class="md2-menu-item">Sadman</a></li>
        <li><a class="md2-menu-item">Lieman</a></li>
      </ul>
    </li>
  </ul>
</div>
 ```

TS sample code
 ```ts
//app-module.ts

import {Md2MenuModule} from 'md2-menu/menu';

@NgModule({
  imports: [
    Md2MenuModule,
  ],
  declarations: [
    ...
  ]  
})

//component.ts
...

@Component({
    selector: "..."
})

export class ... {
    
    ...
    
}
 ```

Add Css in your code
```css
[md2-menu] { position: relative; display: inline-block; }
[md2-menu] .md2-menu-content { position: absolute; top: 0; left: 0; display: inline-block; background: #fff; list-style: none; min-width: 100px; padding: 8px 0; margin: 0; -moz-transform: scale(0); -ms-transform: scale(0); -o-transform: scale(0); -webkit-transform: scale(0); transform: scale(0); -moz-transform-origin: left top; -ms-transform-origin: left top; -o-transform-origin: left top; -webkit-transform-origin: left top; transform-origin: left top; -moz-transition: all .4s linear; -o-transition: all .4s linear; -webkit-transition: all .4s linear; transition: all .4s linear; -moz-transition-duration: 0.2s; -o-transition-duration: 0.2s; -webkit-transition-duration: 0.2s; transition-duration: 0.2s; box-shadow: 0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12); z-index: 1; border-radius: 2px; }
[md2-menu] .md2-menu-content.right { left: auto; right: 0; -moz-transform-origin: right top; -ms-transform-origin: right top; -o-transform-origin: right top; -webkit-transform-origin: right top; transform-origin: right top; }
[md2-menu] .md2-menu-content.top { top: auto; bottom: 0; -moz-transform-origin: left bottom; -ms-transform-origin: left bottom; -o-transform-origin: left bottom; -webkit-transform-origin: left bottom; transform-origin: left bottom; }
[md2-menu] .md2-menu-content.top.right { -moz-transform-origin: right bottom; -ms-transform-origin: right bottom; -o-transform-origin: right bottom; -webkit-transform-origin: right bottom; transform-origin: right bottom; }
[md2-menu].open > .md2-menu-content { -moz-transform: scale(1); -ms-transform: scale(1); -o-transform: scale(1); -webkit-transform: scale(1); transform: scale(1); }
[md2-menu] li { position: relative; display: block; }
[md2-menu] .md2-menu-item { position: relative; display: block; padding: 0 16px; line-height: 36px; color: rgba(0,0,0,.87); cursor: pointer; text-decoration: none; white-space: nowrap; -moz-transition: 0.3s; -o-transition: 0.3s; -webkit-transition: 0.3s; transition: 0.3s; }
[md2-menu] .md2-menu-item:hover { background-color: rgba(158,158,158,0.2); }
```

### Directives

  - `md2-menu` - Main directive.
  - `md2-menu-open` - On click to open menu using this directive.
  - `md2-menu-not-closable` - Prevent on click to close the menu using this directive.
