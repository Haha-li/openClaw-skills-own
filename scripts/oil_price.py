#!/usr/bin/env python3
import argparse
import json
import sys
from urllib.parse import quote
from urllib.request import Request, urlopen


def fetch_json(url: str, timeout: int = 10):
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 OpenClaw oil script"})
    with urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8", errors="ignore"))


def query_52vmy(province: str):
    url = f"https://api.52vmy.cn/api/query/oil?province={quote(province)}"
    data = fetch_json(url)
    if data.get("code") != 200 or not isinstance(data.get("data"), list):
        raise RuntimeError(f"52vmy返回异常: {data}")

    rows = data["data"]
    exact = None
    for row in rows:
        city = str(row.get("city", "")).strip()
        if city == province:
            exact = row
            break

    if not exact:
        # fallback: fuzzy match
        for row in rows:
            city = str(row.get("city", "")).strip()
            if province in city or city in province:
                exact = row
                break

    if not exact:
        raise RuntimeError(f"未找到省份: {province}")

    return {
        "province": exact.get("city", province),
        "92": exact.get("92", "-"),
        "95": exact.get("95", "-"),
        "98": exact.get("98", "-"),
        "0": exact.get("0", "-"),
        "source": url,
    }


def main():
    p = argparse.ArgumentParser(description="查询中国油价（省级）")
    p.add_argument("province", help="省份，如 江苏 / 广东 / 北京")
    p.add_argument("--json", action="store_true", help="输出JSON")
    args = p.parse_args()

    try:
        result = query_52vmy(args.province)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)

    if args.json:
        print(json.dumps(result, ensure_ascii=False))
        return

    print(f"{result['province']}今日油价")
    print(f"92#：{result['92']} 元/升")
    print(f"95#：{result['95']} 元/升")
    print(f"98#：{result['98']} 元/升")
    print(f"0#柴油：{result['0']} 元/升")


if __name__ == "__main__":
    main()
