entryPointGroups = [
    ["form-field/testing", "form-field/testing/control"],
    ["input/testing"],
    ["mdc-autocomplete"],
    ["mdc-button", "mdc-button/testing"],
    ["mdc-card"],
    ["mdc-checkbox", "mdc-checkbox/testing"],
    ["mdc-chips", "mdc-chips/testing"],
    ["mdc-helpers"],
    ["mdc-menu", "mdc-menu/testing"],
    ["mdc-radio"],
    ["mdc-select"],
    ["mdc-sidenav"],
    ["mdc-slide-toggle", "mdc-slide-toggle/testing"],
    ["mdc-slider"],
    ["mdc-tabs"],
    ["popover-edit"],
    ["select/testing"],
]

# List of all entry-points of the Angular material-experimental package.
MATERIAL_EXPERIMENTAL_ENTRYPOINTS = [ep for group in entryPointGroups for ep in group]

# List of all non-testing entry-points of the Angular material-experimental package.
MATERIAL_EXPERIMENTAL_NO_TEST_ENTRYPOINTS = [
    ep
    for ep in MATERIAL_EXPERIMENTAL_ENTRYPOINTS
    if not ep.endswith("/testing")
]

# List of all entry-point targets of the Angular material-experimental package.
MATERIAL_EXPERIMENTAL_TARGETS = ["//src/material-experimental"] + \
                                ["//src/material-experimental/%s" % ep for ep in MATERIAL_EXPERIMENTAL_ENTRYPOINTS]

# List of all non-testing entry-point targets of the Angular material-experimental package.
MATERIAL_EXPERIMENTAL_NO_TEST_TARGETS = ["//src/material-experimental"] + \
                                        ["//src/material-experimental/%s" % ep for ep in MATERIAL_EXPERIMENTAL_NO_TEST_ENTRYPOINTS]

MATERIAL_EXPERIMENTAL_SCSS_LIBS = [
    "//src/material-experimental/%s:%s_scss_lib" % (ep, ep.replace("-", "_"))
    # Only secondary entry-points declare theme files currently. Entry-points
    # which contain a slash are not in the top-level.
    for ep in MATERIAL_EXPERIMENTAL_ENTRYPOINTS
    if not "/" in ep
]
