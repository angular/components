# Starts the e2e app on an open port and runs the tests against it.
# TODO(mmalerba): Replace this with something that works on windows as well.

# --- begin runfiles.bash initialization v2 ---
# Copy-pasted from the Bazel Bash runfiles library v2.
# https://github.com/bazelbuild/bazel/blob/master/tools/bash/runfiles/runfiles.bash#L54
set -uo pipefail; f=bazel_tools/tools/bash/runfiles/runfiles.bash
source "${RUNFILES_DIR:-/dev/null}/$f" 2>/dev/null || \
 source "$(grep -sm1 "^$f " "${RUNFILES_MANIFEST_FILE:-/dev/null}" | cut -f2- -d' ')" \
    2>/dev/null || \
 source "$0.runfiles/$f" 2>/dev/null || \
 source "$(grep -sm1 "^$f " "$0.runfiles_manifest" | cut -f2- -d' ')" 2>/dev/null || \
 source "$(grep -sm1 "^$f " "$0.exe.runfiles_manifest" | cut -f2- -d' ')" 2>/dev/null || \
 { echo>&2 "ERROR: cannot find $f"; exit 1; }; f=; set -e
# --- end runfiles.bash initialization v2 ---

# Save the commands passed from Bazel to start the server and run the tests.
start_server="$1"
run_tests="$2"

# Find a random open port.
# https://unix.stackexchange.com/questions/55913/whats-the-easiest-way-to-find-an-unused-local-port
read lower_port upper_port < /proc/sys/net/ipv4/ip_local_port_range
while :; do
  port="$(shuf -i $lower_port-$upper_port -n 1)"
  ss -lpn | grep -q ":$port " || break
done

# Start the e2e app server.
"$(rlocation "angular_material/$start_server")" --port "$port" &
server_pid="$!"

# Wait for the server to bind to the port.
while ! lsof "-i:$port" > /dev/null; do sleep 1; done

# Run the tests.
export E2E_APP_PORT="$port"
"$(rlocation "angular_material/$run_tests")"
result="$?"

# Shutdown the server.
kill -9 "$server_pid"

# Exit with the test result.
exit "$result"
