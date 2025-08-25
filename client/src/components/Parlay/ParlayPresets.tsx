import React, { useEffect, useState } from "react";
import { sampleCombo } from "@/utils/random";
import type { Market, PickLeg } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shuffle, Plus, HelpCircle, ShoppingCart } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ParlayPresetsProps {
  selectedSport: string;
}

export default function ParlayPresets({ selectedSport }: ParlayPresetsProps) {
  const [market, setMarket] = useState<'ALL' | Market>('ALL');
  const [betType, setBetType] = useState<'ALL' | 'LONGSHOTS' | 'CONSERVATIVE' | 'BEST_PICKS'>('ALL');
  const [poolSize, setPoolSize] = useState<10 | 20>(20);
  const [pool, setPool] = useState<PickLeg[]>([]);
  const [presetN, setPresetN] = useState<3 | 4 | 5>(3);
  const [current, setCurrent] = useState<PickLeg[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOddsShopping, setShowOddsShopping] = useState(false);

  useEffect(() => { 
    load(); 
  }, [market, betType, poolSize, selectedSport]);

  async function load() {
    setLoading(true);
    try {
      const url = `/api/${selectedSport}/top-picks?pool=${poolSize}&market=${market}&betType=${betType}`;
      const response = await fetch(url);
      const data = await response.json();
      
      // Filter picks based on bet type
      let filteredPicks = data.items ?? [];
      if (betType === 'LONGSHOTS') {
        // High odds picks (+400 or higher)
        filteredPicks = filteredPicks.filter((pick: PickLeg) => pick.priceAmerican >= 400);
      } else if (betType === 'CONSERVATIVE') {
        // Lower odds picks (+200 or lower) with high confidence
        filteredPicks = filteredPicks.filter((pick: PickLeg) => pick.priceAmerican <= 200 && pick.confidence >= 80);
      } else if (betType === 'BEST_PICKS') {
        // Highest confidence picks regardless of odds
        filteredPicks = filteredPicks.filter((pick: PickLeg) => pick.confidence >= 85);
      }
      
      setPool(filteredPicks); 
      setCurrent([]);
    } catch (error) {
      console.error('Failed to load picks:', error);
      setPool([]);
      setCurrent([]);
    } finally {
      setLoading(false);
    }
  }

  const isValid = (sel: PickLeg[], cand: PickLeg) =>
    !(cand.riskFlags?.length) &&
    !sel.some(x => x.gameId === cand.gameId) &&
    !sel.some(x => x.gameId === cand.gameId && x.market === cand.market);

  const available = pool.filter(p => isValid([], p)).length;
  const disabled = (n: 3 | 4 | 5) => available < n;

  // Generate mock sportsbook odds for odds shopping
  const generateSportsbookOdds = (baseOdds: number) => {
    const sportsbooks = [
      { name: "DraftKings", color: "bg-green-600" },
      { name: "FanDuel", color: "bg-blue-600" },
      { name: "BetMGM", color: "bg-yellow-600" },
      { name: "Caesars", color: "bg-purple-600" },
      { name: "PointsBet", color: "bg-red-600" }
    ];

    return sportsbooks.map(book => {
      // Add some variance to the odds (-50 to +100 from base)
      const variance = Math.floor(Math.random() * 150) - 50;
      const adjustedOdds = Math.max(baseOdds + variance, -500); // Don't go below -500
      
      return {
        ...book,
        odds: adjustedOdds
      };
    }).sort((a, b) => b.odds - a.odds); // Sort by best odds first
  };

  function build(n: 3 | 4 | 5) { 
    setPresetN(n); 
    setCurrent(sampleCombo(pool, n, isValid)); 
  }

  function swipe() { 
    setCurrent(sampleCombo(pool, presetN, isValid)); 
  }

  function copyAnalysis() {
    if (current.length !== presetN) return alert(`Select ${presetN} legs`);
    
    // Create formatted analysis text for copying
    const analysisText = current.map((pick, i) => 
      `${i + 1}. ${pick.selection} (${pick.priceAmerican > 0 ? '+' : ''}${pick.priceAmerican}) - ${pick.reason}`
    ).join('\n');
    
    navigator.clipboard.writeText(`${presetN}-Pick Analysis:\n\n${analysisText}`);
    alert('Analysis copied to clipboard!');
  }

  function showReason(pick: PickLeg) {
    alert(`${pick.selection}\n\nReason: ${pick.reason}`);
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            3-Pick / 4-Pick / 5-Pick Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="space-y-4">
            {/* Bet Type Filters */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">Bet Style</label>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant={betType === 'ALL' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBetType('ALL')}
                  className={betType === 'ALL' ? "bg-blue-600" : "border-slate-600"}
                  data-testid="button-bet-all"
                >
                  All Picks
                </Button>
                <Button
                  variant={betType === 'LONGSHOTS' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBetType('LONGSHOTS')}
                  className={betType === 'LONGSHOTS' ? "bg-red-600" : "border-slate-600 text-red-400"}
                  data-testid="button-bet-longshots"
                >
                  🎯 Longshots
                </Button>
                <Button
                  variant={betType === 'CONSERVATIVE' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBetType('CONSERVATIVE')}
                  className={betType === 'CONSERVATIVE' ? "bg-green-600" : "border-slate-600 text-green-400"}
                  data-testid="button-bet-conservative"
                >
                  🛡️ Conservative
                </Button>
                <Button
                  variant={betType === 'BEST_PICKS' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBetType('BEST_PICKS')}
                  className={betType === 'BEST_PICKS' ? "bg-yellow-600" : "border-slate-600 text-yellow-400"}
                  data-testid="button-bet-best"
                >
                  ⭐ Best Picks
                </Button>
              </div>
            </div>

            {/* Odds Shopping Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  <ShoppingCart className="h-4 w-4 inline mr-1" />
                  Odds Shopping
                </label>
                <p className="text-xs text-slate-500">Compare prices across multiple sportsbooks</p>
              </div>
              <Switch
                checked={showOddsShopping}
                onCheckedChange={setShowOddsShopping}
                data-testid="toggle-odds-shopping"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <label className="block text-sm text-slate-300 mb-2">Market Filter</label>
                <Select value={market} onValueChange={(value) => setMarket(value as 'ALL' | Market)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Markets</SelectItem>
                    <SelectItem value="TEAM_MONEYLINE">Teams — Moneyline</SelectItem>
                    <SelectItem value="TEAM_SPREAD">Teams — Spread</SelectItem>
                    <SelectItem value="TEAM_TOTAL">Teams — Total</SelectItem>
                    <SelectItem value="PLAYER_2PLUS_TD">🏈 2+ Touchdowns</SelectItem>
                    <SelectItem value="PLAYER_400PLUS_PASS_YDS">🏈 400+ Pass Yards</SelectItem>
                    <SelectItem value="PLAYER_PASSING_YARDS">🏈 Passing Yards</SelectItem>
                    <SelectItem value="PLAYER_RUSHING_YARDS">🏈 Rushing Yards</SelectItem>
                    <SelectItem value="PLAYER_RECEIVING_YARDS">🏈 Receiving Yards</SelectItem>
                    <SelectItem value="PLAYER_TD">Props — Touchdowns</SelectItem>
                    <SelectItem value="PLAYER_HR">⚾ Home Runs</SelectItem>
                    <SelectItem value="PLAYER_4PLUS_RBI">⚾ 4+ RBIs</SelectItem>
                    <SelectItem value="PLAYER_RBI">Props — RBIs</SelectItem>
                    <SelectItem value="PLAYER_HITS">Props — Hits</SelectItem>
                    <SelectItem value="PLAYER_POINTS">🏀 Points</SelectItem>
                    <SelectItem value="PLAYER_ASSISTS">🏀 Assists</SelectItem>
                    <SelectItem value="PLAYER_REBOUNDS">🏀 Rebounds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Pool Size</label>
                <div className="flex gap-2">
                  <Button
                    variant={poolSize === 10 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPoolSize(10)}
                    className={poolSize === 10 ? "bg-blue-600" : "border-slate-600"}
                    data-testid="button-pool-10"
                  >
                    Top 10
                  </Button>
                  <Button
                    variant={poolSize === 20 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPoolSize(20)}
                    className={poolSize === 20 ? "bg-blue-600" : "border-slate-600"}
                    data-testid="button-pool-20"
                  >
                    Top 20
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-3 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={disabled(3) || loading}
                    onClick={() => build(3)}
                    className="py-6 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
                    data-testid="button-3-pick"
                  >
                    3-Pick
                  </Button>
                </TooltipTrigger>
                {disabled(3) && (
                  <TooltipContent>
                    <p>Not enough valid picks today</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={disabled(4) || loading}
                    onClick={() => build(4)}
                    className="py-6 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
                    data-testid="button-4-pick"
                  >
                    4-Pick
                  </Button>
                </TooltipTrigger>
                {disabled(4) && (
                  <TooltipContent>
                    <p>Not enough valid picks today</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={disabled(5) || loading}
                    onClick={() => build(5)}
                    className="py-6 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
                    data-testid="button-5-pick"
                  >
                    5-Pick
                  </Button>
                </TooltipTrigger>
                {disabled(5) && (
                  <TooltipContent>
                    <p>Not enough valid picks today</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Pool Status */}
          {!loading && (
            <div className="text-center text-slate-400 text-sm">
              {available} valid picks available from Top {poolSize} • {betType === 'ALL' ? 'All Bets' : betType === 'LONGSHOTS' ? 'Longshot Bets (+400)' : betType === 'CONSERVATIVE' ? 'Conservative Bets' : 'Best Picks'} • {market === 'ALL' ? 'All Markets' : market}
            </div>
          )}

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
              <div className="text-slate-400 text-sm">Loading picks...</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Selection */}
      {current.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your {presetN}-Pick Selection</span>
              <Badge className="bg-green-500 text-black">
                Top {poolSize} • {market === 'ALL' ? 'All' : market}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pick List */}
            <div className="space-y-3">
              {current.map((pick, index) => {
                const sportsbookOdds = showOddsShopping ? generateSportsbookOdds(pick.priceAmerican) : [];
                const bestOdds = sportsbookOdds.length > 0 ? sportsbookOdds[0] : null;

                return (
                  <div 
                    key={pick.id}
                    className="p-4 bg-slate-700 rounded-lg border-l-4 border-blue-500"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-white text-lg">
                          {index + 1}. {pick.selection}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">
                          {pick.league} • {pick.market.replace('_', ' ')} • Confidence: {Math.round(pick.confidence)}%
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {!showOddsShopping && (
                          <div className="text-right">
                            <Badge className={`text-lg font-bold px-3 py-1 ${
                              pick.priceAmerican >= 400 ? 'bg-red-600 text-white' : 
                              pick.priceAmerican <= 200 ? 'bg-green-600 text-white' : 
                              'bg-blue-600 text-white'
                            }`}>
                              {pick.priceAmerican > 0 ? `+${pick.priceAmerican}` : pick.priceAmerican}
                            </Badge>
                            <div className="text-xs text-slate-400 mt-1">
                              {pick.priceAmerican >= 400 ? '🎯 Longshot' : 
                               pick.priceAmerican <= 200 ? '🛡️ Safe' : 
                               '⚡ Balanced'}
                            </div>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showReason(pick)}
                          className="text-indigo-400 hover:text-indigo-300 h-auto p-1"
                          data-testid={`button-reason-${index}`}
                        >
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Odds Shopping Display */}
                    {showOddsShopping && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-300">
                            <ShoppingCart className="h-3 w-3 inline mr-1" />
                            Best Odds:
                          </span>
                          {bestOdds && (
                            <Badge className="bg-green-600 text-white font-bold">
                              {bestOdds.name}: {bestOdds.odds > 0 ? `+${bestOdds.odds}` : bestOdds.odds}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-5 gap-1 text-xs">
                          {sportsbookOdds.map((book, bookIndex) => (
                            <div
                              key={bookIndex}
                              className={`p-2 rounded text-center text-white ${
                                bookIndex === 0 ? 'bg-green-600 ring-2 ring-green-400' : book.color
                              }`}
                            >
                              <div className="font-bold truncate">{book.name}</div>
                              <div className="text-xs">
                                {book.odds > 0 ? `+${book.odds}` : book.odds}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-slate-500 text-center">
                          💰 Save {bestOdds && sportsbookOdds[sportsbookOdds.length - 1] 
                            ? Math.abs(bestOdds.odds - sportsbookOdds[sportsbookOdds.length - 1].odds) 
                            : 0} points with best odds
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={swipe}
                variant="outline"
                className="flex-1 border-slate-600 hover:bg-slate-700"
                data-testid="button-swipe"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Swipe
              </Button>
              <Button
                onClick={copyAnalysis}
                className="flex-1 bg-green-600 hover:bg-green-700"
                data-testid="button-copy-analysis"
              >
                <Plus className="h-4 w-4 mr-2" />
                Copy Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}