# List of all entry-points of the Angular cdk-experimental package.
CDK_EXPERIMENTAL_ENTRYPOINTS = [
    "accordion",
    "column-resize",
    "combobox",
    "deferred-content",
    "listbox",
    "popover-edit",
    "radio",
    "scrolling",
    "selection",
    "tabs",
    "table-scroll-container",
    "ui-patterns",
]

# List of all entry-point targets of the Angular cdk-experimental package.
CDK_EXPERIMENTAL_TARGETS = ["//src/cdk-experimental"] + \
                           ["//src/cdk-experimental/%s" % ep for ep in CDK_EXPERIMENTAL_ENTRYPOINTS]
