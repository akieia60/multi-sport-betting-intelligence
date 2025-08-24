import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";

// Pages
import Dashboard from "@/pages/Dashboard";
import PropFinder from "@/pages/PropFinder";
import ElitePlayers from "@/pages/ElitePlayers";
import AttackBoard from "@/pages/AttackBoard";
import TeamIntel from "@/pages/TeamIntel";
import Analytics from "@/pages/Analytics";
import ParlayBuilder from "@/pages/ParlayBuilder";
import NotFound from "@/pages/not-found";

// Layout components
import { TopNavigation } from "@/components/Layout/TopNavigation";
import { Sidebar } from "@/components/Layout/Sidebar";
import type { FilterState } from "@/lib/types";

function Router() {
  const [selectedSport, setSelectedSport] = useState("mlb");
  const [filters, setFilters] = useState<FilterState>({
    usageRate: "all",
    opponentRank: "all", 
    venue: "all",
    hotStreak: false,
    propType: "all",
    confidence: 1
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <TopNavigation 
        selectedSport={selectedSport}
        onSportChange={setSelectedSport}
      />
      
      <div className="flex h-screen pt-16">
        <Sidebar 
          selectedSport={selectedSport}
          filters={filters}
          onFiltersChange={setFilters}
        />
        
        <main className="flex-1 overflow-y-auto">
          <Switch>
            <Route path="/">
              <PropFinder 
                selectedSport={selectedSport}
                filters={filters}
              />
            </Route>
            
            <Route path="/elite-players">
              <ElitePlayers 
                selectedSport={selectedSport}
                filters={filters}
              />
            </Route>
            
            <Route path="/attack-board">
              <AttackBoard 
                selectedSport={selectedSport}
                filters={filters}
              />
            </Route>
            
            <Route path="/team-intel">
              <TeamIntel 
                selectedSport={selectedSport}
                filters={filters}
              />
            </Route>
            
            <Route path="/analytics">
              <Analytics 
                selectedSport={selectedSport}
                filters={filters}
              />
            </Route>
            
            <Route path="/parlay-builder">
              <ParlayBuilder 
                selectedSport={selectedSport}
                filters={filters}
              />
            </Route>
            
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
