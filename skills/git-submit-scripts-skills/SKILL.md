---
name: git-submit-scripts-skills
description: Commit and push script/skill changes to GitHub main branch for repository git@github.com:Haha-li/openClaw-skills-own.git, and update README.md before/with each submit. Use when user asks to submit/push scripts or skills, says “git提交”, or when scripts/ or skills/ files are created or modified and should be synced.
---

# Git 提交（仅 scripts/ 与 skills/）

## 目标
- 提交 `scripts/`、`skills/`，并同步更新 `README.md`。
- 推送到 `origin/main`（仓库：`git@github.com:Haha-li/openClaw-skills-own.git`）。
- 当本次任务创建或修改了脚本/skill 时，先更新 README 再提交推送。
- 用户明确说“git提交”时，立即执行一次提交推送（含 README 校对/更新）。

## 执行步骤
1. 确保远程正确：`origin` 指向 `git@github.com:Haha-li/openClaw-skills-own.git`。
2. 切换到 `main` 分支并拉取最新：`git checkout main && git pull --rebase origin main`。
3. 更新 `README.md`（新增/修改脚本或 skill 的用途、路径、用法）。
4. 暂存相关路径：
   - `git add scripts/ skills/ README.md`
5. 检查是否有可提交内容：
   - 若无变更，回复“scripts/skills/README 无变更，无需提交”。
6. 生成简洁提交信息并提交。
7. 推送：`git push origin main`。

## 约束
- 默认仅提交 `scripts/`、`skills/` 与 `README.md`。
- 如遇冲突，先说明冲突点，再进行最小化解决并继续推送。
- 若推送失败（权限/网络），清晰反馈错误并给出下一步建议。

## 建议提交信息模板
- `feat(skill): add <skill-name>`
- `fix(skill): update <skill-name>`
- `feat(script): add <script-name>`
- `chore: sync scripts and skills`
