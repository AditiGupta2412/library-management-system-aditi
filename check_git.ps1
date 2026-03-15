git status | Out-File -FilePath "debug_git.txt" -Encoding utf8
git remote -v | Out-File -FilePath "debug_git.txt" -Append -Encoding utf8
gh repo view --json url | Out-File -FilePath "debug_git.txt" -Append -Encoding utf8
