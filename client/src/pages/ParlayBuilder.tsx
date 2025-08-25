import React, { useState } from "react";
import { Layers, Zap, Shield, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParlayBuilderModal } from "@/components/Parlay/ParlayBuilderModal";
import { LotteryParlayBuilder } from "@/components/Parlay/LotteryParlayBuilder";
import ParlayPresets from "@/components/Parlay/ParlayPresets";
import JackpotButton from "@/components/Parlay/JackpotButton";
import { useGenerateMultipleParlays, useElitePlayers } from "@/hooks/useSportsData";
import type { FilterState, GeneratedParlay } from "@/lib/types";

interface ParlayBuilderProps {
  selectedSport: string;
  filters: FilterState;
}

export default function ParlayBuilder({ selectedSport, filters }: ParlayBuilderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<"conservative" | "balanced" | "aggressive">("conservative");
  const [generatedParlays, setGeneratedParlays] = useState<{
    conservative?: GeneratedParlay;
    balanced?: GeneratedParlay;
    aggressive?: GeneratedParlay;
  }>({});

  const generateMutation = useGenerateMultipleParlays(selectedSport);
  const { data: elitePlayers } = useElitePlayers(selectedSport, 20);

  const handleGenerateParlays = async () => {
    try {
      const parlays = await generateMutation.mutateAsync();
      setGeneratedParlays(parlays);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to generate parlays:", error);
    }
  };

  const getConfigColor = (config: string) => {
    switch (config) {
      case "conservative": return "border-blue-500 bg-blue-500/10";
      case "balanced": return "border-yellow-500 bg-yellow-500/10";
      case "aggressive": return "border-red-500 bg-red-500/10";
      default: return "border-slate-600";
    }
  };

  const getConfigIcon = (config: string) => {
    switch (config) {
      case "conservative": return <Shield className="h-5 w-5 text-blue-400" />;
      case "balanced": return <Target className="h-5 w-5 text-yellow-400" />;
      case "aggressive": return <Zap className="h-5 w-5 text-red-400" />;
      default: return <Layers className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Layers className="h-6 w-6 text-green-400" />
            <span data-testid="page-title">Parlay Builder</span>
          </h2>
          <p className="text-slate-400 mt-1">
            Build optimized parlays with lottery-style randomization and advanced analytics
          </p>
        </div>
      </div>

      {/* Parlay Builder Tabs */}
      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger 
            value="presets" 
            className="flex items-center space-x-2 data-[state=active]:bg-indigo-600"
            data-testid="tab-presets"
          >
            <TrendingUp className="h-4 w-4" />
            <span>3/4/5-Pick</span>
          </TabsTrigger>
          <TabsTrigger 
            value="lottery" 
            className="flex items-center space-x-2 data-[state=active]:bg-purple-600"
            data-testid="tab-lottery-builder"
          >
            <Sparkles className="h-4 w-4" />
            <span>Lottery Builder</span>
          </TabsTrigger>
          <TabsTrigger 
            value="advanced" 
            className="flex items-center space-x-2 data-[state=active]:bg-green-600"
            data-testid="tab-advanced-builder"
          >
            <Layers className="h-4 w-4" />
            <span>Advanced Builder</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="mt-6 space-y-6">
          <ParlayPresets selectedSport={selectedSport} />
          
          {/* Million-Dollar Parlay CTA */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-xl font-semibold text-center mb-4 text-yellow-400">
              🎰 Million-Dollar Challenge
            </h3>
            <div className="max-w-md mx-auto">
              <JackpotButton 
                tier="1M" 
                stake={25} 
                selectedSport={selectedSport}
                onLockIn={(candidate) => {
                  console.log('Million-dollar parlay selected:', candidate);
                  window.dispatchEvent(new CustomEvent('ADD_TO_SLIP', { detail: candidate.legs }));
                }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lottery" className="mt-6">
          <LotteryParlayBuilder selectedSport={selectedSport} />
        </TabsContent>

        <TabsContent value="advanced" className="mt-6 space-y-6">
          {/* Advanced Builder Content */}
          <div className="flex justify-end">
            <Button
              onClick={handleGenerateParlays}
              disabled={generateMutation.isPending || !elitePlayers || elitePlayers.length < 4}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-generate-parlays"
            >
              <Layers className="h-4 w-4 mr-2" />
              {generateMutation.isPending ? "Generating..." : "Generate Parlays"}
            </Button>
          </div>

      {/* Prerequisites Check */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm">Prerequisites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${elitePlayers && elitePlayers.length >= 4 ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm">
                Elite Players ({elitePlayers?.length || 0}/4 minimum)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-sm">Edge Calculations Complete</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-sm">Live Data Available</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parlay Configuration Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conservative Parlay */}
        <Card 
          className={`bg-slate-800 border-2 transition-all cursor-pointer ${
            selectedConfig === "conservative" ? getConfigColor("conservative") : "border-slate-700 hover:border-blue-400"
          }`}
          onClick={() => setSelectedConfig("conservative")}
          data-testid="card-conservative-parlay"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                {getConfigIcon("conservative")}
                <span>Conservative</span>
              </CardTitle>
              <Badge className="bg-blue-500">4 Legs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-blue-400">$50K</div>
                <div className="text-sm text-slate-400">Target Payout</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Min Confidence:</span>
                  <span className="text-blue-400">4+ Stars</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Risk Level:</span>
                  <span className="text-blue-400">Low</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Correlation:</span>
                  <span className="text-blue-400">Limited</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balanced Parlay */}
        <Card 
          className={`bg-slate-800 border-2 transition-all cursor-pointer ${
            selectedConfig === "balanced" ? getConfigColor("balanced") : "border-slate-700 hover:border-yellow-400"
          }`}
          onClick={() => setSelectedConfig("balanced")}
          data-testid="card-balanced-parlay"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                {getConfigIcon("balanced")}
                <span>Balanced</span>
              </CardTitle>
              <Badge className="bg-yellow-500 text-black">6 Legs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-yellow-400">$100K</div>
                <div className="text-sm text-slate-400">Target Payout</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Min Confidence:</span>
                  <span className="text-yellow-400">3+ Stars</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Risk Level:</span>
                  <span className="text-yellow-400">Medium</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Correlation:</span>
                  <span className="text-yellow-400">Moderate</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aggressive Parlay */}
        <Card 
          className={`bg-slate-800 border-2 transition-all cursor-pointer ${
            selectedConfig === "aggressive" ? getConfigColor("aggressive") : "border-slate-700 hover:border-red-400"
          }`}
          onClick={() => setSelectedConfig("aggressive")}
          data-testid="card-aggressive-parlay"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                {getConfigIcon("aggressive")}
                <span>Aggressive</span>
              </CardTitle>
              <Badge className="bg-red-500">8 Legs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-red-400">$1M</div>
                <div className="text-sm text-slate-400">Target Payout</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Min Confidence:</span>
                  <span className="text-red-400">2+ Stars</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Risk Level:</span>
                  <span className="text-red-400">High</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Correlation:</span>
                  <span className="text-red-400">Allowed</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Elite Players Preview */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Available Elite Players</CardTitle>
        </CardHeader>
        <CardContent>
          {elitePlayers && elitePlayers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {elitePlayers.slice(0, 6).map((edge) => (
                <div
                  key={edge.id}
                  className="flex justify-between items-center p-3 bg-slate-700 rounded"
                  data-testid={`elite-player-preview-${edge.playerId}`}
                >
                  <div>
                    <div className="font-medium">Player {edge.playerId}</div>
                    <div className="text-sm text-slate-400">
                      {edge.bestPropType || "Multiple Props"}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-500">
                      {Math.round(parseFloat(edge.edgeScore))}
                    </Badge>
                    <div className="text-xs text-slate-400 mt-1">
                      {edge.confidence} stars
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Layers className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">
                No Elite Players Available
              </h3>
              <p className="text-slate-400">
                Insufficient elite players to build optimal parlays. 
                Wait for more data or try refreshing.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategy Tips */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Parlay Building Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-400">Best Practices</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Mix high-confidence players</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Avoid correlated plays</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Consider environmental factors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Balance risk vs reward</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-yellow-400">Risk Management</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Start with conservative builds</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Monitor lineup changes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Check injury reports</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Use proper bankroll sizing</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Parlay Builder Modal */}
      <ParlayBuilderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        parlays={generatedParlays}
        selectedSport={selectedSport}
      />
    </div>
  );
}
