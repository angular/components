entryPoints = [
    "autocomplete",
    "autocomplete/testing",
    "badge",
    "badge/testing",
    "bottom-sheet",
    "bottom-sheet/testing",
    "button",
    "button/testing",
    "button-toggle",
    "button-toggle/testing",
    "card",
    "card/testing",
    "checkbox",
    "checkbox/testing",
    "chips",
    "chips/testing",
    "core",
    "core/testing",
    "datepicker",
    "datepicker/testing",
    "dialog",
    "dialog/testing",
    "divider",
    "divider/testing",
    "expansion",
    "expansion/testing",
    "form-field",
    "form-field/testing",
    "form-field/testing/control",
    "grid-list",
    "grid-list/testing",
    "icon",
    "icon/testing",
    "input",
    "input/testing",
    "list",
    "list/testing",
    "menu",
    "menu/testing",
    "paginator",
    "paginator/testing",
    "progress-bar",
    "progress-bar/testing",
    "progress-spinner",
    "progress-spinner/testing",
    "radio",
    "radio/testing",
    "select",
    "select/testing",
    "sidenav",
    "sidenav/testing",
    "slide-toggle",
    "slide-toggle/testing",
    "slider",
    "slider/testing",
    "snack-bar",
    "snack-bar/testing",
    "sort",
    "sort/testing",
    "stepper",
    "stepper/testing",
    "table",
    "table/testing",
    "tabs",
    "tabs/testing",
    "timepicker",
    "timepicker/testing",
    "toolbar",
    "toolbar/testing",
    "tooltip",
    "tooltip/testing",
    "tree",
    "tree/testing",
]

# List of all non-testing entry-points of the Angular Material package.
MATERIAL_ENTRYPOINTS = [
    ep
    for ep in entryPoints
    if not "/testing" in ep
]

# List of all testing entry-points of the Angular Material package.
MATERIAL_TESTING_ENTRYPOINTS = [
    ep
    for ep in entryPoints
    if not ep in MATERIAL_ENTRYPOINTS
]

# List of all non-testing entry-point targets of the Angular Material package.
MATERIAL_TARGETS = ["//src/material"] + \
                   ["//src/material/%s" % ep for ep in MATERIAL_ENTRYPOINTS]

# List of all testing entry-point targets of the Angular Material package.
MATERIAL_TESTING_TARGETS = ["//src/material/%s" % ep for ep in MATERIAL_TESTING_ENTRYPOINTS]

# List that references the sass libraries for each Material non-testing entry-point. This
# can be used to specify dependencies for the "all-theme.scss" file in core.
MATERIAL_SCSS_LIBS = [
    "//src/material/%s:%s_scss_lib" % (ep, ep.replace("-", "_"))
    for ep in MATERIAL_ENTRYPOINTS
]
