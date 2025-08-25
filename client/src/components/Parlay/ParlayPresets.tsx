import React, { useEffect, useState } from "react";
import { sampleCombo } from "@/utils/random";
import type { Market, PickLeg } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shuffle, Plus, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ParlayPresetsProps {
  selectedSport: string;
}

export default function ParlayPresets({ selectedSport }: ParlayPresetsProps) {
  const [market, setMarket] = useState<'ALL' | Market>('ALL');
  const [poolSize, setPoolSize] = useState<10 | 20>(20);
  const [pool, setPool] = useState<PickLeg[]>([]);
  const [presetN, setPresetN] = useState<3 | 4 | 5>(3);
  const [current, setCurrent] = useState<PickLeg[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    load(); 
  }, [market, poolSize, selectedSport]);

  async function load() {
    setLoading(true);
    try {
      const url = `/api/${selectedSport}/top-picks?pool=${poolSize}&market=${market}`;
      const response = await fetch(url);
      const data = await response.json();
      setPool(data.items ?? []); 
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

  function build(n: 3 | 4 | 5) { 
    setPresetN(n); 
    setCurrent(sampleCombo(pool, n, isValid)); 
  }

  function swipe() { 
    setCurrent(sampleCombo(pool, presetN, isValid)); 
  }

  function addToSlip() {
    if (current.length !== presetN) return alert(`Select ${presetN} legs`);
    window.dispatchEvent(new CustomEvent('ADD_TO_SLIP', { detail: current }));
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
                  <SelectItem value="PLAYER_TD">Props — TD</SelectItem>
                  <SelectItem value="PLAYER_HR">Props — HR</SelectItem>
                  <SelectItem value="PLAYER_RBI">Props — RBI</SelectItem>
                  <SelectItem value="PLAYER_HITS">Props — Hits</SelectItem>
                  <SelectItem value="PLAYER_POINTS">Props — Points</SelectItem>
                  <SelectItem value="PLAYER_ASSISTS">Props — Assists</SelectItem>
                  <SelectItem value="PLAYER_REBOUNDS">Props — Rebounds</SelectItem>
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
              {available} valid picks available from Top {poolSize} ({market === 'ALL' ? 'All Markets' : market})
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
              {current.map((pick, index) => (
                <div 
                  key={pick.id}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {index + 1}. {pick.selection}
                    </div>
                    <div className="text-sm text-slate-400">
                      {pick.league} • {pick.market.replace('_', ' ')} • Confidence: {Math.round(pick.confidence)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-500 text-white text-xs">
                      {pick.priceAmerican > 0 ? `+${pick.priceAmerican}` : pick.priceAmerican}
                    </Badge>
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
              ))}
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
                onClick={addToSlip}
                className="flex-1 bg-green-600 hover:bg-green-700"
                data-testid="button-add-to-slip"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Slip
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}