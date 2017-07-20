`<md-expansion-panel>` provides a way to show and hide lightweight content, by collapsing and expanding a view with a nice animation.

<!-- example(expansion-overview) -->

The `expanded` input allows to choose among the collapsed or expanded state. 

Each expansion panel has a header and an action sections. The header section is always visible at the top of the component and contains a title and a description subsections. The action section is fixed at the bottom, being visible when the expansion is in expanded state.

When grouped by an `<md-accordion>` element the expansion panels can be used to create ordered views or flows, as it brings up the possibility to expand one view at a time.

### Events

The `closed` and `opened` output events are emitted when the expansion is collapsed/expanded.

### Headers section

By default, the expansion panel header has a toogle sign at the right edge, pointing up when the panel is expanded and down when it's collapsed. The toogle icon can be hiden by setting `toogleHide` to `true`. 

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

Multiple expansion panels can be combined into an accordion. The `multi="true"` input allows the expansions state to be set independently of each other. When `multi="false"` (default) just one panel can be expanded at a given time:

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

