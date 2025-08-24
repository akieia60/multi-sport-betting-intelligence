import React, { useState } from "react";
import { ChevronDown, ChevronUp, Clock, Cloud } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayerTable } from "../Players/PlayerTable";
import type { GameWithTeams, PlayerEdge } from "@/lib/types";

interface GameCardProps {
  game: GameWithTeams;
  playerEdges?: PlayerEdge[];
  onPlayerClick: (playerId: string) => void;
  expanded?: boolean;
}

export function GameCard({ 
  game, 
  playerEdges = [], 
  onPlayerClick,
  expanded: initialExpanded = false 
}: GameCardProps) {
  const [expanded, setExpanded] = useState(initialExpanded);

  const formatGameTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short"
    });
  };

  const formatWeather = (weather: any) => {
    if (!weather) return "Weather unavailable";
    return `${weather.temperature}°F, ${weather.conditions}`;
  };

  const formatWind = (weather: any) => {
    if (!weather) return "No data";
    return `${weather.windSpeed} mph ${weather.windDirection}`;
  };

  const getWeatherIcon = (weather: any) => {
    if (!weather) return "fas fa-question";
    
    const conditions = weather.conditions?.toLowerCase();
    if (conditions?.includes("clear")) return "fas fa-sun text-yellow-400";
    if (conditions?.includes("cloud")) return "fas fa-cloud text-slate-400";
    if (conditions?.includes("rain")) return "fas fa-cloud-rain text-blue-400";
    if (conditions?.includes("wind")) return "fas fa-wind text-blue-400";
    return "fas fa-cloud-sun text-yellow-400";
  };

  const topEdges = playerEdges
    .sort((a, b) => parseFloat(b.edgeScore) - parseFloat(a.edgeScore))
    .slice(0, 3);

  return (
    <Card className="bg-slate-800 border-slate-700" data-testid={`card-game-${game.id}`}>
      <CardHeader className="border-b border-slate-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold">
              <span data-testid="text-away-team">
                {game.awayTeam?.abbreviation || game.awayTeamId}
              </span>
              {" @ "}
              <span data-testid="text-home-team">
                {game.homeTeam?.abbreviation || game.homeTeamId}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Clock className="h-4 w-4" />
              <span data-testid="text-game-time">
                {formatGameTime(game.gameDate)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <i className={getWeatherIcon(game.weather)} />
              <span data-testid="text-weather">
                {formatWeather(game.weather)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-slate-400">Total</div>
              <div className="font-semibold" data-testid="text-game-total">
                {game.gameTotal || "N/A"}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-slate-400">Wind</div>
              <div className="font-semibold" data-testid="text-wind">
                {formatWind(game.weather)}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
              data-testid="button-toggle-game"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {expanded ? (
          <PlayerTable 
            playerEdges={playerEdges}
            onPlayerClick={onPlayerClick}
          />
        ) : (
          <div className="p-4">
            <div className="flex justify-between items-center text-sm text-slate-400">
              <span data-testid="text-top-edges">
                Top Edges: {topEdges.map((edge, i) => 
                  `Player ${edge.playerId} (${edge.edgeScore})`
                ).join(", ") || "No edges available"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(true)}
                className="text-blue-400 hover:text-blue-300"
                data-testid="button-view-all-players"
              >
                View All Players →
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
