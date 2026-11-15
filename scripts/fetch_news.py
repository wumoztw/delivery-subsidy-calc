#!/usr/bin/env python3
"""抓取 Uber / Foodpanda / Delivery Hero 新聞，經 Google Gemini 整理成 zh-TW，輸出 data/daily_news.json。

任何失敗都不會中斷：保留既有檔案（不存在則寫入預設備援資料）。
"""
import json
import os
import re
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import quote

import requests

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "daily_news.json"
QUERY_GLOBAL = '(Uber OR Foodpanda OR "Delivery Hero" OR DoorDash OR Deliveroo) (delivery OR "gig worker" OR rider OR courier)'
RSS_URL_GLOBAL = "https://news.google.com/rss/search?q={}&hl=en-US&gl=US&ceid=US:en"
QUERY_TW = '外送員 OR 外送專法 OR "Uber Eats" OR Foodpanda'
RSS_URL_TW = "https://news.google.com/rss/search?q={}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"
GEMINI_MODEL = "gemini-3.1-flash-lite"
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
MAX_ITEMS = 30
PICK = 10
TZ = timezone(timedelta(hours=8))

FALLBACK = {
    "updatedAt": "",
    "source": "fallback",
    "items": [
        {
            "title": "全球外送平台動態持續更新中",
            "summary": ["今日新聞暫時無法取得", "請稍後再查看最新情報"],
            "url": "https://news.google.com/search?q=Uber+Foodpanda+delivery",
            "tag": "國際動態",
            "date": "",
        }
    ],
}


def fetch_feed(url_tpl, query, limit):
    r = requests.get(url_tpl.format(quote(query)), timeout=20,
                     headers={"User-Agent": "Mozilla/5.0 delivery-subsidy-calc"})
    r.raise_for_status()
    items = []
    for it in ET.fromstring(r.content).iter("item"):
        title = (it.findtext("title") or "").strip()
        link = (it.findtext("link") or "").strip()
        pub = (it.findtext("pubDate") or "").strip()
        try:
            date = parsedate_to_datetime(pub).astimezone(TZ).strftime("%Y-%m-%d")
        except (TypeError, ValueError):
            date = ""
        if title and link:
            items.append({"title": title, "url": link, "date": date})
        if len(items) >= limit:
            break
    return items


def fetch_rss():
    half = MAX_ITEMS // 2
    feeds = [("台灣", RSS_URL_TW, QUERY_TW), ("國際", RSS_URL_GLOBAL, QUERY_GLOBAL)]
    items, seen_urls, seen_titles, errors = [], set(), set(), 0
    for name, url_tpl, query in feeds:
        try:
            fetched = fetch_feed(url_tpl, query, half)
        except Exception as e:
            errors += 1
            print(f"WARN: {name} RSS 抓取失敗: {type(e).__name__}: {e}", file=sys.stderr)
            continue
        for a in fetched:
            if a["url"] in seen_urls or a["title"] in seen_titles:
                continue
            seen_urls.add(a["url"])
            seen_titles.add(a["title"])
            items.append(a)
    if errors == len(feeds):
        raise RuntimeError("台灣與國際 RSS 皆抓取失敗")
    return items


def summarize(articles, api_key):
    listing = "\n".join(
        f"{i}. [{a['date']}] {a['title']} | {a['url']}" for i, a in enumerate(articles, 1)
    )
    prompt = (
        f"以下是最新外送產業新聞列表，包含台灣在地與國際新聞。請均衡挑選 {PICK} 則對台灣外送員最具參考價值的新聞（台灣與國際兼顧），"
        "在地化翻譯並整理為台灣繁體中文（zh-TW）。\n"
        '只輸出 JSON 陣列，每個元素格式：{"title": 繁中標題, "summary": [2-3 點重點條列字串], '
        '"url": 原文網址（必須與列表一致）, "tag": 標籤（如 平台政策/國際動態/勞權爭議）, "date": "YYYY-MM-DD"}。\n'
        "不得輸出 JSON 以外的文字。\n\n" + listing
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2,
        },
    }
    r = requests.post(f"{GEMINI_ENDPOINT}?key={api_key}", json=payload,
                      headers={"Content-Type": "application/json"}, timeout=60)
    if not r.ok:
        print(f"Gemini API Error [{r.status_code}]: {r.text}", file=sys.stderr)
    r.raise_for_status()
    text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
    m = re.search(r"\[.*\]", text, re.S)
    data = json.loads(m.group(0) if m else text)
    valid = {a["url"]: a for a in articles}
    out = []
    for d in data:
        url = str(d.get("url", "")).strip()
        summ = d.get("summary")
        if isinstance(summ, str):
            summ = [summ]
        if not d.get("title") or not summ or not url.startswith("http"):
            continue
        out.append({
            "title": str(d["title"]).strip(),
            "summary": [str(s).strip() for s in summ][:3],
            "url": url,
            "tag": str(d.get("tag") or "國際動態").strip(),
            "date": str(d.get("date") or valid.get(url, {}).get("date", "")).strip(),
        })
    if not out:
        raise ValueError("模型未回傳有效新聞")
    return out[:PICK]


def write(payload):
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    try:
        if not api_key:
            raise RuntimeError("未設定 GEMINI_API_KEY")
        articles = fetch_rss()
        if not articles:
            raise RuntimeError("RSS 無結果")
        items = summarize(articles, api_key)
        write({"updatedAt": datetime.now(TZ).isoformat(timespec="seconds"),
               "source": "gemini-flash-lite", "items": items})
        print(f"OK: 已寫入 {len(items)} 則新聞")
    except Exception as e:  # 不中斷：保留舊檔
        print(f"WARN: {type(e).__name__}: {e}", file=sys.stderr)
        if not OUT.exists():
            fb = dict(FALLBACK, updatedAt=datetime.now(TZ).isoformat(timespec="seconds"))
            write(fb)
            print("已寫入預設備援資料", file=sys.stderr)
        else:
            print("維持既有 data/daily_news.json", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
