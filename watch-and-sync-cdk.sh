#!/bin/bash

# Usage: ./scripts/watch-and-sync-cdk.sh /path/to/target/project
#
# This script builds the CDK with ibazel (watch mode) and syncs the output
# to the target project's node_modules/@nomad2102npm/cdk folder on every rebuild.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if target path is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide the target project path${NC}"
    echo ""
    echo "Usage: $0 /absolute/path/to/target/project"
    echo ""
    exit 1
fi

TARGET_PROJECT="$1"
TARGET_CDK_PATH="$TARGET_PROJECT/node_modules/@nomad2102npm/cdk"

# Validate target project exists
if [ ! -d "$TARGET_PROJECT" ]; then
    echo -e "${RED}Error: Target project directory does not exist: $TARGET_PROJECT${NC}"
    exit 1
fi

# Validate node_modules exists
if [ ! -d "$TARGET_PROJECT/node_modules" ]; then
    echo -e "${RED}Error: node_modules not found in target project. Run 'npm install' first.${NC}"
    exit 1
fi

# Get the script's directory (which is also the project root since script is in components/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  CDK Watch & Sync Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Project root: ${GREEN}$PROJECT_ROOT${NC}"
echo -e "Target project: ${GREEN}$TARGET_PROJECT${NC}"
echo ""

# Get bazel-bin path
echo -e "${YELLOW}Getting bazel output path...${NC}"
cd "$PROJECT_ROOT"
BAZEL_BIN=$(pnpm -s bazel info bazel-bin)
CDK_OUTPUT="$BAZEL_BIN/src/cdk/npm_package"

echo -e "Bazel bin: ${GREEN}$BAZEL_BIN${NC}"
echo -e "CDK output: ${GREEN}$CDK_OUTPUT${NC}"
echo ""

# Function to sync CDK to target
sync_cdk() {
    if [ -d "$CDK_OUTPUT" ]; then
        rm -rf "$TARGET_CDK_PATH"
        cp -R "$CDK_OUTPUT" "$TARGET_CDK_PATH"
        echo -e "${GREEN}[$(date +%H:%M:%S)] Synced CDK to $TARGET_CDK_PATH${NC}"
    else
        echo -e "${YELLOW}[$(date +%H:%M:%S)] Waiting for initial build...${NC}"
    fi
}

# Function to watch for changes and sync
watch_and_sync() {
    echo -e "${YELLOW}Starting file watcher...${NC}"
    
    # Use fswatch if available, otherwise fall back to polling
    if command -v fswatch &> /dev/null; then
        echo -e "${GREEN}Using fswatch for efficient file watching${NC}"
        fswatch -o "$CDK_OUTPUT" 2>/dev/null | while read; do
            sleep 1  # Small delay to ensure build is complete
            sync_cdk
        done
    else
        echo -e "${YELLOW}fswatch not found, using polling (install with 'brew install fswatch' for better performance)${NC}"
        LAST_MODIFIED=""
        while true; do
            if [ -d "$CDK_OUTPUT" ]; then
                CURRENT_MODIFIED=$(stat -f "%m" "$CDK_OUTPUT" 2>/dev/null || echo "")
                if [ "$CURRENT_MODIFIED" != "$LAST_MODIFIED" ] && [ -n "$CURRENT_MODIFIED" ]; then
                    LAST_MODIFIED="$CURRENT_MODIFIED"
                    sync_cdk
                fi
            fi
            sleep 2
        done
    fi
}

# Trap to handle cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down...${NC}"
    # Kill all child processes
    pkill -P $$ 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# Start the watcher in background
watch_and_sync &
WATCHER_PID=$!

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Starting ibazel build...${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

# Run ibazel (this blocks)
cd "$PROJECT_ROOT"
pnpm ibazel build //src/cdk:npm_package --config=snapshot-build

# If ibazel exits, cleanup
cleanup
