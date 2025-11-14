<style>
.docs-markdown pre {
  margin: 24px;
}
</style>

# Theming your components

Angular Material provides two approaches to styling custom components to match the application's
theme:

- **CSS variables** included by `mat.theme()`. These are prefixed with `--mat-sys` and can be used
  in your component stylesheets to match the theme and design for your application.
- **Utility classes** included by `mat.system-classes()`. These utility classes wrap the CSS variables
  and allow you to apply theme styles directly from your component templates.

Both approaches are valid ways to ensure your application is consistently designed alongside Angular
Material's components. Also, by using the system tokens for applying color to your application,
you will automatically support both light and dark mode versions that can be set using the 
`color-scheme` CSS property.

This guide will focus on showing the implementation for the utility classes as a means to show
both the available classes and the underlying system token CSS variables used.

If your application is based on the older Material Design 2 APIs with theme configs, you can still
use these CSS variables and classes. See
the [Material Design 2 Support](#material-design-2-support) section below to learn how to enable
them.

## Colors

Material Design uses color to create accessible, personal color schemes that communicate your
product's hierarchy, state, and brand. See Material
Design's [Color Roles](https://m3.material.io/styles/color/roles) page to learn more
about its use and purpose.

Using the system tokens makes it easy to match the same color scheme of your application's theme. It
also makes it easy to ensure your application can correctly handle both light and dark mode
automatically.

<details>
  <summary>Expand to view all available color system tokens</summary>

```css
/* Primary */
--mat-sys-primary
--mat-sys-on-primary
--mat-sys-primary-container
--mat-sys-on-primary-container
--mat-sys-primary-fixed
--mat-sys-on-primary-fixed
--mat-sys-on-primary-fixed-variant
--mat-sys-primary-fixed-dim
--mat-sys-inverse-primary

/* Secondary */
--mat-sys-secondary
--mat-sys-on-secondary
--mat-sys-secondary-container
--mat-sys-on-secondary-container
--mat-sys-secondary-fixed
--mat-sys-on-secondary-fixed
--mat-sys-on-secondary-fixed-variant
--mat-sys-secondary-fixed-dim

/* Tertiary */
--mat-sys-tertiary
--mat-sys-on-tertiary
--mat-sys-tertiary-container
--mat-sys-on-tertiary-container
--mat-sys-tertiary-fixed
--mat-sys-on-tertiary-fixed
--mat-sys-on-tertiary-fixed-variant
--mat-sys-tertiary-fixed-dim

/* Error */
--mat-sys-error
--mat-sys-on-error
--mat-sys-error-container
--mat-sys-on-error-container

/* Surface */
--mat-sys-surface
--mat-sys-on-surface
--mat-sys-on-surface-variant
--mat-sys-surface-bright
--mat-sys-surface-container
--mat-sys-surface-container-high
--mat-sys-surface-container-highest
--mat-sys-surface-container-low
--mat-sys-surface-container-lowest
--mat-sys-surface-dim
--mat-sys-surface-tint
--mat-sys-surface-variant
--mat-sys-inverse-surface
--mat-sys-inverse-on-surface

/* Miscellaneous */
--mat-sys-background
--mat-sys-on-background
--mat-sys-neutral-variant20
--mat-sys-neutral10
--mat-sys-outline
--mat-sys-outline-variant
--mat-sys-scrim
--mat-sys-shadow
```
</details>

### Background

<h4>Primary</h4>

A primary background is useful for key components across the UI, such as buttons that have greater
importance on the page. In Angular Material, this is used for the selected date in a datepicker, the
handle of a slider, and the background of a checkbox.

Text and icons should use the `on-primary` system color token ensure good contrast and
accessibility (see [Text](#text) below).

<pre class="mat-bg-primary mat-text-on-primary">
.mat-bg-primary {
  background-color: var(--mat-sys-primary);
}
</pre>

A primary container color background is useful for filling components that should stand out on a
surface. In Angular Material, this is used for the container of a floating action button.

<pre class="mat-bg-primary-container mat-text-on-primary-container">
.mat-bg-primary-container {
  background-color: var(--mat-sys-primary-container);
}
</pre>

<h4>Secondary</h4>

A secondary background is useful for less prominent components in the UI that have a different color
scheme than the primary.

Text and icons should use the `on-secondary` system color token ensure good contrast and
accessibility (see [Text](#text) below).

<pre class="mat-bg-secondary mat-text-on-secondary">
.mat-bg-secondary {
  background-color: var(--mat-sys-secondary);
}
</pre>

A secondary container color background is useful for components that need less emphasis than
secondary, such as filter chips. In Angular Material, this is used for selected items in a list and
the container of a tonal button.

<pre class="mat-bg-secondary-container mat-text-on-secondary-container">
.mat-bg-secondary-container {
  background-color: var(--mat-sys-secondary-container);
}
</pre>

<h4>Error</h4>

An error background is useful for indicating an error state, such as an invalid text field, or for
the background of an important notification. In Angular Material, this is used for the background of
a badge.

Text and icons should use the `on-error` system color token ensure good contrast and accessibility (
see [Text](#text) below).

<pre class="mat-bg-error mat-text-on-error">
.mat-bg-error {
  background-color: var(--mat-sys-error);
}
</pre>

An error container color background is useful for components that need less emphasis than error,
such as a container for error text.

<pre class="mat-bg-error-container mat-text-on-error-container">
.mat-bg-error-container {
  background-color: var(--mat-sys-error-container);
}
</pre>

<h4>Surfaces</h4>

When using surface backgrounds, text and icons should use the `on-surface` or `on-surface-variant`
system color tokens ensure good contrast and accessibility (see [Text](#text) below).

A surface background is useful for general surfaces of components. In Angular Material, this is used
for the background of many components, like tables, dialogs, menus, and toolbars.

<pre class="mat-bg-surface mat-text-on-surface">
.mat-bg-surface {
  background-color: var(--mat-sys-surface);
}
</pre>

A surface variant background is useful for surfaces that need to stand out from the main surface
color. In Angular Material, this is used for the background of a filled form field and the track of
a progress bar.

<pre class="mat-bg-surface-variant mat-text-on-surface">
.mat-bg-surface-variant {
  background-color: var(--mat-sys-surface-variant);
}
</pre>

The "highest" surface container background is useful for surfaces that need the most emphasis
against the main surface color. In Angular Material, this is used for the background of a filled
card.

<pre class="mat-bg-surface-container-highest mat-text-on-surface">
.mat-bg-surface-container-highest {
  background-color: var(--mat-sys-surface-container-highest);
}
</pre>

A "high" surface container background is useful for surfaces that need more emphasis against the
main surface color. In Angular Material, this is used for the background of a datepicker.

<pre class="mat-bg-surface-container-high mat-text-on-surface">
.mat-bg-surface-container-high {
  background-color: var(--mat-sys-surface-container-high);
}
</pre>

A surface container background is useful for surfaces that need to stand out from the main surface
color. In Angular Material, this is used for the background of a menu.

<pre class="mat-bg-surface-container mat-text-on-surface">
.mat-bg-surface-container {
  background-color: var(--mat-sys-surface-container);
}
</pre>

A "low" surface container background is useful for surfaces that need less emphasis against the main
surface color. In Angular Material, this is used for the background of a bottom sheet.

<pre class="mat-bg-surface-container-low mat-text-on-surface">
.mat-bg-surface-container-low {
  background-color: var(--mat-sys-surface-container-low);
}
</pre>

The "lowest" surface container background is useful for surfaces that need the least emphasis
against the main surface color.

<pre class="mat-bg-surface-container-lowest mat-text-on-surface">
.mat-bg-surface-container-lowest {
  background-color: var(--mat-sys-surface-container-lowest);
}
</pre>

An inverse surface color background is useful for making elements stand out against the default
color scheme. It is good for temporary notifications that appear above your content. In Angular
Material, this is used for the background of a snackbar and a tooltip.

When using the inverse surface background, text and icons should use the `inverse-on-surface` system
color token ensure good contrast and accessibility (see [Text](#text) below).

<pre class="mat-bg-inverse-surface mat-text-inverse-on-surface">
.mat-bg-inverse-surface {
  background-color: var(--mat-sys-inverse-surface);
}
</pre>

<h4>Disabled</h4>

A disabled color background is useful for disabled components. In Angular Material, this is used for
components generally filled with the primary color but are currently disabled.

In Angular Material, text and icons often use a 38% color mix of the surface color to strongly
convey
the disabled state. This is described with the `mat-text-disabled` class in [Text](#text)).

<pre class="mat-bg-disabled mat-text-disabled">
.mat-bg-disabled {
  background-color: color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent);
}
</pre>

### Text

<h4>Primary</h4>

Use the primary color for text that needs to stand out. In Angular Material, this is used for the
text of a text button and the selected tab label.

<pre>
.mat-text-primary {
  color: var(--mat-sys-primary);
}
</pre>

<pre class="mat-text-primary mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

<h4>Secondary</h4>

Use the secondary color for text that needs to stand out apart from the main theme color.

<pre>
.mat-text-secondary {
  color: var(--mat-sys-secondary);
}
</pre>

<pre class="mat-text-secondary mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

<h4>Error</h4>

Use the error color for text that indicates an issue or warning, such as validation messages. In
Angular Material, this is used for the error text in a form field.

<pre>
.mat-text-error {
  color: var(--mat-sys-error);
}
</pre>

<pre class="mat-text-error mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

<h4>Disabled</h4>

Use the disabled text color for elements that are disabled on either the disabled or surface
background.

<pre>
.mat-text-disabled {
  color: color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent);
}
</pre>

<pre class="mat-text-disabled mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

<h4>On Surface Variant</h4>

Use the on-surface-variant color for text that should have a lower emphasis than the surrounding
text. This can include subheading, captions, and hint text.

<pre>
.mat-text-on-surface-variant {
  color: var(--mat-sys-on-surface-variant);
}
</pre>

<pre class="mat-text-on-surface-variant mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

<h4>On Primary</h4>

Use the on-primary color for text and icons appearing on primary backgrounds to ensure good contrast
and accessibility.

<pre>
.mat-text-on-primary {
  color: var(--mat-sys-on-primary);
}
</pre>

<pre class="mat-text-on-primary mat-bg-primary mat-corner-sm mat-border">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

<h4>On Primary Container</h4>

Use the on-primary-container color for text and icons appearing on primary-container backgrounds to
ensure good contrast and accessibility.

<pre>
.mat-text-on-primary-container {
  color: var(--mat-sys-on-primary-container);
}
</pre>

<pre class="mat-text-on-primary-container mat-bg-primary-container mat-corner-sm mat-border">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

<h4>On Secondary</h4>

Use the on-secondary color for text and icons appearing on secondary backgrounds to ensure good
contrast and accessibility.

<pre>
.mat-text-on-secondary {
  color: var(--mat-sys-on-secondary);
}
</pre>

<pre class="mat-text-on-secondary mat-bg-secondary mat-corner-sm mat-border">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

<h4>On Secondary Container</h4>

Use the on-secondary-container color for text that contrasts well against a secondary-container
background.

<pre>
.mat-text-on-secondary-container {
  color: var(--mat-sys-on-secondary-container);
}
</pre>

<pre class="mat-text-on-secondary-container mat-bg-secondary-container mat-corner-sm mat-border">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

<h4>On Error</h4>

Use the on-error color for text that contrasts well against an error background.

<pre>
.mat-text-on-error {
  color: var(--mat-sys-on-error);
}
</pre>

<pre class="mat-text-on-error mat-bg-error mat-corner-sm mat-border">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

<h4>On Error Container</h4>

Use the on-error-container color for text that contrasts well against an error-container background.

<pre>
.mat-text-on-error-container {
  color: var(--mat-sys-on-error-container);
}
</pre>

<pre class="mat-text-on-error-container mat-bg-error-container mat-corner-sm mat-border">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

<h4>On Surface</h4>

Use the on-surface color for text that contrasts well against a surface background.

<pre>
.mat-text-on-surface {
  color: var(--mat-sys-on-surface);
}
</pre>

<pre class="mat-text-on-surface mat-bg-surface mat-corner-sm mat-border">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

<h4>Inverse On Surface</h4>

Use the inverse-on-surface color for text that contrasts well against an inverse-surface background.

<pre>
.mat-text-inverse-on-surface {
  color: var(--mat-sys-inverse-on-surface);
}
</pre>

<pre class="mat-text-inverse-on-surface mat-bg-inverse-surface mat-corner-sm mat-border">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

## Typography

Material Design provides five categories of font types: body, display, headline, label, and title.
Each category has three sizes: small, medium, and large. Learn more about how these categories and
their sizes should be used in your application by visiting Material
Design's [Applying Type](https://m3.material.io/styles/typography/applying-type) documentation.

<details>
  <summary>Expand to view all available typography system tokens</summary>

```css
--mat-sys-body-large
--mat-sys-body-large-font
--mat-sys-body-large-line-height
--mat-sys-body-large-size
--mat-sys-body-large-tracking
--mat-sys-body-large-weight

--mat-sys-body-medium
--mat-sys-body-medium-font
--mat-sys-body-medium-line-height
--mat-sys-body-medium-size
--mat-sys-body-medium-tracking
--mat-sys-body-medium-weight

--mat-sys-body-small
--mat-sys-body-small-font
--mat-sys-body-small-line-height
--mat-sys-body-small-size
--mat-sys-body-small-tracking
--mat-sys-body-small-weight

--mat-sys-display-large
--mat-sys-display-large-font
--mat-sys-display-large-line-height
--mat-sys-display-large-size
--mat-sys-display-large-tracking
--mat-sys-display-large-weight

--mat-sys-display-medium
--mat-sys-display-medium-font
--mat-sys-display-medium-line-height
--mat-sys-display-medium-size
--mat-sys-display-medium-tracking
--mat-sys-display-medium-weight

--mat-sys-display-small
--mat-sys-display-small-font
--mat-sys-display-small-line-height
--mat-sys-display-small-size
--mat-sys-display-small-tracking
--mat-sys-display-small-weight

--mat-sys-headline-large
--mat-sys-headline-large-font
--mat-sys-headline-large-line-height
--mat-sys-headline-large-size
--mat-sys-headline-large-tracking
--mat-sys-headline-large-weight

--mat-sys-headline-medium
--mat-sys-headline-medium-font
--mat-sys-headline-medium-line-height
--mat-sys-headline-medium-size
--mat-sys-headline-medium-tracking
--mat-sys-headline-medium-weight

--mat-sys-headline-small
--mat-sys-headline-small-font
--mat-sys-headline-small-line-height
--mat-sys-headline-small-size
--mat-sys-headline-small-tracking
--mat-sys-headline-small-weight

--mat-sys-label-large
--mat-sys-label-large-font
--mat-sys-label-large-line-height
--mat-sys-label-large-size
--mat-sys-label-large-tracking
--mat-sys-label-large-weight
--mat-sys-label-large-weight-prominent

--mat-sys-label-medium
--mat-sys-label-medium-font
--mat-sys-label-medium-line-height
--mat-sys-label-medium-size
--mat-sys-label-medium-tracking
--mat-sys-label-medium-weight
--mat-sys-label-medium-weight-prominent

--mat-sys-label-small
--mat-sys-label-small-font
--mat-sys-label-small-line-height
--mat-sys-label-small-size
--mat-sys-label-small-tracking
--mat-sys-label-small-weight

--mat-sys-title-large
--mat-sys-title-large-font
--mat-sys-title-large-line-height
--mat-sys-title-large-size
--mat-sys-title-large-tracking
--mat-sys-title-large-weight

--mat-sys-title-medium
--mat-sys-title-medium-font
--mat-sys-title-medium-line-height
--mat-sys-title-medium-size
--mat-sys-title-medium-tracking
--mat-sys-title-medium-weight

--mat-sys-title-small
--mat-sys-title-small-font
--mat-sys-title-small-line-height
--mat-sys-title-small-size
--mat-sys-title-small-tracking
--mat-sys-title-small-weight
```
</details>

<h3> Body </h3>


The small body typeface is useful for captions. In Angular Material, this is used for the subscript
text in a form field and the text in a paginator.

<pre>
.mat-font-body-sm {
  font: var(--mat-sys-body-small);
  letter-spacing: var(--mat-sys-body-small-tracking);
}
</pre>

<pre class="mat-font-body-sm mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

The medium body typeface is the default body font. In Angular Material, this is used for the text in
a table row and the supporting text in a dialog.

<pre>
.mat-font-body-md {
  font: var(--mat-sys-body-medium);
  letter-spacing: var(--mat-sys-body-medium-tracking);
}
</pre>

<pre class="mat-font-body-md mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

The large body typeface is useful for an introductory paragraph. In Angular Material, this is used
for the text in a list item and the text in a select trigger.

<pre>
.mat-font-body-lg {
  font: var(--mat-sys-body-large);
  letter-spacing: var(--mat-sys-body-large-tracking);
}
</pre>

<pre class="mat-font-body-lg mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

<h3> Display </h3>


The small display typeface is useful for short, important text or numerals, such as in hero sections
or for marking key information.

<pre>
.mat-font-display-sm {
  font: var(--mat-sys-display-small);
  letter-spacing: var(--mat-sys-display-small-tracking);
}
</pre>

<pre class="mat-font-display-sm mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

The medium display typeface is useful for short, impactful text in hero sections or titles on larger
screens.

<pre>
.mat-font-display-md {
  font: var(--mat-sys-display-medium);
  letter-spacing: var(--mat-sys-display-medium-tracking);
}
</pre>

<pre class="mat-font-display-md mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

The large display typeface is useful for short, high-emphasis text in hero sections or titles on
larger screens, providing the most visual weight.

<pre>
.mat-font-display-lg {
  font: var(--mat-sys-display-large);
  letter-spacing: var(--mat-sys-display-large-tracking);
}
</pre>

<pre class="mat-font-display-lg mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

<h3> Headline </h3>


The small headline typeface is useful for a page title. In Angular Material, this is used for the
headline in a dialog.

<pre>
.mat-font-headline-sm {
  font: var(--mat-sys-headline-small);
  letter-spacing: var(--mat-sys-headline-small-tracking);
}
</pre>

<pre class="mat-font-headline-sm mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

The medium headline typeface is useful for a section title.

<pre>
.mat-font-headline-md {
  font: var(--mat-sys-headline-medium);
  letter-spacing: var(--mat-sys-headline-medium-tracking);
}
</pre>

<pre class="mat-font-headline-md mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

The large headline typeface is useful for a page title on a large screen.

<pre>
.mat-font-headline-lg {
  font: var(--mat-sys-headline-large);
  letter-spacing: var(--mat-sys-headline-large-tracking);
}
</pre>

<pre class="mat-font-headline-lg mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

<h3> Label </h3>


The small label typeface is useful for text in a badge.

<pre>
.mat-font-label-sm {
  font: var(--mat-sys-label-small);
  letter-spacing: var(--mat-sys-label-small-tracking);
}
</pre>

<pre class="mat-font-label-sm mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

The medium label typeface is useful for the slider label.

<pre>
.mat-font-label-md {
  font: var(--mat-sys-label-medium);
  letter-spacing: var(--mat-sys-label-medium-tracking);
}
</pre>

<pre class="mat-font-label-md mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

The large label typeface is useful for buttons, chips, and menu labels.

<pre>
.mat-font-label-lg {
  font: var(--mat-sys-label-large);
  letter-spacing: var(--mat-sys-label-large-tracking);
}
</pre>

<pre class="mat-font-label-lg mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

<h3> Title </h3>


The small title typeface is useful for a card title. In Angular Material, this is used for the
header of a table and the label of an option group.

<pre>
.mat-font-title-sm {
  font: var(--mat-sys-title-small);
  letter-spacing: var(--mat-sys-title-small-tracking);
}
</pre>

<pre class="mat-font-title-sm mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

The medium title typeface is useful for a dialog title or the primary text in a list item. In
Angular Material, this is used for the subtitle of a card and the header of an expansion panel.

<pre>
.mat-font-title-md {
  font: var(--mat-sys-title-medium);
  letter-spacing: var(--mat-sys-title-medium-tracking);
}
</pre>

<pre class="mat-font-title-md mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

The large title typeface is useful for a page title on a small screen. In Angular Material, this is
used for the title of a card and the title of a toolbar.

<pre>
.mat-font-title-lg {
  font: var(--mat-sys-title-large);
  letter-spacing: var(--mat-sys-title-large-tracking);
}
</pre>

<pre class="mat-font-title-lg mat-corner-sm mat-border mat-bg-surface-container-low">Example text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</pre>

## Shape

Material Design uses border radius to help direct attention, identify components, communicate state,
and express brand. See Material
Design's [Corner Radius Scale](https://m3.material.io/styles/shape/corner-radius-scale)
documentation to learn more.

In Angular Material, shape is scoped to varying levels of border-radius. The following code blocks
demonstrate the levels of roundness. Their border sizes are increased to `2px` to clearly show the
border radii.

<details>
  <summary>Expand to view all available corner shape system tokens</summary>

```css
--mat-sys-corner-extra-large: 28px;
--mat-sys-corner-extra-large-top: 28px 28px 0 0;
--mat-sys-corner-extra-small: 4px;
--mat-sys-corner-extra-small-top: 4px 4px 0 0;
--mat-sys-corner-full: 9999px;
--mat-sys-corner-large: 16px;
--mat-sys-corner-large-end: 0 16px 16px 0;
--mat-sys-corner-large-start: 16px 0 0 16px;
--mat-sys-corner-large-top: 16px 16px 0 0;
--mat-sys-corner-medium: 12px;
--mat-sys-corner-none: 0;
--mat-sys-corner-small: 8px;
```
</details>

The extra small border radius is useful for components that need a small amount of rounding, such as
a chip. In Angular Material, this is used for the shape of a snackbar and a tooltip.

<pre class="mat-border mat-bg-surface-container-low" style="border-width: 2px; border-radius: var(--mat-sys-corner-extra-small);">
.mat-corner-xs {
  border-radius: var(--mat-sys-corner-extra-small);
}
</pre>
The small border radius is useful for components that need a small amount of rounding, such as a
text field.

<pre class="mat-border mat-bg-surface-container-low" style="border-width: 2px; border-radius: var(--mat-sys-corner-small);">
.mat-corner-sm {
  border-radius: var(--mat-sys-corner-small);
}
</pre>
The medium border radius is useful for components that need a medium amount of rounding, such as a
button. In Angular Material, this is used for the shape of a card.

<pre class="mat-border mat-bg-surface-container-low" style="border-width: 2px; border-radius: var(--mat-sys-corner-medium);">
.mat-corner-md {
  border-radius: var(--mat-sys-corner-medium);
}
</pre>
The large border radius is useful for components that need a large amount of rounding, such as a
card. In Angular Material, this is used for the shape of a floating action button and a datepicker.

<pre class="mat-border mat-bg-surface-container-low" style="border-width: 2px; border-radius: var(--mat-sys-corner-large);">
.mat-corner-lg {
  border-radius: var(--mat-sys-corner-large);
}
</pre>
The extra large border radius is useful for components that need a large amount of rounding. In
Angular Material, this is used for the shape of a button toggle and the shape of a dialog.

<pre class="mat-border mat-bg-surface-container-low" style="border-width: 2px; border-radius: var(--mat-sys-corner-extra-large);">
.mat-corner-xl {
  border-radius: var(--mat-sys-corner-extra-large);
}
</pre>
The full border radius is useful for components that are circular, such as a user avatar. In Angular
Material, this is used for the shape of a badge and the shape of a button.

<pre class="mat-border mat-bg-surface-container-low" style="border-width: 2px; border-radius: var(--mat-sys-corner-full);">
.mat-corner-full {
  border-radius: var(--mat-sys-corner-full);
}
</pre>

## Elevation

Material Design uses borders and shadows to create a sense of depth and hierarchy in the UI. See
Material Design's [Applying Elevation](https://m3.material.io/styles/elevation/applying-elevation)
documentation to learn more.

<h3> Border </h3>

<details>
  <summary>Expand to view the outline system tokens</summary>

```css
--mat-sys-outline
--mat-sys-outline-variant
```
</details>

The Material Design border is useful for components that need a visible boundary. In Angular
Material, this is used for the outline of an outlined button.

<pre class="mat-bg-surface-container-low" style="border: 1px solid var(--mat-sys-outline);">
.mat-border {
  border: 1px solid var(--mat-sys-outline);
}
</pre>

The subtle outline variant is useful for components that need a less obvious boundary. In Angular
Material, this is used for the outline of an outlined card and the color of the divider.

<pre class="mat-bg-surface-container-low" style="border: 1px solid var(--mat-sys-outline-variant);">
.mat-border-subtle {
  border: 1px solid var(--mat-sys-outline-variant);
}
</pre>

<h3> Shadow </h3>

<details>
  <summary>Expand to view all available elevation system tokens</summary>

```css
--mat-sys-level0: 0px 0px 0px 0px rgba(0, 0, 0, .2), 0px 0px 0px 0px rgba(0, 0, 0, .14), 0px 0px 0px 0px rgba(0, 0, 0, .12);
--mat-sys-level1: 0px 2px 1px -1px rgba(0, 0, 0, .2), 0px 1px 1px 0px rgba(0, 0, 0, .14), 0px 1px 3px 0px rgba(0, 0, 0, .12);
--mat-sys-level2: 0px 3px 3px -2px rgba(0, 0, 0, .2), 0px 3px 4px 0px rgba(0, 0, 0, .14), 0px 1px 8px 0px rgba(0, 0, 0, .12);
--mat-sys-level3: 0px 3px 5px -1px rgba(0, 0, 0, .2), 0px 6px 10px 0px rgba(0, 0, 0, .14), 0px 1px 18px 0px rgba(0, 0, 0, .12);
--mat-sys-level4: 0px 5px 5px -3px rgba(0, 0, 0, .2), 0px 8px 10px 1px rgba(0, 0, 0, .14), 0px 3px 14px 2px rgba(0, 0, 0, .12);
--mat-sys-level5: 0px 7px 8px -4px rgba(0, 0, 0, .2), 0px 12px 17px 2px rgba(0, 0, 0, .14), 0px 5px 22px 4px rgba(0, 0, 0, .12);
```
</details>

Level 1 elevation can be used to slightly raise the appearance of a surface. In Angular Material,
this is used for the elevation of an elevated card and the handle of a slider.

<pre class="mat-shadow-1 mat-bg-surface-container-low">
.mat-shadow-1 {
  box-shadow: var(--mat-sys-level1);
}
</pre>

Level 2 elevation can be used to raise the appearance of a surface. In Angular Material, this is
used for the elevation of a menu and a select panel.

<pre class="mat-shadow-2 mat-bg-surface-container-low">
.mat-shadow-2 {
  box-shadow: var(--mat-sys-level2);
}
</pre>

Level 3 elevation is used to raise the appearance of a surface. In Angular Material, this is used
for the elevation of a floating action button.

<pre class="mat-shadow-3 mat-bg-surface-container-low">
.mat-shadow-3 {
  box-shadow: var(--mat-sys-level3);
}
</pre>

Level 4 elevation is generally reserved for elevation changes due to interaction like focus and
hover. In Angular Material, this is used for the elevation of a hovered floating action button.

<pre class="mat-shadow-4 mat-bg-surface-container-low">
.mat-shadow-4 {
  box-shadow: var(--mat-sys-level4);
}
</pre>

Level 5 elevation is used to greatly raise the appearance of a surface and is generally reserved for
elevation changes due to interaction like focus and hover.

<pre class="mat-shadow-5 mat-bg-surface-container-low">
.mat-shadow-5 {
  box-shadow: var(--mat-sys-level5);
}
</pre>

## Material Design 2 Support

This guide is compatible for applications defining their theme with the "m2" Sass APIs using
the legacy theme-config approach. To take advantage of CSS variables and the utility classes,
you can call `@include mat.m2-theme($theme)` in your theme file, which will define
system tokens according to the Material Design 2 system that matches your current theme
configuration.

```scss
@use '@angular/material' as mat;

$theme: mat.m2-define-light-theme((
  color: (
    primary: mat.define-palette(mat.$indigo-palette, 500),
  ),
  ...
));

html {
  @include mat.core-theme($theme);
  @include mat.button-theme($theme);
  ...
  @include mat.m2-theme($theme);
  @include mat.system-classes();
}
```

By using CSS variables and utility classes, you can avoid creating component-specific theme files 
and mixins that extract values from the `$theme` Sass map. For example, consider the following
example of how styles used to be applied in custom components:

```scss
@use '@angular/material' as mat;
@use 'sass:map';

@mixin my-component-theme($theme) {
  $foreground: map.get(mat.m2-get-color-config($theme), foreground);
  $background: map.get(mat.m2-get-color-config($theme), background);
  $primary: map.get(mat.m2-get-color-config($theme), primary);
  $typography: mat.m2-get-typography-config($config-or-theme);

  .widget-a {
    background-color: mat.m2-get-color-from-palette($background, card);
    color: mat.m2-get-color-from-palette($foreground, text);
    @include mat.m2-typography-level($config, body-1);  
  }

  .widget-b {
    background-color: mat.m2-get-color-from-palette($primary, default);
    color: mat.m2-get-color-from-palette($primary, default-contrast);
  }
}
```

By using the CSS variables, you can define these theme styles in your component's
stylesheet and avoid creating a separate theme file or mixin:

```scss
.widget-a  {
  background-color: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);    
  font: var(--mat-sys-body-medium);
}

.widget-b {
  background-color: var(--mat-sys-primary);
  color: var(--mat-sys-on-primary);
}
```

Taking it one step further, you can alternatively use the utility classes to achieve the same styles
in the component template:

```html
<widget-a class="mat-bg-surface mat-text-on-surface mat-font-body-medium"/>

<widget-b class="mat-bg-primary mat-text-on-primary"/>
```
