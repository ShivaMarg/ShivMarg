"""
muhurat_engine.py
==================
Rule-based muhurat shortlist generator for Vivah (marriage), Mundan
(tonsure) and Upanayan (sacred thread) samskaras.

IMPORTANT / HONEST LIMITATIONS (read before trusting output for a real
ritual date):
  - This does NOT check Lagna (ascendant) shuddhi, Tara Bala, Chandra
    Bala, or Venus/Jupiter combustion (Shukra/Guru Asta) -- all of
    which a real Vivah Muhurat calculation (e.g. Drik Panchang) applies.
    That's why some dates below may still not match a professional
    panchang exactly.
  - Sun/Moon positions use the same truncated low-order series as the
    site's existing panchang.js, good to within minutes -- fine for a
    calendar app, not for exact ritual timing.
  - Treat this as a "reasonable shortlist to sanity-check against a
    real panchang / astrologer," not a final authority.

Usage:
    python3 muhurat_engine.py 2026 2027 -> writes muhurat_data.json
"""

import sys
import json
from datetime import date

from panchang_core import DayPanchang, MASA_NAMES, VAAR_NAMES
from calendar_rules import build_year_panchang, compute_adhik_maas_days, is_chaturmas

# ---------------------------------------------------------- RULE SETS -----

RIKTA_TITHI_POSITIONS = {3, 8, 13}          # 4th, 9th, 14th of each paksha (0-indexed)
AMAVASYA_POSITION = 14                      # tithi_in_paksha for Krishna paksha's 15th day
INAUSPICIOUS_YOGA = {'विष्कम्भ', 'अतिगण्ड', 'शूल', 'व्याघात', 'व्यतीपात', 'परिघ', 'वैधृति'}

VIVAH_NAKSHATRA = {
    'रोहिणी', 'मृगशिरा', 'मघा', 'उत्तराफाल्गुनी', 'हस्त', 'स्वाति',
    'अनुराधा', 'मूल', 'उत्तराषाढ़ा', 'उत्तराभाद्र', 'रेवती'
}

MUNDAN_NAKSHATRA = {
    'अश्विनी', 'रोहिणी', 'मृगशिरा', 'हस्त', 'पुष्य', 'श्रवण',
    'पुनर्वसु', 'अनुराधा'
}

UPANAYAN_NAKSHATRA = {
    'अश्विनी', 'मृगशिरा', 'पुनर्वसु', 'पुष्य', 'हस्त', 'चित्रा',
    'स्वाति', 'अनुराधा', 'उत्तराफाल्गुनी', 'उत्तराषाढ़ा', 'उत्तराभाद्र', 'रेवती'
}
UPANAYAN_PREFERRED_MASA = {MASA_NAMES.index('माघ'), MASA_NAMES.index('फागुन'),
                            MASA_NAMES.index('चैत'), MASA_NAMES.index('बैसाख')}
UPANAYAN_PREFERRED_VAAR = {'बृहस्पतिवार', 'सोमवार', 'शुक्रवार'}


def is_rikta_or_amavasya(dp: DayPanchang) -> bool:
    pos = dp.tithi_in_paksha
    if dp.paksha == 'कृष्ण' and pos == AMAVASYA_POSITION:
        return True
    return pos in RIKTA_TITHI_POSITIONS


def base_shuddhi_ok(dp: DayPanchang, adhik_days: set, check_chaturmas: bool) -> bool:
    """Filters common to all three samskaras."""
    if dp.date in adhik_days:
        return False
    if check_chaturmas and is_chaturmas(dp):
        return False
    if is_rikta_or_amavasya(dp):
        return False
    if dp.yoga_name in INAUSPICIOUS_YOGA:
        return False
    if dp.karana == 'विष्टि':   # Bhadra
        return False
    return True


DHANU_RASHI_IDX = 8   # Sagittarius
MEENA_RASHI_IDX = 11  # Pisces


def is_kharmas(dp: DayPanchang) -> bool:
    """Malamas/Kharmas: Sun in Dhanu or Meena -- excluded for Vivah only."""
    return dp.sun_rashi in (DHANU_RASHI_IDX, MEENA_RASHI_IDX)


def scan_vivah(days: dict, year: int, adhik_days: set):
    out = []
    for d, dp in sorted(days.items()):
        if d.year != year:
            continue
        if not base_shuddhi_ok(dp, adhik_days, check_chaturmas=True):
            continue
        if is_kharmas(dp):
            continue
        if dp.nakshatra_name not in VIVAH_NAKSHATRA:
            continue
        if dp.vaar_name == 'मंगलवार':   # Tuesday soft-excluded (common convention)
            continue
        entry = dp.as_dict()
        entry['note'] = 'शुभ विवाह मुहूर्त (Panchang Shuddhi only -- Lagna/Tara/Chandra Bala not checked)'
        out.append(entry)
    return out


def scan_mundan(days: dict, year: int, adhik_days: set):
    out = []
    for d, dp in sorted(days.items()):
        if d.year != year:
            continue
        if not base_shuddhi_ok(dp, adhik_days, check_chaturmas=False):
            continue
        if dp.nakshatra_name not in MUNDAN_NAKSHATRA:
            continue
        entry = dp.as_dict()
        entry['note'] = 'शुभ मुड़न मुहूर्त'
        out.append(entry)
    return out


def scan_upanayan(days: dict, year: int, adhik_days: set):
    out = []
    for d, dp in sorted(days.items()):
        if d.year != year:
            continue
        if not base_shuddhi_ok(dp, adhik_days, check_chaturmas=False):
            continue
        if dp.nakshatra_name not in UPANAYAN_NAKSHATRA:
            continue
        if dp.masa_idx not in UPANAYAN_PREFERRED_MASA:
            continue
        if dp.vaar_name not in UPANAYAN_PREFERRED_VAAR:
            continue
        entry = dp.as_dict()
        entry['note'] = 'शुभ उपनयन मुहूर्त'
        out.append(entry)
    return out


def build_json_for_years(years):
    result = {}
    for year in years:
        days = build_year_panchang(year)
        adhik_days = compute_adhik_maas_days(days, year)
        result[str(year)] = {
            "adhik_maas_range": [min(adhik_days).isoformat(), max(adhik_days).isoformat()] if adhik_days else None,
            "vivah_muhurat": scan_vivah(days, year, adhik_days),
            "mundan_muhurat": scan_mundan(days, year, adhik_days),
            "upanayan_muhurat": scan_upanayan(days, year, adhik_days),
        }
    return result


if __name__ == "__main__":
    years = [int(y) for y in sys.argv[1:]] or [2026]
    data = build_json_for_years(years)
    with open("muhurat_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    for y in years:
        print(f"\n=== {y} ===")
        print("Adhik Maas:", data[str(y)]["adhik_maas_range"])
        print("Vivah dates:", len(data[str(y)]["vivah_muhurat"]))
        for e in data[str(y)]["vivah_muhurat"][:40]:
            print(" ", e["date"], e["vaar"], e["masa"], e["paksha"], e["tithi"], e["nakshatra"])
        print("Mundan dates:", len(data[str(y)]["mundan_muhurat"]))
        print("Upanayan dates:", len(data[str(y)]["upanayan_muhurat"]))

    print("\nWrote muhurat_data.json")