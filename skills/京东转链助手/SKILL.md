---
name: 京东转链助手
description: 处理京东链接自动转链。只要文案中出现京东链接（域名包含 jd.com）就调用京东转链接口替换原链接并返回完整新文案；不要求出现“转链”关键词。首次使用需初始化并保存京东联盟id；未初始化时提醒用户先初始化。
---

# 京东转链助手

## 初始化（首次必做）

首次使用时，先让用户提供京东联盟ID，并保存到本地配置文件：

- 配置文件：`skills/京东转链助手/.config.json`
- 字段：`userid`

如果配置不存在或`userid`为空：
- 不执行转链
- 直接提示：`请先初始化京东联盟id（例如：初始化联盟id 1002084276）`

可用脚本初始化：
```bash
python3 skills/京东转链助手/scripts/jd_convert.py init --userid 1002084276
```

## 触发条件

用户文案中只要包含京东链接（域名包含 `jd.com`）就触发，不要求出现“转链”二字。
同时支持自然语言初始化口令：`初始化联盟id 1002084276`。

## 转链规则

1. 从整段文案提取所有URL。
2. 只处理域名包含`jd.com`的链接。
3. 对每个命中链接调用接口：
   - `http://skapi.51zuosi.com/cps.php?userid={联盟id}&url={原链接}`
4. 接口返回JSON示例：
   - `{"ok":true,"result":"https://u.jd.com/NGrhv7W"}`
5. 用`result`替换原文案对应原链接。
6. 一个文案含多个京东链接时，逐个替换后返回完整新文案。
7. 只替换链接本身，其他内容（包括换行、空格、标点和排版）完全保留。

## 失败处理

- 转链成功：替换为新链接。
- 若接口提示优惠券过期（返回信息包含“过期”）：保留原链接，并在链接后标注`（优惠券已过期）`。
- 其它失败：保留原链接，不中断其它链接。

## 实施脚本

使用：`scripts/jd_convert.py`

- 初始化：
  ```bash
  python3 skills/京东转链助手/scripts/jd_convert.py init --userid <联盟id>
  ```
- 处理文案：
  ```bash
  python3 skills/京东转链助手/scripts/jd_convert.py convert --text "请转链 https://u.jd.com/NGDumXz"
  ```
- 自然语言入口（推荐）：
  ```bash
  python3 skills/京东转链助手/scripts/jd_convert.py nl --text "初始化联盟id 1002084276"
  python3 skills/京东转链助手/scripts/jd_convert.py nl --text "帮我转链： https://u.jd.com/NGDumXz"
  ```
