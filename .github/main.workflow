workflow "Cherry Pick Commit to Target Branch" {
  on = "pull_request"
  resolves = ["./cherry-pick-action"]
}

action "./cherry-pick-action" {
  uses = "./cherry-pick-action"
}