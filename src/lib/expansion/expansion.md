Angular Material expansion provides a way to show and hide lightweight content, by collapsing and expanding a view with a nice animation. The `expanded` input allows to choose among the collapsed or expanded state. 

Each expansion has a header and an action sections. The header section is always visible at the top of the component and contains a title and a description subsections. The action section is fixed at the bottom, being visible when the expansion is in expanded state

When grouped by an `<md-accordion>` element, the expansions can be used for the creation of flows, as it brings up the possibility to expand one view at a time.

<!-- example(tabs-overview) -->

### Events

The `closed` and `opened` output events are emitted when the expansion is collapsed/expanded.

### Headers section

By default, the expansion header has a toogle sign at the right edge, pointing up when the expansion is expanded and down when it's collapsed. The toogle icon can be hiden setting the `toogleHide` to `true`. 

The `<md-panel-title>` subsecion is shown in the begining of the header, followed by the `<md-panel-description>` subsection, which is supposed to have a sumary of what's in the expansion content.

```html
<md-expansion-panel>
  <md-expansion-panel-header>
    This is the expansion title
  </md-expansion-panel-header>

  <md-action-row>
    <button md-button>Action</button>
  </md-action-row>

  This the expansion content

</md-expansion-panel>
```

For more complex headers, use the `<md-panel-title>` and `<md-panel-description>` header selectors:

```html
<md-expansion-panel>
  <md-expansion-panel-header>
    <md-panel-title>
      This is the expansion title
    </md-panel-title>
    <md-panel-description>
      This is a summary of the content
    </md-panel-description>
  </md-expansion-panel-header>

  <p>...</p>

</md-expansion-panel>
```

### Accordion

It's possible to group expansions in a fancy way. The `multi="true"` input allows the expansions state to be set independently of each other. When `multi="false"` (default) just one expansion can be expanded at a given time:

```html
<md-accordion>
  
  <md-expansion-panel multi="false">
    <md-expansion-panel-header>
        This is the expansion 1 title
    </md-expansion-panel-header>
    
    This the expansion 1 content
    
  </md-expansion-panel>
  
  <md-expansion-panel>
    <md-expansion-panel-header>
        This is the expansion 2 title
    </md-expansion-panel-header>
    
    This the expansion 2 content
    
  </md-expansion-panel>

</md-accordion>
```

