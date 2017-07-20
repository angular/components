`<md-expansion-panel>` provides a way to show and hide content, by collapsing and expanding a 
view with animation.

<!-- example(expansion-overview) -->

### Expansion panel content

Each expansion panel has a header section (mandatory) and an actions (optional) sections.

#### Header

The header section is always visible at the top of the component and contains a `<md-panel-title>`
 and a description `<md-panel-description>` subsections.

The `<md-panel-title>` subsection is shown in the beginning of the header, followed by the 
`<md-panel-description>` subsection, which is supposed to contain a summary of what's in the
expansion content.

By default, the expansion panel header has a toggle icon at the right edge, pointing up when 
the panel is expanded and down when it's collapsed. The toogle icon can be hidden by setting the
input property `toggleHide` to `true`. 

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

#### Actions

The actions section is optional and fixed at the bottom, visible only when the expansion is in its
expanded state.

```html
<md-expansion-panel>
  <md-expansion-panel-header>
    This is the expansion title
  </md-expansion-panel-header>

  <p>...</p>

  <md-action-row>
    <button md-button>Click me</button>
  </md-action-row>
</md-expansion-panel>
```

### Accordion

Multiple expansion panels can be combined into an accordion. The `multi="true"` input allows the
expansions state to be set independently of each other. When `multi="false"` (default) just one
panel can be expanded at a given time:

```html
<md-accordion>
  
  <md-expansion-panel>
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
