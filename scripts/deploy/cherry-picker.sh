#! /bin/bash
TARGETS=(
  '5.0.x'
  '5.1.x'
  '5.2.x'
)
FAILING_TARGETS=()
SHA="$1";

function canBeCherryPicked() {
  git cherry-pick -x $1 &>/dev/null;
  if [ $? -eq 0 ]; then
      local can_cherry_pick=true;
      git reset --hard HEAD~1 &>/dev/null;
  else
      local can_cherry_pick=false;
      git cherry-pick --abort &>/dev/null;
  fi
  echo $can_cherry_pick
}

# For each target, check if it can be cherry picked, keep track of those
# that can't
for target in "${TARGETS[@]}"
do
  eval "git checkout origin/${target} &>/dev/null";
  echo
  cherry_pickable=$(canBeCherryPicked $SHA);
  echo "Testing if $SHA can be cherrypicked to $target: $cherry_pickable";
  if ! $cherry_pickable; then
    FAILING_TARGETS+=($target)
  fi
done

# move back to master branch
git checkout master &>/dev/null;

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
fi

