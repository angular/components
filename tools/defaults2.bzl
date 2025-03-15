load("//tools/bazel:ts_project_interop.bzl", _ts_project = "ts_project")
load("//tools/bazel:module_name.bzl", "compute_module_name")

def ts_project(
        name,
        source_map = True,
        testonly = False,
        **kwargs):
    _ts_project(
        name,
        source_map = source_map,
        module_name = compute_module_name(testonly),
        **kwargs
    )
