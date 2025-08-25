export const SPORTS = {
  NFL: {
    id: "nfl", 
    name: "NFL",
    displayName: "National Football League",
    colorCode: "#10B981",
    icon: "fas fa-football-ball"
  },
  MLB: {
    id: "mlb",
    name: "MLB",
    displayName: "Major League Baseball",
    colorCode: "#3B82F6",
    icon: "fas fa-baseball-ball"
  },
  NBA: {
    id: "nba",
    name: "NBA", 
    displayName: "National Basketball Association",
    colorCode: "#F59E0B",
    icon: "fas fa-basketball-ball"
  }
} as const;

export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: "Free",
    gamesPerDay: 1,
    refreshRate: "delayed",
    features: ["Basic slate view", "Limited game access"]
  },
  STANDARD: {
    name: "Standard", 
    gamesPerDay: "unlimited",
    refreshRate: "2-hourly",
    features: ["Full slate access", "Player analytics", "Basic filters"]
  },
  VIP: {
    name: "VIP",
    gamesPerDay: "unlimited", 
    refreshRate: "real-time",
    features: ["All features", "Parlay Builder", "Premium alerts", "Early access"]
  }
} as const;

export const PARLAY_CONFIGS = {
  CONSERVATIVE: {
    legCount: 4,
    targetPayout: 50000,
    riskTolerance: "conservative",
    minConfidence: 4,
    maxCorrelation: 0.3
  },
  BALANCED: {
    legCount: 6,
    targetPayout: 100000, 
    riskTolerance: "balanced",
    minConfidence: 3,
    maxCorrelation: 0.5
  },
  AGGRESSIVE: {
    legCount: 8,
    targetPayout: 1000000,
    riskTolerance: "aggressive", 
    minConfidence: 2,
    maxCorrelation: 0.7
  }
} as const;

export const FILTER_OPTIONS = {
  USAGE_RATE: [
    { value: "all", label: "All Players" },
    { value: "high", label: "High (>25%)" },
    { value: "medium", label: "Medium (15-25%)" },
    { value: "low", label: "Low (<15%)" }
  ],
  OPPONENT_RANK: [
    { value: "all", label: "All Teams" },
    { value: "top10", label: "Top 10 (Hardest)" },
    { value: "mid", label: "11-20" },
    { value: "bottom10", label: "Bottom 10 (Easiest)" }
  ],
  VENUE: [
    { value: "all", label: "All Venues" },
    { value: "home", label: "Home" },
    { value: "away", label: "Away" },
    { value: "dome", label: "Dome/Indoor" }
  ]
} as const;

export const PROP_TYPES = {
  MLB: [
    "Total Bases",
    "Hits", 
    "RBIs",
    "Runs",
    "Home Runs",
    "Strikeouts"
  ],
  NFL: [
    "Receiving Yards",
    "Rushing Yards", 
    "Receptions",
    "Passing TDs",
    "Rushing TDs"
  ],
  NBA: [
    "Points",
    "Rebounds", 
    "Assists",
    "3-Pointers",
    "Steals",
    "Blocks"
  ]
} as const;

export const CONFIDENCE_STARS = [
  { min: 90, stars: 5, color: "text-yellow-400" },
  { min: 80, stars: 4, color: "text-yellow-400" },
  { min: 70, stars: 3, color: "text-yellow-400" },
  { min: 60, stars: 2, color: "text-slate-400" },
  { min: 0, stars: 1, color: "text-slate-400" }
];

export const REFRESH_INTERVALS = {
  REAL_TIME: 30000, // 30 seconds
  STANDARD: 7200000, // 2 hours
  GAME_DAY: 3600000, // 1 hour
  DELAYED: 14400000 // 4 hours
} as const;
