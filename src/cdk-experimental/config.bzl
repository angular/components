# List of all entry-points of the Angular cdk-experimental package.
CDK_EXPERIMENTAL_ENTRYPOINTS = [
    "column-resize",
    "combobox",
    "listbox",
    "popover-edit",
    "scrolling",
    "selection",
    "table-scroll-container",
    "ui-patterns",
]

# List of all entry-point targets of the Angular cdk-experimental package.
CDK_EXPERIMENTAL_TARGETS = ["//src/cdk-experimental"] + \
                           ["//src/cdk-experimental/%s" % ep for ep in CDK_EXPERIMENTAL_ENTRYPOINTS]
