# List of all entry-points of the Angular Aria package.
ARIA_ENTRYPOINTS = [
    "accordion",
    "accordion/testing",
    "combobox",
    "grid",
    "grid/testing",
    "listbox",
    "listbox/testing",
    "menu",
    "menu/testing",
    "tabs",
    "tabs/testing",
    "toolbar",
    "toolbar/testing",
    "tree",
    "tree/testing",
    "private",
]

# List of all entry-point targets of the Angular Aria package.
ARIA_TARGETS = ["//src/aria"] + \
               ["//src/aria/%s" % ep for ep in ARIA_ENTRYPOINTS]
