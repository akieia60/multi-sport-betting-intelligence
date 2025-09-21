import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Star, 
  Target, 
  Users, 
  TrendingUp, 
  Layers,
  Search,
  Filter,
  Crown,
  Zap,
  Share2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSlate } from "@/hooks/useSportsData";
import type { FilterState } from "@/lib/types";
import { FILTER_OPTIONS } from "@/lib/constants";

interface SidebarProps {
  selectedSport: string;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const navigation = [
  { name: "Prop Finder", href: "/", icon: BarChart3, current: true },
  { name: "Elite Players", href: "/elite-players", icon: Star },
  { name: "Attack Board", href: "/attack-board", icon: Target },
  { name: "Team Intel", href: "/team-intel", icon: Users },
  { name: "Game Zone", href: "/game-zone", icon: Zap },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Parlay Builder", href: "/parlay-builder", icon: Layers },
  { name: "Social Media", href: "/social-media", icon: Share2 },
];

export function Sidebar({ selectedSport, filters, onFiltersChange }: SidebarProps) {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: slateData } = useSlate(selectedSport);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 overflow-y-auto scrollbar-thin" data-testid="sidebar">
      <div className="p-4">
        {/* Search */}
        <div className="relative mb-6">
          <Input
            type="text"
            placeholder="Search players, teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-700 border-slate-600 pl-9"
            data-testid="input-search"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2 mb-8">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm font-medium text-slate-400 mb-3">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Usage Rate
              </label>
              <Select
                value={filters.usageRate}
                onValueChange={(value) => updateFilter("usageRate", value)}
              >
                <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-sm" data-testid="select-usage-rate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_OPTIONS.USAGE_RATE.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Opponent Rank
              </label>
              <Select
                value={filters.opponentRank}
                onValueChange={(value) => updateFilter("opponentRank", value)}
              >
                <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-sm" data-testid="select-opponent-rank">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_OPTIONS.OPPONENT_RANK.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Venue
              </label>
              <Select
                value={filters.venue}
                onValueChange={(value) => updateFilter("venue", value)}
              >
                <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-sm" data-testid="select-venue">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_OPTIONS.VENUE.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hot-streak"
                checked={filters.hotStreak}
                onCheckedChange={(checked) => updateFilter("hotStreak", checked)}
                data-testid="checkbox-hot-streak"
              />
              <label htmlFor="hot-streak" className="text-xs text-slate-400">
                Hot Streak (5+ games)
              </label>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <Card className="mt-8 bg-slate-700 border-slate-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Today's Slate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Games:</span>
              <span data-testid="text-games-count">
                {slateData?.games || 0}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Elite Edges:</span>
              <span className="text-green-400" data-testid="text-elite-count">
                {slateData?.eliteCount || 0}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">High Confidence:</span>
              <span className="text-yellow-400" data-testid="text-high-conf-count">
                {slateData?.highConfidenceCount || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Button */}
        <Link href="/subscription">
          <a className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" data-testid="button-upgrade">
            <Crown className="h-5 w-5" />
            <span>Upgrade to VIP</span>
          </a>
        </Link>
      </div>
    </aside>
  );
}
