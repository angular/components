Angular Material expansion provides a way to show and hide lightweight content, by collapsing and expanding a view with a nice animation. The `expanded` input allows to choose among the collapsed or expanded the state of the expansion. 

Each expansion has a header section and an action section. The header section is always visible at the top of the component and contains one title and one description subsections. The action section is shown at the bottom of the expansion in the expanded state and is intended to contains action elements right aligned, like buttons and links.

When grouped by an `<md-accordion>` element, the expansions can be used for the creation of flows, as it brings up the possibility to expand one view at a time.

<!-- example(tabs-overview) -->

### Events

The `closed` and `opened` output events are emitted when the expansion is collapsed/expanded.

The `focusChange` output event is emitted when the user puts focus on any of the tab labels in
the header, usually through keyboard navigation.

### Headers section

By default, each expension header has a toogle sign at the right edge, pointing up when the expansion is expanded and down when it's collapsed. The toogle icon can be hiden setting the `toogleHide` to `true`. 

The `<md-panel-title>` subsecion is shown in the begining of the header, followed by the `<md-panel-description>` subsection, which is supposed to have a sumary of what's in the expansion content.

```html
<md-expansion-panel>
  
</md-expansion-panel>
```

For more complex labels, add a template with the `md-tab-label` directive inside the `md-tab`.

```html
<md-tab-group>
  <md-tab>
    <ng-template md-tab-label>
      The <em>best</em> pasta
    </ng-template>
    <h1>Best pasta restaurants</h1>
    <p>...</p>
  </md-tab>
  <md-tab>
    <ng-template md-tab-label>
      <md-icon>thumb_down</md-icon> The worst sushi
    </ng-template>
    <h1>Terrible sushi restaurants</h1>
    <p>...</p>
  </md-tab>
</md-tab-group>
```

### Dynamic Height

By default, the tab group will not change its height to the height of the currently active tab. To
change this, set the `dynamicHeight` input to true. The tab body will animate its height according
 to the height of the active tab.

