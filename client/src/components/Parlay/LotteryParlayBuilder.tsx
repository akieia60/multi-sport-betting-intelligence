import React, { useState, useEffect, useRef } from "react";
import { Shuffle, Sparkles, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useElitePlayers } from "@/hooks/useSportsData";

interface LotteryParlayBuilderProps {
  selectedSport: string;
}

interface FlashingPick {
  id: string;
  playerName: string;
  team: string;
  prop: string;
  line: string;
  edgeScore: number;
  confidence: number;
}

export function LotteryParlayBuilder({ selectedSport }: LotteryParlayBuilderProps) {
  const { data: elitePlayers } = useElitePlayers(selectedSport, 25);
  const [isFlashing, setIsFlashing] = useState(false);
  const [currentPicks, setCurrentPicks] = useState<FlashingPick[]>([]);
  const [finalPicks, setFinalPicks] = useState<FlashingPick[]>([]);
  const [flashCount, setFlashCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [parlaySize, setParlaySize] = useState(6);

  // Convert elite players to flashable picks
  const availablePicks = React.useMemo(() => {
    if (!elitePlayers) return [];
    
    return elitePlayers.map(edge => ({
      id: edge.id,
      playerName: `Player ${edge.playerId.split('-').pop()}`, // Extract player number/name
      team: edge.gameId?.split('-')?.[1] || 'Unknown Team',
      prop: edge.bestPropType || 'Multiple Props',
      line: edge.bestPropLine || 'TBD',
      edgeScore: parseFloat(edge.edgeScore),
      confidence: edge.confidence
    }));
  }, [elitePlayers]);

  // Generate random picks from available pool
  const generateRandomPicks = (size: number): FlashingPick[] => {
    if (availablePicks.length === 0) return [];
    
    const shuffled = [...availablePicks].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, size);
  };

  // Start the lottery flashing effect
  const startLottery = () => {
    if (availablePicks.length < parlaySize) return;
    
    setIsFlashing(true);
    setFlashCount(0);
    setFinalPicks([]);
    
    // Flash through random combinations rapidly
    intervalRef.current = setInterval(() => {
      setCurrentPicks(generateRandomPicks(parlaySize));
      setFlashCount(prev => prev + 1);
    }, 150); // Flash every 150ms for that slot machine feel
    
    // Stop after 3 seconds of flashing
    setTimeout(() => {
      stopLottery();
    }, 3000);
  };

  // Stop the lottery and set final picks
  const stopLottery = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsFlashing(false);
    
    // Generate final optimized picks (top edge scores)
    const finalSelection = generateRandomPicks(parlaySize);
    setFinalPicks(finalSelection);
    setCurrentPicks(finalSelection);
  };

  // Reset everything
  const resetLottery = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsFlashing(false);
    setCurrentPicks([]);
    setFinalPicks([]);
    setFlashCount(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const calculatePotentialPayout = (picks: FlashingPick[]): number => {
    if (picks.length === 0) return 0;
    
    // Simulate parlay odds based on confidence and edge scores
    const baseOdds = picks.map(pick => {
      const baseOdd = 1.8 + (pick.confidence / 5) * 0.5; // Higher confidence = better odds
      return baseOdd;
    });
    
    const totalOdds = baseOdds.reduce((acc, odd) => acc * odd, 1);
    return Math.round(totalOdds * 10); // Base $10 bet
  };

  return (
    <div className="space-y-6">
      {/* Lottery Controls */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <span>Lottery Parlay Builder</span>
            {isFlashing && (
              <Badge className="bg-yellow-500 text-black animate-pulse">
                FLASHING {flashCount}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Parlay Size:</span>
                <select 
                  value={parlaySize} 
                  onChange={(e) => setParlaySize(Number(e.target.value))}
                  className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
                  disabled={isFlashing}
                >
                  <option value={4}>4 Legs</option>
                  <option value={6}>6 Legs</option>
                  <option value={8}>8 Legs</option>
                  <option value={10}>10 Legs</option>
                </select>
              </div>
              
              <div className="text-sm text-slate-400">
                Available Picks: {availablePicks.length}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={startLottery}
                disabled={isFlashing || availablePicks.length < parlaySize}
                className="bg-purple-600 hover:bg-purple-700"
                data-testid="button-start-lottery"
              >
                <Play className="h-4 w-4 mr-2" />
                {isFlashing ? "Flashing..." : "Start Lottery"}
              </Button>
              
              {(isFlashing || finalPicks.length > 0) && (
                <Button
                  onClick={resetLottery}
                  variant="outline"
                  className="border-slate-600"
                  data-testid="button-reset-lottery"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flashing Picks Display */}
      {(currentPicks.length > 0 || isFlashing) && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <Shuffle className="h-5 w-5 text-green-400" />
                <span>
                  {isFlashing ? "🎰 Cycling Through Picks..." : "🎯 Your Generated Parlay"}
                </span>
              </CardTitle>
              {finalPicks.length > 0 && (
                <Badge className="bg-green-500 text-black">
                  Potential Payout: ${calculatePotentialPayout(finalPicks).toLocaleString()}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPicks.map((pick, index) => (
                <div
                  key={`${pick.id}-${index}`}
                  className={`p-4 rounded-lg border transition-all duration-150 ${
                    isFlashing 
                      ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400 animate-pulse' 
                      : 'bg-slate-700 border-slate-600'
                  }`}
                  data-testid={`lottery-pick-${index}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        {pick.playerName}
                      </div>
                      <div className="text-sm text-slate-400 mb-1">
                        {pick.team}
                      </div>
                      <div className="text-sm text-green-400 font-medium">
                        {pick.prop}
                      </div>
                      <div className="text-xs text-slate-500">
                        Line: {pick.line}
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <Badge 
                        className={`${
                          pick.edgeScore >= 80 ? 'bg-green-500' :
                          pick.edgeScore >= 70 ? 'bg-yellow-500 text-black' :
                          'bg-orange-500'
                        }`}
                      >
                        {Math.round(pick.edgeScore)}
                      </Badge>
                      <div className="text-xs text-slate-400">
                        {pick.confidence} ⭐
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {isFlashing && (
              <div className="mt-4 text-center">
                <div className="text-yellow-400 animate-bounce">
                  🎰 Mixing up the perfect combination...
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {availablePicks.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-8">
            <Sparkles className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              Loading Elite Players...
            </h3>
            <p className="text-slate-400">
              Waiting for betting data to calculate high-value picks
            </p>
          </CardContent>
        </Card>
      )}
      
      {availablePicks.length > 0 && currentPicks.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-8">
            <Play className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              Ready to Build Your Lottery Parlay!
            </h3>
            <p className="text-slate-400 mb-4">
              Hit "Start Lottery" to flash through {availablePicks.length} elite picks and build an optimized {parlaySize}-leg parlay.
            </p>
            <p className="text-xs text-slate-500">
              The system will cycle through top players rapidly, then lock in your perfect combination.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}