import React, { useState } from "react";
import { X, RefreshCw, Download, Shuffle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSwapSuggestions } from "@/hooks/useSportsData";
import type { GeneratedParlay } from "@/lib/types";

interface ParlayBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  parlays: {
    conservative?: GeneratedParlay;
    balanced?: GeneratedParlay;
    aggressive?: GeneratedParlay;
  };
  selectedSport: string;
}

export function ParlayBuilderModal({ 
  isOpen, 
  onClose, 
  parlays, 
  selectedSport 
}: ParlayBuilderModalProps) {
  const [activeTab, setActiveTab] = useState("conservative");
  const swapMutation = useSwapSuggestions(selectedSport);

  const formatOdds = (odds: number): string => {
    if (odds > 0) {
      return `+${odds}`;
    }
    return odds.toString();
  };

  const formatPayout = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return "text-green-400";
    if (confidence >= 80) return "text-yellow-400";
    return "text-orange-400";
  };

  const getTabColor = (tab: string): string => {
    switch (tab) {
      case "conservative": return "data-[state=active]:bg-blue-600";
      case "balanced": return "data-[state=active]:bg-yellow-600";
      case "aggressive": return "data-[state=active]:bg-red-600";
      default: return "";
    }
  };

  const handleSwapSuggestions = async (parlay: GeneratedParlay) => {
    try {
      await swapMutation.mutateAsync(parlay);
    } catch (error) {
      console.error("Failed to get swap suggestions:", error);
    }
  };

  const renderParlayContent = (parlay: GeneratedParlay | undefined, type: string) => {
    if (!parlay) {
      return (
        <div className="text-center py-8">
          <div className="text-slate-400">No parlay generated for {type} strategy</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Parlay Summary */}
        <Card className="bg-slate-700 border-slate-600">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatOdds(parlay.totalOdds)}
                </div>
                <div className="text-sm text-slate-400">Total Odds</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {formatPayout(parlay.potentialPayout)}
                </div>
                <div className="text-sm text-slate-400">Potential Payout</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className={`text-lg font-semibold ${getConfidenceColor(parlay.combinedConfidence)}`}>
                  {parlay.combinedConfidence}%
                </div>
                <div className="text-sm text-slate-400">Combined Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-400">
                  {parlay.expectedValue > 0 ? '+' : ''}{parlay.expectedValue.toFixed(1)}%
                </div>
                <div className="text-sm text-slate-400">Expected Value</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parlay Legs */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Parlay Legs</h3>
          {parlay.legs.map((leg, index) => (
            <Card key={index} className="bg-slate-700 border-slate-600">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Badge className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium" data-testid={`parlay-leg-player-${index}`}>
                        {leg.playerName}
                      </div>
                      <div className="text-sm text-slate-400">
                        {leg.propType} {leg.propLine}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold" data-testid={`parlay-leg-odds-${index}`}>
                      {formatOdds(leg.odds)}
                    </div>
                    <div className={`text-sm ${getConfidenceColor(leg.confidence * 20)}`}>
                      {leg.confidence * 20}% conf
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => {
              const analysisText = parlay.legs.map((leg, i) => 
                `${i + 1}. ${leg.playerName} ${leg.propType} ${leg.propLine} (${formatOdds(leg.odds)}) - ${leg.confidence * 20}% confidence`
              ).join('\n');
              navigator.clipboard.writeText(`Parlay Analysis (${activeTab}):\n\nTotal Odds: ${formatOdds(parlay.totalOdds)}\nPotential Payout: ${formatPayout(parlay.potentialPayout)}\nConfidence: ${parlay.combinedConfidence}%\n\nLegs:\n${analysisText}`);
              alert('Analysis copied to clipboard!');
            }}
            data-testid="button-export-parlay"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Analysis
          </Button>
          <Button 
            variant="outline"
            className="bg-slate-700 hover:bg-slate-600 border-slate-600"
            data-testid="button-regenerate"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleSwapSuggestions(parlay)}
            disabled={swapMutation.isPending}
            className="bg-slate-700 hover:bg-slate-600 border-slate-600"
            data-testid="button-swap-suggestions"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            {swapMutation.isPending ? "Loading..." : "Swap Leg"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700" data-testid="modal-parlay-builder">
        {/* Modal Header */}
        <DialogHeader className="border-b border-slate-700 pb-4">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">
              Generated Parlays
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-parlay-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Parlay Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
            <TabsTrigger 
              value="conservative" 
              className={`${getTabColor("conservative")} data-[state=active]:text-white`}
              data-testid="tab-conservative"
            >
              <div className="text-center">
                <div className="font-medium">Conservative</div>
                <div className="text-xs opacity-75">4 Legs • $50K</div>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="balanced"
              className={`${getTabColor("balanced")} data-[state=active]:text-black`}
              data-testid="tab-balanced"
            >
              <div className="text-center">
                <div className="font-medium">Balanced</div>
                <div className="text-xs opacity-75">6 Legs • $100K</div>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="aggressive"
              className={`${getTabColor("aggressive")} data-[state=active]:text-white`}
              data-testid="tab-aggressive"
            >
              <div className="text-center">
                <div className="font-medium">Aggressive</div>
                <div className="text-xs opacity-75">8 Legs • $1M</div>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conservative" className="mt-6" data-testid="content-conservative">
            {renderParlayContent(parlays.conservative, "conservative")}
          </TabsContent>

          <TabsContent value="balanced" className="mt-6" data-testid="content-balanced">
            {renderParlayContent(parlays.balanced, "balanced")}
          </TabsContent>

          <TabsContent value="aggressive" className="mt-6" data-testid="content-aggressive">
            {renderParlayContent(parlays.aggressive, "aggressive")}
          </TabsContent>
        </Tabs>

        {/* Risk Disclaimer */}
        <Card className="bg-slate-700 border-slate-600 mt-6">
          <CardContent className="pt-4">
            <div className="text-sm text-slate-400">
              <strong className="text-slate-300">Analysis Disclaimer:</strong> All parlays are generated based on 
              statistical analysis for educational and research purposes only. This is not betting advice. 
              Past performance does not guarantee future results. Always do your own research.
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
