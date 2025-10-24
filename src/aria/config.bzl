# List of all entry-points of the Angular Aria package.
ARIA_ENTRYPOINTS = [
    "accordion",
    "combobox",
    "deferred-content",
    "grid",
    "listbox",
    "menu",
    "radio-group",
    "tabs",
    "toolbar",
    "tree",
    "private",
]

# List of all entry-point targets of the Angular Aria package.
ARIA_TARGETS = ["//src/aria"] + \
               ["//src/aria/%s" % ep for ep in ARIA_ENTRYPOINTS]
