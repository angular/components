# mdTextarea

Textareas are also the input component of Material 2.



## Notes
* The `<md-textarea>` component fully support two-way binding of `ngModel`, as if it was a normal `<textarea>`.



## Hint Labels

Hint labels are the labels that shows the underline. You can have up to two hint labels; one on the `start` of the line (left in an LTR language, right in RTL), or one on the `end`.

You specify a hint-label in one of two ways; either using the `hintLabel` attribute, or using an `<md-hint>` directive in the `<md-textarea>`, which takes an `align` attribute containing the side. The attribute version is assumed to be at the `start`.

Specifying a side twice will result in an exception during initialization.

#### Example

A simple character counter can be made like the following:

```html
<md-textarea placeholder="Character count (100 max)" maxlength="100" class="demo-full-width" #characterCountHintExample>
  <md-hint align="end">{{characterCountHintExample.characterCount}} / 100</md-hint>
</md-textarea>
```



## Divider Color

The divider (line under the `<md-textarea>` content) color can be changed by using the `dividerColor` attribute. A value of `primary` is the default and will correspond to your theme primary color. Alternatively, you can specify `accent` or `warn`.



## Labelling

You can label the `<md-textarea>` as you would a regular `<textarea>`.



## Rows & Cols

You can apply rows and cols attribute to `<md-textarea>` as you would to a regular `<textarea>`.