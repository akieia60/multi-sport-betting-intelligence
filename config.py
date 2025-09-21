#!/usr/bin/env python3
"""
NFL Analytics Empire - Professional Configuration
Brand identity and system settings
"""

import os
from dataclasses import dataclass

@dataclass
class Brand:
    """Brand configuration"""
    NAME = "NFL Edge Analytics"
    TAGLINE = "Data-Driven NFL Betting & Fantasy Intelligence"
    TWITTER = "@NFLEdgeAnalytics"
    PRIMARY_COLOR = "#1a1a1a"
    ACCENT_COLOR = "#00ff87"

@dataclass
class Schedule:
    """Automation schedule"""
    TUESDAY_WAIVER_TIME = "09:00"
    THURSDAY_PREVIEW_TIME = "10:00"
    SUNDAY_GAMEDAY_TIME = "08:00"

@dataclass
class Monetization:
    """Revenue tiers"""
    FREE = {'name': 'Community', 'price': 0}
    STANDARD = {'name': 'Edge Access', 'price': 19.99}
    VIP = {'name': 'Elite Edge', 'price': 49.99}

BRAND = Brand()
SCHEDULE = Schedule()
MONETIZATION = Monetization()
