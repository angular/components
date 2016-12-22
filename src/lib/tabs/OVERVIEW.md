The Angular Material tab group helps organize content into separate views where one view is
visible at one time. Each tab has a label at the top of the group in the tab header and the active
tab's label is designated with an animated ink bar. When the list of tab labels exceeds the width
of the header, pagination controls appear to allow the user to scroll to their desired tab.

The active tab is set using the `selectedIndex` input or through user interaction by selecting a
tab label on the header.

<!-- example(tab-overview) -->

### Events

The `focusChange` output event is emitted when the user puts focus on any of the tab labels in
the header, usually through keyboard navigation. 

The `selectChange` output event is emitted when the active tab changes.  

### Labels

If the tab's label can simply be displayed as text, then the simple tab-group API can be used.

```html
<md-tab-group>
  <md-tab label="One">
    <h1>Some tab content</h1>
    <p>...</p>
  </md-tab>
  <md-tab label="Two">
    <h1>Some more tab content</h1>
    <p>...</p>
  </md-tab>
</md-tab-group>
```

For more complex labels, add a template inside the `md-tab` with the `md-tab-label` directive.

```html
<md-tab-group>
  <md-tab>
    <template md-tab-label>
      The <em>best</em> pasta
    </template>
    <h1>Best pasta restaurants</h1>
    <p>...</p>
  </md-tab>
  <md-tab>
    <template md-tab-label>
      <md-icon>thumb_down</md-icon> The worst sushi
    </template>
    <h1>Terrible sushi restaurants</h1>
    <p>...</p>
  </md-tab>
</md-tab-group>
```

### Dynamic Height

By default, the tab group will not change its height to the height of the currently active tab. To
change this, set the `dynamicHeight` input to true. The tab body will animate its height according
 to the height of the active tab.