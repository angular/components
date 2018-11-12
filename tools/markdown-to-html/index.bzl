"""
  Implementation of the "markdown_to_html" rule. The implementation runs the transform
  executable in order to create the outputs for the specified source files.
"""
def _markdown_to_html(ctx):
  input_files = ctx.files.srcs;
  args = ctx.actions.args()
  expected_outputs = [];

  for input_file in input_files:
    basename = input_file.basename.replace('.md', '')
    output_file = ctx.actions.declare_file("%s.html" % basename)
    expected_outputs += [output_file]

    # Add the input file and it's related output to the arguments that
    # will be passed to the transformer executable.
    args.add("%s=%s" % (input_file.path, output_file.path))

  # Run the transform markdown executable that transforms the specified source files.
  # Note that we should specify the outputs here because Bazel can then throw an error
  # if the script didn't generate the required outputs.
  ctx.actions.run(
    inputs = input_files,
    executable = ctx.executable._transform_markdown,
    outputs = expected_outputs,
    arguments = [args],
  )

  return DefaultInfo(files = depset(expected_outputs))

"""
  Rule definition for the "markdown_to_html" rule that can accept arbritary source files
  that will be transformed into HTML files. The outputs can be referenced through the
  default output provider.
"""
markdown_to_html = rule(
  implementation = _markdown_to_html,
  attrs = {
    "srcs": attr.label_list(allow_files = [".md"]),

    # Executable for this rule that is responsible for converting the specified
    # markdown files into HTML files.
    "_transform_markdown": attr.label(
      default = Label("//tools/markdown-to-html"),
      executable = True,
      cfg = "host"
  )},
)
