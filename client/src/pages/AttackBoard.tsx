import React, { useState } from "react";
import { Target, TrendingDown, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAttackBoard, useGamesWithTeams } from "@/hooks/useSportsData";
import { Link } from "wouter";
import type { FilterState } from "@/lib/types";

interface AttackBoardProps {
  selectedSport: string;
  filters: FilterState;
}

export default function AttackBoard({ selectedSport, filters }: AttackBoardProps) {
  const [sortBy, setSortBy] = useState<"score" | "targets">("score");

  const { data: attackBoard, isLoading } = useAttackBoard(selectedSport);
  const { data: games } = useGamesWithTeams(selectedSport);

  const getExploitabilityColor = (score: string): string => {
    const numScore = parseFloat(score);
    if (numScore >= 90) return "text-red-400";
    if (numScore >= 80) return "text-orange-400";
    if (numScore >= 70) return "text-yellow-400";
    return "text-slate-400";
  };

  const getExploitabilityBadge = (score: string): string => {
    const numScore = parseFloat(score);
    if (numScore >= 90) return "bg-red-500";
    if (numScore >= 80) return "bg-orange-500";
    if (numScore >= 70) return "bg-yellow-500";
    return "bg-slate-500";
  };

  const getSportSpecificTargets = () => {
    switch (selectedSport) {
      case "mlb":
        return ["Pitcher", "Bullpen", "Defense"];
      case "nfl":
        return ["Secondary", "Run Defense", "Pass Rush"];
      case "nba":
        return ["Perimeter D", "Paint D", "Transition D"];
      default:
        return ["Opponent"];
    }
  };

  const sortedAttackBoard = attackBoard?.slice().sort((a, b) => {
    if (sortBy === "score") {
      return parseFloat(b.exploitabilityScore) - parseFloat(a.exploitabilityScore);
    }
    return b.targetCount - a.targetCount;
  }) || [];

  const highExploitability = attackBoard?.filter(target => 
    parseFloat(target.exploitabilityScore) >= 85
  ).length || 0;

  const mediumExploitability = attackBoard?.filter(target => 
    parseFloat(target.exploitabilityScore) >= 70 && parseFloat(target.exploitabilityScore) < 85
  ).length || 0;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Target className="h-6 w-6 text-red-400" />
            <span data-testid="page-title">Attack Board</span>
          </h2>
          <p className="text-slate-400 mt-1">
            Most exploitable opponents and defensive units
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant={sortBy === "score" ? "default" : "outline"}
            onClick={() => setSortBy("score")}
            className={sortBy === "score" ? "bg-red-600 hover:bg-red-700" : "bg-slate-700 hover:bg-slate-600 border-slate-600"}
            data-testid="button-sort-score"
          >
            Sort by Score
          </Button>
          <Button
            variant={sortBy === "targets" ? "default" : "outline"}
            onClick={() => setSortBy("targets")}
            className={sortBy === "targets" ? "bg-red-600 hover:bg-red-700" : "bg-slate-700 hover:bg-slate-600 border-slate-600"}
            data-testid="button-sort-targets"
          >
            Sort by Targets
          </Button>
        </div>
      </div>

      {/* Exploitability Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400" data-testid="count-high-priority">
              {highExploitability}
            </div>
            <p className="text-xs text-muted-foreground">
              85+ Exploitability Score
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Priority</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400" data-testid="count-medium-priority">
              {mediumExploitability}
            </div>
            <p className="text-xs text-muted-foreground">
              70-84 Exploitability Score
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Targets</CardTitle>
            <Target className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="count-total-targets">
              {attackBoard?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Available today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attack Targets Table */}
      {attackBoard && attackBoard.length > 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-red-400" />
              <span>Exploitable Targets</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-700">
                  <TableRow>
                    <TableHead className="text-left">Target</TableHead>
                    <TableHead className="text-center">Type</TableHead>
                    <TableHead className="text-center">Exploitability Score</TableHead>
                    <TableHead className="text-center">Key Weaknesses</TableHead>
                    <TableHead className="text-center">Target Count</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAttackBoard.map((target) => (
                    <TableRow
                      key={target.id}
                      className="hover:bg-slate-700/50 transition-colors"
                      data-testid={`row-target-${target.id}`}
                    >
                      <TableCell>
                        <div className="font-medium">
                          {target.opponentId}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-slate-600">
                          {target.opponentType}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Badge 
                            className={`${getExploitabilityBadge(target.exploitabilityScore)} text-white`}
                            data-testid={`score-${target.id}`}
                          >
                            {Math.round(parseFloat(target.exploitabilityScore))}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="text-sm">
                          {target.weaknesses && typeof target.weaknesses === 'object' ? (
                            <div className="space-y-1">
                              {Object.entries(target.weaknesses).slice(0, 2).map(([key, value]) => (
                                <div key={key} className="text-slate-400">
                                  {key}: {String(value)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400">Multiple weaknesses</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Badge 
                            variant="secondary"
                            data-testid={`target-count-${target.id}`}
                          >
                            {target.targetCount}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Link href="/">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300"
                            data-testid={`button-view-games-${target.id}`}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Games
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              No Attack Targets Found
            </h3>
            <p className="text-slate-400">
              No exploitable opponents identified for today's slate. 
              Check back as data updates throughout the day.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Target Type Breakdown */}
      {attackBoard && attackBoard.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {getSportSpecificTargets().map((targetType) => {
            const typeTargets = attackBoard.filter(target => 
              target.opponentType.toLowerCase().includes(targetType.toLowerCase())
            );
            
            const avgScore = typeTargets.length > 0 
              ? typeTargets.reduce((sum, target) => sum + parseFloat(target.exploitabilityScore), 0) / typeTargets.length
              : 0;

            return (
              <Card key={targetType} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{targetType} Targets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Count:</span>
                      <span className="font-semibold">{typeTargets.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Score:</span>
                      <span className={`font-semibold ${getExploitabilityColor(avgScore.toString())}`}>
                        {avgScore.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Best Target:</span>
                      <span className="font-semibold">
                        {typeTargets.length > 0 
                          ? Math.round(Math.max(...typeTargets.map(t => parseFloat(t.exploitabilityScore))))
                          : "N/A"
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
