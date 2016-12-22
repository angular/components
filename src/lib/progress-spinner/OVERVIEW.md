`<md-progress-spinner>` and `<md-spinner>` are a circular indicators of progress and activity.

<!-- example(progress-spinner-overview) -->

### Progress mode
The progress-spinner supports two modes, "determinate" and "indeterminate". 
The `<md-spinner>` component is an alias for `<md-progress-spinner mode="indeterminate">`.

| Mode          | Description                                                                      |
|---------------|----------------------------------------------------------------------------------|
| determinate   | Standard progress indicator, fills from 0% to 100%                               |
| indeterminate | Indicates that something is happening without conveying a discrete progress      |


The default mode is "determinate". In this mode, the progress is set via the `value` property, 
which can be a whole number between 0 and 100.

In "indeterminate" mode, the `value` property is ignored.
