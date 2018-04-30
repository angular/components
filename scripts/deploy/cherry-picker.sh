#! /bin/bash

TARGETS=(
  'master'
)
FAILING_TARGETS=()

function parse_git_branch() {
  git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ \1/'
}
  
PR=$(parse_git_branch)

function canBeMerged() {
  git merge --no-commit $1 &>/dev/null;
  if [ $? -eq 0 ]; then
      local can_merge=true;
      git reset --hard &>/dev/null;
  else
      local can_merge=false;
      git merge --abort &>/dev/null;
  fi
  echo $can_merge
}

# For each target, check if it can be cherry picked, keep track of those
# that can't
for target in "${TARGETS[@]}"
do
  git checkout remotes/origin/${target} &>/dev/null
  echo
  echo -e "\e[1;31m-------------------------------------------------------\e[0m"
  echo $(git status); 
  mergable=$(canBeMerged $PR);
  echo "Testing if $PR can be cherrypicked to $target: $mergable";

  if ! $mergable; then
    FAILING_TARGETS+=($target)
  fi
done

# Determine if any failing targets were found
if [ ${#FAILING_TARGETS[@]} -eq 0 ]; then
  # No failures found, push green status
  echo 'no fails'
else
  # Failures found, push red status
  echo "fails: "
  for target in "${FAILING_TARGETS[@]}"
  do 
    echo $target
  done
  exit 1;
fi
