def get_legacy_label(label):
    if not ":" in label:
        label = "%s:%s" % (label, Label(label).name)
    return "%s_legacy" % label
