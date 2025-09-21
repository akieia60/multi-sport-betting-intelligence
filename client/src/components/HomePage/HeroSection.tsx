import React from 'react';
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Zap } from "lucide-react";

interface HeroSectionProps {
  selectedSport: string;
  onNavigate: (path: string) => void;
}

export function HeroSection({ selectedSport, onNavigate }: HeroSectionProps) {
  const getSportName = (sport: string) => {
    switch (sport) {
      case 'nfl': return 'NFL';
      case 'nba': return 'NBA';
      case 'mlb': return 'MLB';
      default: return 'Multi-Sport';
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl mb-8">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url('/src/assets/images/hero-banner.png')`,
          backgroundBlendMode: 'overlay'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/70 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 px-8 py-12 lg:py-16">
        <div className="max-w-4xl">
          {/* Main Headline */}
          <div className="mb-6">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4 leading-tight">
              FIND YOUR
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                EDGE
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-300 max-w-2xl">
              Advanced {getSportName(selectedSport)} analytics and betting intelligence. 
              Discover profitable opportunities with data-driven insights.
            </p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-1">73%</div>
              <div className="text-sm text-slate-400">Average Edge</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-green-400 mb-1">+150</div>
              <div className="text-sm text-slate-400">Best Odds</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-400 mb-1">24/7</div>
              <div className="text-sm text-slate-400">Live Updates</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold px-8 py-3 text-lg"
              onClick={() => onNavigate('/elite-players')}
            >
              <Target className="mr-2 h-5 w-5" />
              View Elite Players
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-600 text-white hover:bg-slate-800 px-8 py-3 text-lg"
              onClick={() => onNavigate('/parlay-builder')}
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Build Parlay
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-600 text-white hover:bg-slate-800 px-8 py-3 text-lg"
              onClick={() => onNavigate('/social-media')}
            >
              <Zap className="mr-2 h-5 w-5" />
              Social Hub
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 text-yellow-400 text-2xl font-bold opacity-60 animate-pulse">
        +150
      </div>
      <div className="absolute bottom-20 right-32 text-green-400 text-xl font-bold opacity-60 animate-pulse">
        73% EDGE
      </div>
      <div className="absolute top-32 right-64 text-blue-400 text-lg font-bold opacity-60 animate-pulse">
        -110
      </div>
    </div>
  );
}
