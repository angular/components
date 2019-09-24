entryPointGroups = [
    ["clipboard"],
    ["dialog"],
    ["popover-edit"],
    ["scrolling"],
]

# List of all entry-points of the Angular cdk-experimental package.
CDK_EXPERIMENTAL_ENTRYPOINTS = [ep for group in entryPointGroups for ep in group]

# List of all entry-point targets of the Angular cdk-experimental package.
CDK_EXPERIMENTAL_TARGETS = ["//src/cdk-experimental"] + \
                           ["//src/cdk-experimental/%s" % ep for ep in CDK_EXPERIMENTAL_ENTRYPOINTS]
