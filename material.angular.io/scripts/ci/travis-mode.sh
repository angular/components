#!/bin/bash

function is_e2e() {
  [[ "$MODE" = e2e ]]
}

function is_lint() {
  [[ "$MODE" = lint ]]
}