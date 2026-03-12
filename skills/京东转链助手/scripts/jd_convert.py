#!/usr/bin/env python3
import argparse
import json
import re
from pathlib import Path
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen

CONFIG_PATH = Path(__file__).resolve().parent.parent / ".config.json"
API = "http://skapi.51zuosi.com/cps.php"
UA = "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:17.0) Gecko/20100101 Firefox/17.0"
URL_RE = re.compile(r"https?://[^\s\u3000<>\"'，。！？；：、]+")


def load_config():
    if not CONFIG_PATH.exists():
        return {}
    try:
        return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_config(cfg):
    CONFIG_PATH.write_text(json.dumps(cfg, ensure_ascii=False, indent=2), encoding="utf-8")


def is_jd_url(url: str) -> bool:
    try:
        host = (urlparse(url).hostname or "").lower()
    except Exception:
        return False
    return "jd.com" in host


def call_convert(userid: str, url: str):
    req_url = f"{API}?userid={quote(userid)}&url={quote(url, safe='')}"
    req = Request(req_url, headers={"User-Agent": UA})
    try:
        with urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
    except Exception:
        return ("fail", None)

    try:
        data = json.loads(raw)
    except Exception:
        return ("fail", None)

    if not isinstance(data, dict):
        return ("fail", None)

    if data.get("ok") is True and isinstance(data.get("result"), str) and data.get("result").strip():
        result = data["result"].strip()
        if result.startswith("http://") or result.startswith("https://"):
            return ("ok", result)

    msg = str(data.get("message", "") or "")
    if "过期" in msg:
        return ("expired", None)

    return ("fail", None)


def convert_text(text: str, userid: str) -> str:
    urls = list(dict.fromkeys(URL_RE.findall(text)))
    out = text
    for url in urls:
        if not is_jd_url(url):
            continue
        status, new_url = call_convert(userid, url)
        if status == "ok" and new_url:
            out = out.replace(url, new_url)
        elif status == "expired":
            out = out.replace(url, f"{url}（优惠券已过期）")
    return out


def cmd_init(args):
    userid = args.userid.strip()
    if not userid:
        print("联盟id不能为空")
        return
    save_config({"userid": userid})
    print(f"初始化成功，已保存联盟id：{userid}")


def cmd_convert(args):
    text = args.text
    urls = URL_RE.findall(text)
    if not any(is_jd_url(u) for u in urls):
        print(text)
        return

    cfg = load_config()
    userid = str(cfg.get("userid", "")).strip()
    if not userid:
        print("请先初始化京东联盟id（例如：初始化联盟id 1002084276）")
        return

    print(convert_text(text, userid))


def cmd_nl(args):
    text = args.text

    # 自然语言初始化：支持“初始化联盟id 1002084276”
    m = re.search(r"初始化\s*联盟\s*id\s*[:：]?\s*(\d+)", text, flags=re.IGNORECASE)
    if m:
        save_config({"userid": m.group(1)})
        print(f"初始化成功，已保存联盟id：{m.group(1)}")
        return

    urls = URL_RE.findall(text)
    if not any(is_jd_url(u) for u in urls):
        print(text)
        return

    cfg = load_config()
    userid = str(cfg.get("userid", "")).strip()
    if not userid:
        print("请先初始化京东联盟id（例如：初始化联盟id 1002084276）")
        return

    print(convert_text(text, userid))


def main():
    parser = argparse.ArgumentParser(description="京东转链助手")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_init = sub.add_parser("init", help="初始化联盟id")
    p_init.add_argument("--userid", required=True)
    p_init.set_defaults(func=cmd_init)

    p_convert = sub.add_parser("convert", help="转链文案")
    p_convert.add_argument("--text", required=True)
    p_convert.set_defaults(func=cmd_convert)

    p_nl = sub.add_parser("nl", help="自然语言入口（支持初始化/转链）")
    p_nl.add_argument("--text", required=True)
    p_nl.set_defaults(func=cmd_nl)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
