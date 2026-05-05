#!/usr/bin/env python3
"""Offline deck enhancement pipeline.

Enhances low-quality or missing tip/example/hints fields using deterministic templates,
then writes before/after metrics to cfg/content_quality_metrics.json.

Usage:
  python3 scripts/enhance_cards.py
  python3 scripts/enhance_cards.py --dry-run
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import re
from pathlib import Path
from typing import Any, Dict, List

from quality_metrics import compute_metrics, load_json, build_matchers, is_blah, deck_metrics, aggregate


def normalize_card(card: Dict[str, Any]) -> Dict[str, Any]:
    key_order = ["id", "front", "back", "steps", "tip", "hints", "example"]
    out: Dict[str, Any] = {}
    for k in key_order:
        if k in card:
            out[k] = card[k]
    for k, v in card.items():
        if k not in out:
            out[k] = v
    return out


def clean_topic(front: Any) -> str:
    txt = re.sub(r"\s+", " ", str(front or "Concept").strip())
    return txt[:120]


def first_line(back: Any) -> str:
    for line in str(back or "").splitlines():
        line = line.strip()
        if line:
            return line
    return "Apply the key relationship"


def deck_context(deck_name: str, idx: int) -> str:
    lookup = {
        "algebra": ["phone-plan pricing", "budget planning", "break-even analysis"],
        "calculus": ["rate-of-change modeling", "optimization decisions", "motion analysis"],
        "geometry": ["layout planning", "material estimation", "measurement checks"],
        "trigonometry": ["angle-based navigation", "ramp/roof design", "signal direction checks"],
        "statistics": ["poll analysis", "A/B testing", "quality-control review"],
        "financial": ["loan planning", "interest comparison", "savings decisions"],
        "pre-algebra": ["shopping math", "ratio reasoning", "classroom projects"],
        "number sense": ["mental math checks", "quick estimation", "everyday arithmetic"],
        "math fun": ["puzzle solving", "pattern spotting", "strategy games"],
    }
    d = deck_name.lower()
    for key, values in lookup.items():
        if key in d:
            return values[idx % len(values)]
    return ["daily decisions", "planning tasks", "problem-solving workflows"][idx % 3]


def make_tip(card: Dict[str, Any], deck_name: str, idx: int) -> str:
    topic = clean_topic(card.get("front"))
    key = first_line(card.get("back"))[:95]
    variants = [
        f"Memory anchor for {topic}: write '{key}' first, then substitute values only after checking signs and units.",
        f"Exam strategy for {topic}: label what each symbol means before computing so setup errors are easier to catch.",
        f"Quick check for {topic}: confirm your final value matches the asked quantity and has a realistic scale."
    ]
    return variants[idx % len(variants)]


def make_example(card: Dict[str, Any], deck_name: str, idx: int) -> str:
    topic = clean_topic(card.get("front")).lower()
    ctx = deck_context(deck_name, idx)
    variants = [
        f"In {ctx}, {topic} helps build the right equation before plugging in numbers.",
        f"A practical use in {ctx} applies {topic} to compare options and justify decisions with math.",
        f"Teams working on {ctx} use {topic} to check whether results are realistic before acting."
    ]
    return variants[(idx + 1) % len(variants)]


def make_hints(card: Dict[str, Any], deck_name: str, idx: int) -> List[str]:
    topic = clean_topic(card.get("front"))
    key = first_line(card.get("back"))[:100]
    return [
        f"Start with the target in '{topic}' and identify exactly what value the prompt asks for.",
        f"Set up the key relationship before arithmetic: {key}",
        f"After calculating, verify sign, units, and scale to confirm the answer makes sense for {topic.lower()}."
    ]


def card_field_bad(card: Dict[str, Any], field: str, rules: Dict[str, Any], regexes: List[re.Pattern[str]]) -> bool:
    if field == "tip":
        return is_blah(card.get("tip"), "tip", rules, regexes)
    if field == "example":
        return is_blah(card.get("example"), "example", rules, regexes)
    hints = card.get("hints")
    if not isinstance(hints, list) or len(hints) < 3:
        return True
    return any(is_blah(h, "hint", rules, regexes) for h in hints[:3])


def update_metrics_history(metrics_path: Path, run: Dict[str, Any]) -> None:
    if metrics_path.exists():
        data = load_json(metrics_path)
    else:
        data = {
            "schemaVersion": 1,
            "description": "Historical before/after quality metrics for hints/examples/tips cleanup runs.",
            "history": [],
        }
    data.setdefault("history", []).append(run)
    with metrics_path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--decks", default="cfg/decks")
    parser.add_argument("--rules", default="cfg/content_quality_rules.json")
    parser.add_argument("--metrics", default="cfg/content_quality_metrics.json")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    decks_dir = Path(args.decks)
    rules = load_json(Path(args.rules))
    regexes = build_matchers(rules)

    before = compute_metrics(decks_dir, rules)
    replacements_by_deck: Dict[str, Dict[str, int]] = {}
    projected_after_by_deck: Dict[str, Dict[str, Any]] = {}

    for deck_file in sorted(decks_dir.glob("*.json")):
        deck = load_json(deck_file)
        cards = deck.get("cards", [])
        reps = {"tip": 0, "example": 0, "hints": 0}

        for card in cards:
            seed = int(hashlib.md5(str(card.get("id", card.get("front", ""))).encode()).hexdigest()[:8], 16)
            idx = seed % 3
            if card_field_bad(card, "tip", rules, regexes):
                card["tip"] = make_tip(card, deck.get("deck", ""), idx)
                reps["tip"] += 1
            if card_field_bad(card, "example", rules, regexes):
                card["example"] = make_example(card, deck.get("deck", ""), idx)
                reps["example"] += 1
            if card_field_bad(card, "hints", rules, regexes):
                card["hints"] = make_hints(card, deck.get("deck", ""), idx)
                reps["hints"] += 1

        replacements_by_deck[deck_file.name] = reps
        deck["cards"] = [normalize_card(c) for c in cards]
        projected_after_by_deck[deck_file.name] = deck_metrics(deck["cards"], rules, regexes)

        if not args.dry_run:
            with deck_file.open("w", encoding="utf-8") as f:
                json.dump(deck, f, ensure_ascii=False, indent=2)
                f.write("\n")

    if args.dry_run:
        after = {
            "byDeck": projected_after_by_deck,
            "aggregate": aggregate(projected_after_by_deck),
        }
    else:
        after = compute_metrics(decks_dir, rules)
    run = {
        "timestamp": dt.datetime.now(dt.timezone.utc).isoformat(),
        "mode": "dry-run" if args.dry_run else "apply",
        "pipeline": "offline-batch-template-enhancer",
        "beforeByDeck": before["byDeck"],
        "afterByDeck": after["byDeck"],
        "beforeAggregate": before["aggregate"],
        "afterAggregate": after["aggregate"],
        "replacementsByDeck": replacements_by_deck,
    }

    if not args.dry_run:
        update_metrics_history(Path(args.metrics), run)

    print(json.dumps(run, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
