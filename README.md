# openClaw-skills-own

主人澜的 OpenClaw 私有技能与脚本仓库。

## 目录

- `scripts/oil_price.py`：查询中国各省今日油价（92/95/98/0#柴油）
- `scripts/cleanup-cache.sh`：一键清理 Docker 构建缓存/悬空资源与常见包缓存（不碰数据卷）
- `scripts/git-submit-scripts-skills.sh`：提交 `scripts/`、`skills/` 与 `README.md` 到 `origin/main`（若改了 scripts/skills 但未改 README，会自动补一条 README 提交记录）
- `skills/京东转链助手/`：京东链接自动转链技能
- `skills/git-submit-scripts-skills/`：规范化 git 提交流程技能（支持“git提交”触发）
- `skills/weather/`：天气查询技能（基于 wttr.in，支持当前天气与预报）
- `skills/skill-vetter/`：安装新 skill 前的安全审查技能（风险检查/权限审查）

## 快速使用

### 1) 查询油价

```bash
python3 scripts/oil_price.py 江苏
python3 scripts/oil_price.py 河南
python3 scripts/oil_price.py 山东
```

输出示例：

```text
江苏今日油价
92#：7.65 元/升
95#：8.14 元/升
98#：9.31 元/升
0#柴油：7.19 元/升
```

### 2) 清理缓存（不删 Docker 卷）

```bash
scripts/cleanup-cache.sh --dry-run
scripts/cleanup-cache.sh
scripts/cleanup-cache.sh --aggressive
```

### 3) 提交脚本与技能（含 README）

```bash
scripts/git-submit-scripts-skills.sh
scripts/git-submit-scripts-skills.sh /root/.openclaw/workspace "chore: sync scripts skills and readme"
```

### 4) 京东转链助手

见：`skills/京东转链助手/SKILL.md`

首次使用需要初始化联盟 ID（userid）。

## 说明

- 本仓库仅存放可复用脚本与技能。
- 不包含运行环境敏感配置（如 token、密钥）。
