# List of all entry-points of the Angular Aria package.
ARIA_ENTRYPOINTS = [
    "accordion",
    "combobox",
    "grid",
    "listbox",
    "menu",
    "spinbutton",
    "tabs",
    "toolbar",
    "tree",
    "private",
]

# List of all entry-point targets of the Angular Aria package.
ARIA_TARGETS = ["//src/aria"] + \
               ["//src/aria/%s" % ep for ep in ARIA_ENTRYPOINTS]
