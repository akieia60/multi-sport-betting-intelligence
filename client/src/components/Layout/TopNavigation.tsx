import React from "react";
import { Bell, User } from "lucide-react";
import { SportSwitcher } from "../Sports/SportSwitcher";
import { useRealTime } from "@/hooks/useRealTime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRefreshData } from "@/hooks/useSportsData";

interface TopNavigationProps {
  selectedSport: string;
  onSportChange: (sport: string) => void;
  userTier?: "free" | "standard" | "vip";
}

export function TopNavigation({ 
  selectedSport, 
  onSportChange, 
  userTier = "vip" 
}: TopNavigationProps) {
  const { isLive, countdownFormatted, triggerRefresh } = useRealTime();
  const refreshMutation = useRefreshData();

  const handleRefresh = () => {
    triggerRefresh();
    refreshMutation.mutate(selectedSport);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "vip": return "text-yellow-400";
      case "standard": return "text-blue-400";
      default: return "text-slate-400";
    }
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50" data-testid="top-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-white" data-testid="brand-logo">
                SportEdge Pro
              </h1>
            </div>
            
            {/* Real-time Status */}
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  }`}
                  data-testid="status-indicator"
                />
                <span className={isLive ? "text-green-400" : "text-red-400"}>
                  {isLive ? "Live" : "Offline"}
                </span>
              </div>
              <span className="text-slate-400" data-testid="refresh-countdown">
                Next refresh: {countdownFormatted}
              </span>
            </div>
          </div>

          {/* Sport Switcher */}
          <SportSwitcher 
            selectedSport={selectedSport} 
            onSportChange={onSportChange}
          />

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-slate-400">Plan:</span>
              <span className={`font-medium ${getTierColor(userTier)} ml-1`}>
                {userTier.toUpperCase()}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
              data-testid="button-refresh"
            >
              <i className={`fas fa-sync-alt mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 w-3 h-3 p-0 bg-red-500">
                <span className="sr-only">3 notifications</span>
              </Badge>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              data-testid="button-user-menu"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
