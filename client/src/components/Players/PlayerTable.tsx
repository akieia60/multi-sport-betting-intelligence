import React from "react";
import { Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { PlayerEdge } from "@/lib/types";

interface PlayerTableProps {
  playerEdges: PlayerEdge[];
  onPlayerClick: (playerId: string) => void;
  sportId?: string;
}

export function PlayerTable({ playerEdges, onPlayerClick, sportId = "mlb" }: PlayerTableProps) {
  
  const getInitials = (playerId: string): string => {
    // In a real app, this would come from actual player data
    const names = ["Aaron Judge", "Rafael Devers", "Mookie Betts", "Xander Bogaerts", "Trea Turner"];
    const randomName = names[Math.abs(playerId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % names.length];
    return randomName.split(' ').map(n => n[0]).join('');
  };

  const getPlayerName = (playerId: string): string => {
    // In a real app, this would come from actual player data
    const names = ["Aaron Judge", "Rafael Devers", "Mookie Betts", "Xander Bogaerts", "Trea Turner"];
    return names[Math.abs(playerId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % names.length];
  };

  const getTeamAbbr = (playerId: string): string => {
    const teams = ["NYY", "BOS", "LAD", "SF", "HOU"];
    return teams[Math.abs(playerId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % teams.length];
  };

  const getPosition = (playerId: string): string => {
    const positions = ["RF", "3B", "OF", "SS", "2B", "C", "P"];
    return positions[Math.abs(playerId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % positions.length];
  };

  const getEdgeColor = (score: string): string => {
    const numScore = parseFloat(score);
    if (numScore >= 90) return "from-green-500 to-emerald-600";
    if (numScore >= 80) return "from-blue-500 to-blue-600";
    if (numScore >= 70) return "from-yellow-500 to-orange-500";
    return "from-slate-500 to-slate-600";
  };

  const getValueColor = (value: string): string => {
    const numValue = parseFloat(value);
    if (numValue > 1) return "text-green-400";
    if (numValue > 0) return "text-yellow-400";
    return "text-red-400";
  };

  const renderConfidenceStars = (confidence: number) => {
    return (
      <div className="flex items-center justify-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < confidence ? "text-yellow-400 fill-current" : "text-slate-400"
            }`}
          />
        ))}
      </div>
    );
  };

  const getMLBColumns = () => (
    <>
      <TableHead className="text-center">Pitch Match</TableHead>
      <TableHead className="text-center">Recent Form</TableHead>
      <TableHead className="text-center">Slot Vuln</TableHead>
      <TableHead className="text-center">Environment</TableHead>
    </>
  );

  const getNFLColumns = () => (
    <>
      <TableHead className="text-center">Role/Usage</TableHead>
      <TableHead className="text-center">Opp Tendencies</TableHead>
      <TableHead className="text-center">Environment</TableHead>
      <TableHead className="text-center">Recent Form</TableHead>
    </>
  );

  const getNBAColumns = () => (
    <>
      <TableHead className="text-center">Minutes/Usage</TableHead>
      <TableHead className="text-center">Opp Weakness</TableHead>
      <TableHead className="text-center">Environment</TableHead>
      <TableHead className="text-center">Recent Form</TableHead>
    </>
  );

  const renderSportSpecificColumns = (edge: PlayerEdge) => {
    switch (sportId) {
      case "mlb":
        return (
          <>
            <TableCell className="text-center">
              <div className={getValueColor(edge.pitchMatchEdge || "0")}>
                {edge.pitchMatchEdge ? `+${edge.pitchMatchEdge}` : "N/A"}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className={getValueColor(edge.recentForm)}>
                +{edge.recentForm}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className={getValueColor(edge.slotVulnerability || "0")}>
                {edge.slotVulnerability ? `+${edge.slotVulnerability}` : "N/A"}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className={getValueColor(edge.environmentBoost)}>
                +{edge.environmentBoost}
              </div>
            </TableCell>
          </>
        );
      case "nfl":
        return (
          <>
            <TableCell className="text-center">
              <div className={getValueColor(edge.usageRate || "0")}>
                {edge.usageRate ? `+${edge.usageRate}` : "N/A"}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className={getValueColor(edge.opponentWeakness)}>
                +{edge.opponentWeakness}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className={getValueColor(edge.environmentBoost)}>
                +{edge.environmentBoost}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className={getValueColor(edge.recentForm)}>
                +{edge.recentForm}
              </div>
            </TableCell>
          </>
        );
      case "nba":
        return (
          <>
            <TableCell className="text-center">
              <div className={getValueColor(edge.usageRate || "0")}>
                {edge.usageRate ? `+${edge.usageRate}` : "N/A"}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className={getValueColor(edge.opponentWeakness)}>
                +{edge.opponentWeakness}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className={getValueColor(edge.environmentBoost)}>
                +{edge.environmentBoost}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className={getValueColor(edge.recentForm)}>
                +{edge.recentForm}
              </div>
            </TableCell>
          </>
        );
      default:
        return null;
    }
  };

  if (playerEdges.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No player edges available for this game.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-700">
          <TableRow>
            <TableHead className="text-left">Player</TableHead>
            <TableHead className="text-center">Pos</TableHead>
            <TableHead className="text-center">Edge Score</TableHead>
            {sportId === "mlb" && getMLBColumns()}
            {sportId === "nfl" && getNFLColumns()}
            {sportId === "nba" && getNBAColumns()}
            <TableHead className="text-center">Best Prop</TableHead>
            <TableHead className="text-center">Confidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playerEdges.map((edge) => (
            <TableRow
              key={edge.id}
              className="hover:bg-slate-700/50 cursor-pointer transition-colors"
              onClick={() => onPlayerClick(edge.playerId)}
              data-testid={`row-player-${edge.playerId}`}
            >
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-xs font-bold"
                    data-testid={`avatar-${edge.playerId}`}
                  >
                    {getInitials(edge.playerId)}
                  </div>
                  <div>
                    <div className="font-medium" data-testid={`text-player-name-${edge.playerId}`}>
                      {getPlayerName(edge.playerId)}
                    </div>
                    <div className="text-sm text-slate-400">
                      {getTeamAbbr(edge.playerId)}
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell className="text-center text-sm">
                {getPosition(edge.playerId)}
              </TableCell>
              
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  <div 
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${getEdgeColor(edge.edgeScore)} flex items-center justify-center font-bold text-white`}
                    data-testid={`edge-score-${edge.playerId}`}
                  >
                    {Math.round(parseFloat(edge.edgeScore))}
                  </div>
                </div>
              </TableCell>
              
              {renderSportSpecificColumns(edge)}
              
              <TableCell className="text-center">
                <div className="text-sm">
                  <div className="font-medium" data-testid={`best-prop-type-${edge.playerId}`}>
                    {edge.bestPropType || "Total Bases"}
                  </div>
                  <div className="text-slate-400" data-testid={`best-prop-line-${edge.playerId}`}>
                    {edge.bestPropLine || "O 2.5"}
                  </div>
                </div>
              </TableCell>
              
              <TableCell className="text-center">
                {renderConfidenceStars(edge.confidence)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
