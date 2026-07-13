"""
calendar_rules.py
==================
Adhik Maas (leap lunar month) and Chaturmas detection, built on top of
panchang_core. These are needed because Vivah/Mundan/Upanayan muhurat
must exclude both windows.

Adhik Maas definition used here (standard definition):
  A lunar month (Amavasya to Amavasya) is "Adhik" (leap) if the Sun does
  NOT cross into a new rashi (i.e. no Sankranti) during that window.
  We detect this by scanning day-by-day for Amavasya (tithi index 29->0
  rollover) and comparing the Sun's rashi at consecutive Amavasyas.

  This is a day-resolution approximation (not minute-exact), which is
  fine for a calendar/muhurat shortlist but not for exact ritual timing.

Chaturmas definition used here:
  Ashadha Shukla Ekadashi  ->  Kartik Shukla Ekadashi
  Approximated via masa_idx + paksha + tithi_in_paksha rather than a
  separate calculation.
"""

from datetime import date, timedelta
from panchang_core import DayPanchang, daterange, MASA_NAMES

ASHADH = MASA_NAMES.index('आषाढ़')   # 3
KATIK  = MASA_NAMES.index('कातिक')   # 7


def build_year_panchang(year: int, pad_days=20):
    """Compute DayPanchang for every day of `year`, with a few days of
    padding on both ends so month-boundary detection near Jan 1 / Dec 31
    doesn't break."""
    start = date(year, 1, 1) - timedelta(days=pad_days)
    end = date(year, 12, 31) + timedelta(days=pad_days)
    days = {}
    for d in daterange(start, end):
        days[d] = DayPanchang(d)
    return days


def find_amavasya_dates(days: dict):
    """Return sorted list of dates whose tithi_idx == 29 (Amavasya) --
    but only the FIRST day of each Amavasya tithi run (since a tithi
    can span parts of 2 solar days)."""
    dates = sorted(days.keys())
    amavasya_dates = []
    prev_was_amavasya = False
    for d in dates:
        is_am = days[d].tithi_idx == 29
        if is_am and not prev_was_amavasya:
            amavasya_dates.append(d)
        prev_was_amavasya = is_am
    return amavasya_dates


def compute_adhik_maas_days(days: dict, year: int):
    """Return a set of dates (within `year`) that fall inside an Adhik
    Maas (leap lunar month)."""
    amavasya_dates = find_amavasya_dates(days)
    adhik_days = set()

    for i in range(len(amavasya_dates) - 1):
        start_am = amavasya_dates[i]
        end_am = amavasya_dates[i + 1]
        sun_rashi_start = days[start_am].sun_rashi
        sun_rashi_end = days[end_am].sun_rashi
        # No sankranti occurred during this lunar month => Adhik Maas
        if sun_rashi_start == sun_rashi_end:
            d = start_am
            while d < end_am:
                if d.year == year:
                    adhik_days.add(d)
                d += timedelta(days=1)

    return adhik_days


def is_chaturmas(dp: DayPanchang) -> bool:
    """Devshayani Ekadashi (Ashadh Shukla 11) -> Devutthana Ekadashi
    (Kartik Shukla 11), approximated via masa/paksha/tithi."""
    if dp.masa_idx == ASHADH and dp.paksha == 'शुक्ल' and dp.tithi_in_paksha >= 10:
        return True
    if dp.masa_idx in (ASHADH + 1, ASHADH + 2, ASHADH + 3):  # Saon, Bhado, Ashwin
        return True
    if dp.masa_idx == KATIK and not (dp.paksha == 'शुक्ल' and dp.tithi_in_paksha >= 10):
        return True
    return False


if __name__ == "__main__":
    days = build_year_panchang(2026)
    adhik = compute_adhik_maas_days(days, 2026)
    if adhik:
        print(f"Adhik Maas 2026: {min(adhik)} to {max(adhik)}  ({len(adhik)} days)")
    else:
        print("No Adhik Maas detected in 2026")

    # sanity check against Drik Panchang's confirmed window: ~May 17 - Jun 14 2026
    chat_days = [d for d, dp in days.items() if d.year == 2026 and is_chaturmas(dp)]
    if chat_days:
        print(f"Chaturmas 2026: {min(chat_days)} to {max(chat_days)}")