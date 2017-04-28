`<md-footer>` is a comprehensive container intended to present a substantial amount of related content in a visually attractive and logically intuitive area. Although it is called "footer", it may be placed at any appropriate location on a device screen, either before or after other content.

Footers have three outer elements `<md-footer-top>`, `<md-footer-middle>`, and `<md-footer-bottom>`; and two inner elements `<md-footer-left>` and `<md-footer-right>`. There also exists unordered lists and collapsible lists as well.


| Element               | Description                                                                                                                |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------|
| `md-footer`           | Defines container as a Material Design footer component.                                                                   |
| `md-footer-top`       | Defines an outer container as a footer top section.                                                                        |
| `md-footer-middle`    | Defines an outer container as a footer middle section.                                                                     |
| `md-footer-bottom`    | Defines an outer container as a footer bottom section.                                                                     |
| `md-footer-left`      | Defines an inner container as a left section.                                                                              |
| `md-footer-right`     | Defines an inner container as a right section.                                                                             |
| `md-footer-ul`        | Defines an unordered list as a drop-down (vertical) list. Require `li` elements.                                           |
| `md-footer-dd`        | Defines container as a drop-down (vertical) content area. Takes string for attribute `heading` and `li` elemts as content. |
| `md-footer-logo`      | Defines a container as a styled section heading. Required in `md-footer-bottom` element.                                   |


### Example

```html
  <md-footer>
    <md-footer-middle>
      <md-footer-dd heading="Features">
        <li><a>About</a></li>
        <li><a>Terms</a></li>
        <li><a>Partners</a></li>
        <li><a>Updates</a></li>
      </md-footer-dd>
    </md-footer-middle>
    <md-footer-bottom>
      <md-footer-logo>Title</md-footer-logo>
      <md-footer-ul>
        <li><a>Help</a></li>
        <li><a>Privacy & Terms</a></li>
      </md-footer-ul>
    </md-footer-bottom>
  </md-footer>
```