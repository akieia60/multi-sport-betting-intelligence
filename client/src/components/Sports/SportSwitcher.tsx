import React from "react";
import { Button } from "@/components/ui/button";
import { SPORTS } from "@/lib/constants";

interface SportSwitcherProps {
  selectedSport: string;
  onSportChange: (sport: string) => void;
}

export function SportSwitcher({ selectedSport, onSportChange }: SportSwitcherProps) {
  const getSportColorClass = (sportId: string) => {
    const sport = Object.values(SPORTS).find(s => s.id === sportId);
    switch (sport?.id) {
      case "mlb": return "bg-blue-600 hover:bg-blue-700";
      case "nfl": return "bg-emerald-600 hover:bg-emerald-700";
      case "nba": return "bg-amber-600 hover:bg-amber-700";
      default: return "bg-slate-600 hover:bg-slate-700";
    }
  };

  return (
    <div className="flex items-center space-x-1 bg-slate-700 rounded-lg p-1" data-testid="sport-switcher">
      {Object.values(SPORTS).map((sport) => {
        const isSelected = selectedSport === sport.id;
        
        return (
          <Button
            key={sport.id}
            variant="ghost"
            size="sm"
            onClick={() => onSportChange(sport.id)}
            className={`px-3 py-1 text-sm font-medium transition-colors ${
              isSelected
                ? `text-white ${getSportColorClass(sport.id)}`
                : "text-slate-300 hover:text-white hover:bg-slate-600"
            }`}
            data-testid={`button-sport-${sport.id}`}
          >
            <i className={`${sport.icon} mr-1`} />
            {sport.name}
          </Button>
        );
      })}
    </div>
  );
}
