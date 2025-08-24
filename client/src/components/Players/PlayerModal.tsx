import React from "react";
import { X, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlayer } from "@/hooks/useSportsData";
import { PerformanceChart } from "../Charts/PerformanceChart";

interface PlayerModalProps {
  playerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToParlay?: (playerId: string) => void;
}

export function PlayerModal({ playerId, isOpen, onClose, onAddToParlay }: PlayerModalProps) {
  const { data: playerData, isLoading } = usePlayer(playerId || "");

  if (!playerId) return null;

  const handleAddToParlay = () => {
    if (playerId && onAddToParlay) {
      onAddToParlay(playerId);
    }
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const formatEdgeComponent = (value?: string) => {
    if (!value) return "N/A";
    const numValue = parseFloat(value);
    const sign = numValue >= 0 ? "+" : "";
    return `${sign}${numValue.toFixed(1)}`;
  };

  const getComponentColor = (value?: string) => {
    if (!value) return "text-slate-400";
    const numValue = parseFloat(value);
    if (numValue > 1) return "text-green-400";
    if (numValue > 0) return "text-yellow-400";
    return "text-red-400";
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!playerData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
          <div className="text-center p-8">
            <p className="text-slate-400">Player data not available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { player, currentEdge, recentStats } = playerData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700" data-testid="modal-player">
        {/* Modal Header */}
        <DialogHeader className="border-b border-slate-700 pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center text-lg font-bold"
                data-testid="player-avatar-large"
              >
                {getInitials(player.name)}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold" data-testid="text-player-name-modal">
                  {player.name}
                </DialogTitle>
                <p className="text-slate-400" data-testid="text-player-team-position">
                  {player.teamId} • {player.position}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Modal Content */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Edge Breakdown */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg">Edge Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentEdge && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Pitch Match Edge</span>
                      <span className={`font-semibold ${getComponentColor(currentEdge.pitchMatchEdge)}`}>
                        {formatEdgeComponent(currentEdge.pitchMatchEdge)} (vs LHP)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Recent Form</span>
                      <span className={`font-semibold ${getComponentColor(currentEdge.recentForm)}`}>
                        {formatEdgeComponent(currentEdge.recentForm)} (7 game streak)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Slot Vulnerability</span>
                      <span className={`font-semibold ${getComponentColor(currentEdge.slotVulnerability)}`}>
                        {formatEdgeComponent(currentEdge.slotVulnerability)} (vs 3rd slot)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Environment</span>
                      <span className={`font-semibold ${getComponentColor(currentEdge.environmentBoost)}`}>
                        {formatEdgeComponent(currentEdge.environmentBoost)} (wind boost)
                      </span>
                    </div>
                    <div className="border-t border-slate-600 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">Total Edge Score</span>
                        <div 
                          className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white"
                          data-testid="total-edge-score"
                        >
                          {Math.round(parseFloat(currentEdge.edgeScore))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Performance Chart */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg">Last 10 Games</CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceChart data={recentStats} />
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-slate-400">Avg OPS</div>
                    <div className="font-semibold" data-testid="stat-avg-ops">1.247</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">HR Rate</div>
                    <div className="font-semibold" data-testid="stat-hr-rate">15.2%</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">xBA</div>
                    <div className="font-semibold" data-testid="stat-xba">.389</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opponent Splits */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg">vs Opposing Pitcher</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">vs LHP Career</span>
                  <span data-testid="stat-vs-lhp">.312 AVG, 1.024 OPS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">vs This Pitcher</span>
                  <span data-testid="stat-vs-pitcher">3-for-8, 2 HR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">At This Venue</span>
                  <span data-testid="stat-at-venue">.298 AVG (12 games)</span>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Props */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-lg">Best Props</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-600 rounded">
                  <div>
                    <div className="font-medium">
                      {currentEdge?.bestPropType || "Total Bases"}
                    </div>
                    <div className="text-sm text-slate-400">
                      {currentEdge?.bestPropLine || "Over 2.5"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-semibold">94% Confidence</div>
                    <div className="text-sm text-slate-400">Hit in 8/10 games</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-600 rounded">
                  <div>
                    <div className="font-medium">Home Runs</div>
                    <div className="text-sm text-slate-400">Over 0.5</div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-semibold">78% Confidence</div>
                    <div className="text-sm text-slate-400">3 HR vs LHP recently</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add to Parlay Button */}
          <div className="pt-6 border-t border-slate-700">
            <Button
              onClick={handleAddToParlay}
              className="w-full bg-blue-600 hover:bg-blue-700"
              data-testid="button-add-to-parlay"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Parlay Builder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
