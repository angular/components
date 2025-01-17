"""
  Implementation of the "extract_tokens" rule.
"""

def _extract_tokens(ctx):
    input_files = ctx.files.srcs
    args = ctx.actions.args()

    # Do nothing if there are no input files. Bazel will throw if we schedule an action
    # that returns no outputs.
    if not input_files:
        return None

    # Derive the name of the output file from the package.
    output_file_name = ctx.actions.declare_file(ctx.label.package.split("/")[-1] + ".json")
    expected_outputs = [output_file_name]

    # Pass the necessary information like the package name and files to the script.
    args.add(ctx.label.package, output_file_name)

    for input_file in input_files:
        args.add(input_file.path)

    # Run the token extraction executable. Note that we specify the outputs because Bazel
    # can throw an error if the script didn't generate the required outputs.
    ctx.actions.run(
        inputs = input_files,
        executable = ctx.executable._extract_tokens,
        outputs = expected_outputs,
        arguments = [args],
        progress_message = "ExtractTokens",
    )

    return DefaultInfo(files = depset(expected_outputs))

"""
  Rule definition for the "extract_tokens" rule that can extract
  information about CSS tokens from a set of source files.
"""
extract_tokens = rule(
    implementation = _extract_tokens,
    attrs = {
        "srcs": attr.label_list(),
        "_extract_tokens": attr.label(
            default = Label("//tools/extract-tokens"),
            executable = True,
            cfg = "exec",
        ),
    },
)
