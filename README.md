# openClaw-skills-own

主人澜的 OpenClaw 私有技能与脚本仓库。

## 目录

- `scripts/oil_price.py`：查询中国各省今日油价（92/95/98/0#柴油）
- `skills/京东转链助手/`：京东链接自动转链技能

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

### 2) 京东转链助手

见：`skills/京东转链助手/SKILL.md`

首次使用需要初始化联盟 ID（userid）。

## 说明

- 本仓库仅存放可复用脚本与技能。
- 不包含运行环境敏感配置（如 token、密钥）。
