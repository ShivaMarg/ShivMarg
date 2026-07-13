"""
panchang_core.py
=================
Pure-Python port of the site's Maithili Panchang JS engine
(Meeus low-order Sun/Moon series + Lahiri ayanamsa).

Same accuracy class as the existing panchang.js (good to a few minutes
near tithi/nakshatra boundaries) -- NOT a replacement for a professional
jyotishi. Good enough for a display calendar / muhurat shortlist, not
for exact Lagna-level ritual timing.

Fixes applied vs the JS original:
  - calcMasa(): correct solar-rashi -> masa mapping (was off by one)
"""

import math
from datetime import date, datetime, timedelta

# ---------------------------------------------------------------- CONFIG ---
LAT = 26.17          # Darbhanga / Madhubani
LON = 86.00
TZ  = 5.5            # IST

# ------------------------------------------------------------ CONSTANTS ---
TITHI_NAMES = [
    'प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पञ्चमी',
    'षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी',
    'एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','पूर्णिमा',
    'प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पञ्चमी',
    'षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी',
    'एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','अमावस्या'
]
PAKSHA_NAMES = ['शुक्ल'] * 15 + ['कृष्ण'] * 15

NAKSHATRA_NAMES = [
    'अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशिरा',
    'आर्द्रा','पुनर्वसु','पुष्य','आश्लेषा','मघा',
    'पूर्वाफाल्गुनी','उत्तराफाल्गुनी','हस्त','चित्रा','स्वाति',
    'विशाखा','अनुराधा','ज्येष्ठा','मूल','पूर्वाषाढ़ा',
    'उत्तराषाढ़ा','श्रवण','धनिष्ठा','शतभिषा','पूर्वाभाद्र',
    'उत्तराभाद्र','रेवती'
]

YOGA_NAMES = [
    'विष्कम्भ','प्रीति','आयुष्मान्','सौभाग्य','शोभन',
    'अतिगण्ड','सुकर्मा','धृति','शूल','गण्ड',
    'वृद्धि','ध्रुव','व्याघात','हर्षण','वज्र',
    'सिद्धि','व्यतीपात','वरीयान्','परिघ','शिव',
    'सिद्ध','साध्य','शुभ','शुक्ल','ब्रह्म',
    'इन्द्र','वैधृति'
]
INAUSPICIOUS_YOGA = {'विष्कम्भ','अतिगण्ड','शूल','व्याघात','व्यतीपात','परिघ','वैधृति'}

KARANA_NAMES = ['बव','बालव','कौलव','तैतिल','गर','वणिज','विष्टि']
KARANA_FIXED = ['शकुनि','चतुष्पाद','नाग','किंस्तुघ्न']

RASHI_NAMES = ['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या',
               'तुला','वृश्चिक','धनु','मकर','कुम्भ','मीन']

# masa index 0..11, position = which solar rashi the Sun is in
# FIX: Chaitra = Sun in Meena (Pisces), not Mesha. Shift by +1.
MASA_NAMES = ['चैत','बैसाख','जेठ','आषाढ़','साओन','भादो',
              'आश्विन','कातिक','अगहन','पूस','माघ','फागुन']

VAAR_NAMES = ['रविवार','सोमवार','मंगलवार','बुधवार','बृहस्पतिवार','शुक्रवार','शनिवार']


# --------------------------------------------------------- JULIAN DAY -----
def julian_day(year, month, day, hour=12.0):
    if month <= 2:
        year -= 1
        month += 12
    a = math.floor(year / 100)
    b = 2 - a + math.floor(a / 4)
    return (math.floor(365.25 * (year + 4716)) +
            math.floor(30.6001 * (month + 1)) +
            day + hour / 24 + b - 1524.5)


def jd_from_date(d: date, hour_local=12.0):
    """hour_local is local (IST) clock hour; converted to UT internally."""
    return julian_day(d.year, d.month, d.day, hour_local - TZ)


# --------------------------------------------------------- SUN / MOON -----
def sun_longitude(jd):
    T = (jd - 2451545.0) / 36525
    L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
    M = math.radians(357.52911 + 35999.05029 * T - 0.0001537 * T * T)
    C = ((1.914602 - 0.004817 * T - 0.000014 * T * T) * math.sin(M)
         + (0.019993 - 0.000101 * T) * math.sin(2 * M)
         + 0.000289 * math.sin(3 * M))
    lon = (L0 + C) % 360
    return lon + 360 if lon < 0 else lon


def moon_longitude(jd):
    T = (jd - 2451545.0) / 36525
    L1 = (218.3164477 + 481267.88123421 * T - 0.0015786 * T * T) % 360
    D  = (297.8501921 + 445267.1114034 * T - 0.0018819 * T * T) % 360
    M  = (357.5291092 + 35999.0502909 * T - 0.0001536 * T * T) % 360
    Mp = (134.9633964 + 477198.8675055 * T + 0.0087414 * T * T) % 360
    F  = (93.2720950 + 483202.0175233 * T - 0.0036539 * T * T) % 360
    r = math.radians

    SL = (
        6.288774 * math.sin(r(Mp))
        + 1.274027 * math.sin(r(2*D - Mp))
        + 0.658314 * math.sin(r(2*D))
        + 0.213618 * math.sin(r(2*Mp))
        - 0.185116 * math.sin(r(M))
        - 0.114332 * math.sin(r(2*F))
        + 0.058793 * math.sin(r(2*D - 2*Mp))
        + 0.057066 * math.sin(r(2*D - M - Mp))
        + 0.053322 * math.sin(r(2*D + Mp))
        + 0.045758 * math.sin(r(2*D - M))
        - 0.040923 * math.sin(r(M - Mp))
        - 0.034720 * math.sin(r(D))
        - 0.030383 * math.sin(r(M + Mp))
        + 0.015327 * math.sin(r(2*D - 2*F))
        - 0.012528 * math.sin(r(Mp + 2*F))
        + 0.010980 * math.sin(r(Mp - 2*F))
        + 0.010675 * math.sin(r(4*D - Mp))
        + 0.010342 * math.sin(r(3*Mp))
        + 0.008548 * math.sin(r(4*D - 2*Mp))
        - 0.007888 * math.sin(r(2*D + M - Mp))
        - 0.006766 * math.sin(r(2*D + M))
        - 0.005163 * math.sin(r(D - Mp))
        + 0.004987 * math.sin(r(D + M))
        + 0.004036 * math.sin(r(2*D - M + Mp))
        + 0.003994 * math.sin(r(2*Mp + 2*D))
        + 0.003861 * math.sin(r(4*D))
        + 0.003665 * math.sin(r(2*D - 3*Mp))
        - 0.002689 * math.sin(r(M - 2*Mp))
        - 0.002602 * math.sin(r(Mp - 2*F + 2*D))
        + 0.002390 * math.sin(r(2*D - M - 2*Mp))
        - 0.002348 * math.sin(r(D + Mp))
        + 0.002236 * math.sin(r(2*D - 2*M))
        - 0.002120 * math.sin(r(M + 2*Mp))
        - 0.002069 * math.sin(r(2*M))
        + 0.002048 * math.sin(r(2*D - 2*M - Mp))
        - 0.001773 * math.sin(r(Mp + 2*D - 2*F))
        + 0.001215 * math.sin(r(4*D - M - Mp))
        - 0.001110 * math.sin(r(2*Mp + 2*F))
        - 0.000892 * math.sin(r(3*D - Mp))
        - 0.000811 * math.sin(r(M + Mp + 2*D))
        + 0.000761 * math.sin(r(4*D - M - 2*Mp))
        + 0.000717 * math.sin(r(Mp - M))
        + 0.000704 * math.sin(r(Mp - 2*M))
        + 0.000693 * math.sin(r(M - 2*Mp + 2*D))
        + 0.000598 * math.sin(r(2*D - M - 2*F))
        + 0.000550 * math.sin(r(Mp + 4*D))
        + 0.000538 * math.sin(r(4*Mp))
        + 0.000521 * math.sin(r(4*D - M))
        + 0.000486 * math.sin(r(2*Mp - D))
    )
    lon = (L1 + SL) % 360
    return lon + 360 if lon < 0 else lon


def ayanamsa(jd):
    T = (jd - 2451545.0) / 36525
    return 23.85 + 1.397 * T + 0.000139 * T * T


def sidereal_sun(jd):
    return (sun_longitude(jd) - ayanamsa(jd)) % 360


def sidereal_moon(jd):
    return (moon_longitude(jd) - ayanamsa(jd)) % 360


# --------------------------------------------------------- PANCHANG -------
def tithi_index(jd):
    diff = (sidereal_moon(jd) - sidereal_sun(jd)) % 360
    return int(diff // 12)


def nakshatra_index(jd):
    return int(sidereal_moon(jd) // (360 / 27))


def yoga_index(jd):
    s = (sidereal_moon(jd) + sidereal_sun(jd)) % 360
    return int(s // (360 / 27))


def karana_name(jd):
    diff = (sidereal_moon(jd) - sidereal_sun(jd)) % 360
    k = int(diff // 6)
    if k == 0:
        return KARANA_FIXED[3]
    if k >= 57:
        return KARANA_FIXED[k - 57]
    return KARANA_NAMES[(k - 1) % 7]


def masa_index(jd):
    """FIXED: Sun in Meena -> Chaitra (idx 0), Sun in Mesha -> Baisakh (idx 1)..."""
    sun_rashi = int(sidereal_sun(jd) // 30)
    return (sun_rashi + 1) % 12


def rashi_index(sid_lon):
    return int(sid_lon // 30)


# --------------------------------------------------------- SUNRISE --------
def sunrise_sunset(d: date, lat=LAT, lon=LON, tz=TZ):
    day_of_year = d.timetuple().tm_yday
    gamma = 2 * math.pi / 365 * (day_of_year - 1 + 0.5)
    decl = (0.006918 - 0.399912 * math.cos(gamma) + 0.070257 * math.sin(gamma)
            - 0.006758 * math.cos(2*gamma) + 0.000907 * math.sin(2*gamma)
            - 0.002697 * math.cos(3*gamma) + 0.00148 * math.sin(3*gamma))
    eqtime = 229.18 * (0.000075 + 0.001868 * math.cos(gamma) - 0.032077 * math.sin(gamma)
                        - 0.014615 * math.cos(2*gamma) - 0.04089 * math.sin(2*gamma))
    zenith = math.radians(90.833)
    lat_r = math.radians(lat)
    cos_ha = (math.cos(zenith) - math.sin(lat_r) * math.sin(decl)) / (math.cos(lat_r) * math.cos(decl))
    cos_ha = max(-1, min(1, cos_ha))
    ha = math.degrees(math.acos(cos_ha))
    sunrise_utc = 720 - 4 * (lon + ha) - eqtime
    sunset_utc = 720 - 4 * (lon - ha) - eqtime
    offset = tz * 60
    return (sunrise_utc + offset) / 60, (sunset_utc + offset) / 60


# --------------------------------------------------------- DAY PANCHANG ---
class DayPanchang:
    __slots__ = ('date','weekday','jd','tithi_idx','tithi_name','paksha',
                 'nakshatra_idx','nakshatra_name','yoga_idx','yoga_name',
                 'karana','masa_idx','masa_name','sun_rashi','moon_rashi',
                 'sunrise','sunset')

    def __init__(self, d: date):
        self.date = d
        self.weekday = d.weekday()  # Mon=0..Sun=6 (Python) -- convert below
        jd = jd_from_date(d, hour_local=6.0)  # sample at ~sunrise like the JS
        self.jd = jd

        self.tithi_idx = tithi_index(jd)
        self.tithi_name = TITHI_NAMES[self.tithi_idx]
        self.paksha = PAKSHA_NAMES[self.tithi_idx]

        self.nakshatra_idx = nakshatra_index(jd)
        self.nakshatra_name = NAKSHATRA_NAMES[self.nakshatra_idx]

        self.yoga_idx = yoga_index(jd)
        self.yoga_name = YOGA_NAMES[self.yoga_idx]

        self.karana = karana_name(jd)

        jd_noon = jd_from_date(d, hour_local=12.0)
        self.masa_idx = masa_index(jd_noon)
        self.masa_name = MASA_NAMES[self.masa_idx]

        self.sun_rashi = rashi_index(sidereal_sun(jd_noon))
        self.moon_rashi = rashi_index(sidereal_moon(jd_noon))

        self.sunrise, self.sunset = sunrise_sunset(d)

    @property
    def tithi_in_paksha(self):
        """0-14 position within the paksha (0=Pratipada...14=Purnima/Amavasya)"""
        return self.tithi_idx % 15

    @property
    def vaar_name(self):
        # python weekday(): Mon=0..Sun=6 -> convert to Sun=0..Sat=6 indexing used by VAAR_NAMES
        py_to_sun0 = (self.weekday + 1) % 7
        return VAAR_NAMES[py_to_sun0]

    def as_dict(self):
        return {
            "date": self.date.isoformat(),
            "vaar": self.vaar_name,
            "masa": self.masa_name,
            "paksha": self.paksha,
            "tithi": self.tithi_name,
            "nakshatra": self.nakshatra_name,
            "yoga": self.yoga_name,
            "karana": self.karana,
            "moon_rashi": RASHI_NAMES[self.moon_rashi],
            "sun_rashi": RASHI_NAMES[self.sun_rashi],
        }


def daterange(start: date, end: date):
    d = start
    while d <= end:
        yield d
        d += timedelta(days=1)


if __name__ == "__main__":
    # quick smoke test
    p = DayPanchang(date(2026, 7, 13))
    print(p.as_dict())