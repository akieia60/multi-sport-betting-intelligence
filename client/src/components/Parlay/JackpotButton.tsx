import React, { useEffect, useRef, useState } from 'react';
import { Zap, Shuffle, Plus, Trophy, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Candidate = { 
  legIds: string[]; 
  payout: number; 
  decimalProduct: number; 
  estHitProb: number; 
  legs: Leg[];
};

type Leg = {
  id: string;
  gameId: string;
  market: 'H2H' | 'Total' | 'Prop';
  selection: string;
  priceDecimal: number;
  edgeScore: number;
  startTime: string;
  playerName?: string;
  teamName?: string;
  propType?: string;
  line?: string;
};

interface JackpotButtonProps {
  tier: '50k' | '100k' | '1M';
  stake?: number;
  selectedSport: string;
  onLockIn: (candidate: Candidate) => void;
}

export default function JackpotButton({
  tier = '1M',
  stake = 10,
  selectedSport,
  onLockIn,
}: JackpotButtonProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [current, setCurrent] = useState<Candidate | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | null>(null);

  const tierColors = {
    '50k': 'bg-blue-600 text-white border-blue-500',
    '100k': 'bg-yellow-600 text-white border-yellow-500', 
    '1M': 'bg-red-600 text-white border-red-500'
  };

  const tierLabels = {
    '50k': '$50K',
    '100k': '$100K',
    '1M': '$1M'
  };

  async function fetchCandidates() {
    setLoading(true);
    try {
      const response = await fetch(`/api/${selectedSport}/jackpot-candidates?tier=${tier}&stake=${stake}`);
      const data = await response.json();
      setCandidates(data.candidates ?? []);
      console.log(`Fetched ${data.candidates?.length || 0} jackpot candidates for ${tier}`);
    } catch (error) {
      console.error('Failed to fetch jackpot candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    fetchCandidates(); 
  }, [tier, stake, selectedSport]);

  function startSpin() {
    if (!candidates.length || spinning) return;
    
    setSpinning(true);
    let i = 0;
    let ticks = 0;
    const duration = 1800; // 1.8s spin
    const interval = 80; // Flash every 80ms
    
    timer.current = window.setInterval(() => {
      setCurrent(candidates[i % candidates.length]);
      i++; 
      ticks += interval;
      
      if (ticks >= duration) {
        stopSpin();
      }
    }, interval);
  }

  function stopSpin() {
    if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    setSpinning(false);
    
    // Lock in a high-value candidate (not just the last flashed one)
    if (candidates.length > 0) {
      const bestCandidate = candidates[Math.floor(Math.random() * Math.min(5, candidates.length))]; // Top 5 random
      setCurrent(bestCandidate);
    }
  }

  function handleLockIn() {
    if (current) {
      onLockIn(current);
    }
  }

  // Format large numbers
  function formatPayout(amount: number): string {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `$${amount.toFixed(0)}`;
    }
  }

  return (
    <div className="space-y-4">
      {/* Main Jackpot Button */}
      <Card className={`${tierColors[tier]} border-2 transition-all duration-300 ${spinning ? 'animate-pulse shadow-lg' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6" />
              <span>Jackpot Builder</span>
            </div>
            <Badge className="bg-white/20 text-white">
              {tierLabels[tier]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{tierLabels[tier]}</div>
              <div className="text-sm opacity-80">Target Payout</div>
            </div>
            
            <Button
              className="w-full h-12 text-lg font-semibold bg-white/20 hover:bg-white/30 border border-white/30"
              onClick={startSpin}
              disabled={spinning || loading || candidates.length === 0}
              data-testid={`button-jackpot-${tier}`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Loading...</span>
                </div>
              ) : spinning ? (
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 animate-bounce" />
                  <span>🎰 Building your {tierLabels[tier]} parlay...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Build {tierLabels[tier]} Jackpot</span>
                </div>
              )}
            </Button>
            
            <div className="text-xs text-center opacity-70">
              ${stake} stake • {candidates.length} candidates available
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Candidate Display */}
      {current && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <span>Generated Jackpot</span>
              </div>
              <Badge className="bg-green-500 text-black">
                {formatPayout(current.payout)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Payout Details */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-slate-700 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {formatPayout(current.payout)}
                  </div>
                  <div className="text-xs text-slate-400">Projected Payout</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {current.legs.length}
                  </div>
                  <div className="text-xs text-slate-400">Legs</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">
                    {(current.estHitProb * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-400">Est. Hit Rate</div>
                </div>
              </div>

              {/* Sample Legs Preview */}
              <div>
                <div className="text-sm font-medium mb-2">Sample Legs:</div>
                <div className="space-y-2">
                  {current.legs.slice(0, 3).map((leg, index) => (
                    <div 
                      key={leg.id}
                      className="flex justify-between items-center p-2 bg-slate-700 rounded text-sm"
                    >
                      <div>
                        <div className="font-medium">{leg.playerName}</div>
                        <div className="text-slate-400">{leg.propType} {leg.line}</div>
                      </div>
                      <Badge className="bg-green-500 text-black text-xs">
                        {Math.round(leg.edgeScore)}
                      </Badge>
                    </div>
                  ))}
                  {current.legs.length > 3 && (
                    <div className="text-center text-slate-400 text-xs">
                      + {current.legs.length - 3} more legs...
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600"
                  onClick={startSpin}
                  disabled={spinning}
                  data-testid="button-shuffle-jackpot"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Shuffle
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleLockIn}
                  data-testid="button-add-jackpot"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Slip
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Candidates Available */}
      {!loading && candidates.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              No Jackpot Candidates Available
            </h3>
            <p className="text-slate-400 text-sm">
              Not enough high-quality edges to build a {tierLabels[tier]} parlay right now. 
              Try a lower tier or wait for more data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}