#!/usr/bin/env python3
"""Compute deck content quality metrics for tips/examples/hints.

Usage:
  python3 scripts/quality_metrics.py --decks cfg/decks --rules cfg/content_quality_rules.json
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any, Dict, List


def load_json(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def build_matchers(rules: Dict[str, Any]) -> List[re.Pattern[str]]:
    patterns = rules.get("regexPatterns", [])
    return [re.compile(p, re.IGNORECASE) for p in patterns]


def is_blah(text: Any, field: str, rules: Dict[str, Any], regexes: List[re.Pattern[str]]) -> bool:
    if text is None:
        return True
    s = str(text).strip()
    if not s:
        return True

    min_lengths = rules.get("minLengthByField", {})
    length_key = "hint" if field == "hint" else field
    min_len = int(min_lengths.get(length_key, 0))
    if len(s) < min_len:
        return True

    return any(rx.search(s) for rx in regexes)


def card_field_bad(card: Dict[str, Any], field: str, rules: Dict[str, Any], regexes: List[re.Pattern[str]]) -> bool:
    if field == "tip":
        return is_blah(card.get("tip"), "tip", rules, regexes)
    if field == "example":
        return is_blah(card.get("example"), "example", rules, regexes)

    hints = card.get("hints")
    if not isinstance(hints, list) or len(hints) < 3:
        return True
    return any(is_blah(h, "hint", rules, regexes) for h in hints[:3])


def deck_metrics(cards: List[Dict[str, Any]], rules: Dict[str, Any], regexes: List[re.Pattern[str]]) -> Dict[str, Any]:
    n = len(cards)
    tip = sum(1 for c in cards if card_field_bad(c, "tip", rules, regexes))
    ex = sum(1 for c in cards if card_field_bad(c, "example", rules, regexes))
    hints = sum(1 for c in cards if card_field_bad(c, "hints", rules, regexes))

    def pct(x: int) -> float:
        return round((x / n) * 100, 2) if n else 0.0

    return {
        "cards": n,
        "tip_missing_or_blah": tip,
        "example_missing_or_blah": ex,
        "hints_missing_or_blah": hints,
        "tip_missing_or_blah_pct": pct(tip),
        "example_missing_or_blah_pct": pct(ex),
        "hints_missing_or_blah_pct": pct(hints),
    }


def aggregate(by_deck: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    total_cards = sum(v["cards"] for v in by_deck.values())
    tip = sum(v["tip_missing_or_blah"] for v in by_deck.values())
    ex = sum(v["example_missing_or_blah"] for v in by_deck.values())
    hints = sum(v["hints_missing_or_blah"] for v in by_deck.values())

    def pct(x: int) -> float:
        return round((x / total_cards) * 100, 2) if total_cards else 0.0

    return {
        "cards": total_cards,
        "tip_missing_or_blah": tip,
        "example_missing_or_blah": ex,
        "hints_missing_or_blah": hints,
        "tip_missing_or_blah_pct": pct(tip),
        "example_missing_or_blah_pct": pct(ex),
        "hints_missing_or_blah_pct": pct(hints),
    }


def compute_metrics(decks_dir: Path, rules: Dict[str, Any]) -> Dict[str, Any]:
    regexes = build_matchers(rules)
    by_deck: Dict[str, Dict[str, Any]] = {}

    for deck_file in sorted(decks_dir.glob("*.json")):
        deck = load_json(deck_file)
        cards = deck.get("cards", [])
        by_deck[deck_file.name] = deck_metrics(cards, rules, regexes)

    return {
        "byDeck": by_deck,
        "aggregate": aggregate(by_deck),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--decks", default="cfg/decks")
    parser.add_argument("--rules", default="cfg/content_quality_rules.json")
    parser.add_argument("--output", default="")
    args = parser.parse_args()

    rules = load_json(Path(args.rules))
    result = compute_metrics(Path(args.decks), rules)

    if args.output:
        out = Path(args.output)
        out.parent.mkdir(parents=True, exist_ok=True)
        with out.open("w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
            f.write("\n")
    else:
        print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
