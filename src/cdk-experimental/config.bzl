# List of all entry-points of the Angular cdk-experimental package.
CDK_EXPERIMENTAL_ENTRYPOINTS = [
    "column-resize",
    "combobox",
    "deferred-content",
    "listbox",
    "nav",
    "popover-edit",
    "scrolling",
    "selection",
    "tabs",
    "table-scroll-container",
    "ui-patterns",
]

# List of all entry-point targets of the Angular cdk-experimental package.
CDK_EXPERIMENTAL_TARGETS = ["//src/cdk-experimental"] + \
                           ["//src/cdk-experimental/%s" % ep for ep in CDK_EXPERIMENTAL_ENTRYPOINTS]
