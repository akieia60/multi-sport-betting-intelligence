import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Twitter, TrendingUp, Users, Heart, MessageCircle, Repeat2 } from "lucide-react";

interface EnhancedSocialHubProps {
  twitterStatus: any;
  onGenerateTweet: (type: string) => void;
  onPostTweet: () => void;
  generatedTweet: string;
  isPosting: boolean;
}

export function EnhancedSocialHub({ 
  twitterStatus, 
  onGenerateTweet, 
  onPostTweet, 
  generatedTweet, 
  isPosting 
}: EnhancedSocialHubProps) {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section with Twitter Background */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('/src/assets/images/twitter-bg.png')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-slate-900" />
        
        <div className="relative z-10 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
                Social Media
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Command Center
                </span>
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Amplify your betting insights across social platforms and build your audience
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">1,247</div>
                  <div className="text-sm text-slate-400">Followers</div>
                  <div className="text-xs text-green-400 mt-1">+12% this week</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">8.3%</div>
                  <div className="text-sm text-slate-400">Engagement</div>
                  <div className="text-xs text-green-400 mt-1">Above average</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Twitter className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">12</div>
                  <div className="text-sm text-slate-400">Posts This Week</div>
                  <div className="text-xs text-blue-400 mt-1">Consistent</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Heart className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">156</div>
                  <div className="text-sm text-slate-400">Top Post</div>
                  <div className="text-xs text-yellow-400 mt-1">NFL Parlay</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Twitter Integration */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Twitter className="h-6 w-6 text-blue-400 mr-2" />
                Twitter Integration
                <Badge 
                  variant={twitterStatus?.configured ? "default" : "secondary"}
                  className={`ml-2 ${twitterStatus?.configured ? 'bg-green-600' : 'bg-yellow-600'}`}
                >
                  {twitterStatus?.configured ? 'Connected' : 'Setup Required'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status */}
              <div className="p-4 bg-slate-700 rounded-lg">
                <p className="text-slate-300 text-sm">
                  {twitterStatus?.configured 
                    ? "🎉 Twitter integration is fully configured and ready for live posting!"
                    : "⚠️ Twitter API credentials not configured - running in simulation mode"
                  }
                </p>
              </div>

              {/* Quick Generators */}
              <div>
                <h4 className="text-white font-semibold mb-3">Quick Tweet Generators</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => onGenerateTweet('best-picks')}
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                  >
                    Best Picks
                  </Button>
                  <Button 
                    onClick={() => onGenerateTweet('value-plays')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    Value Plays
                  </Button>
                </div>
              </div>

              {/* Tweet Composer */}
              <div>
                <h4 className="text-white font-semibold mb-3">Compose Tweet</h4>
                <textarea
                  value={generatedTweet}
                  onChange={(e) => {/* Handle change */}}
                  placeholder="What's happening with your betting insights?"
                  className="w-full h-24 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-slate-400">
                    {generatedTweet.length}/280 characters
                  </span>
                  <Button 
                    onClick={onPostTweet}
                    disabled={!generatedTweet.trim() || isPosting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isPosting ? 'Posting...' : 'Post Tweet'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Posts */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Posts</CardTitle>
              <p className="text-slate-400 text-sm">Your latest social media activity</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Post 1 */}
              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-yellow-600">Picks</Badge>
                  <span className="text-xs text-slate-400">2 hours ago</span>
                </div>
                <p className="text-slate-300 text-sm mb-3">
                  🔥 Top Value Plays - NFL Week 3 🔥 1. Josh Allen Passing Yards O 267.5 - 73% edge 2. CMC Rushing Yards O 89.5 - 68% edg...
                </p>
                <div className="flex items-center space-x-4 text-xs text-slate-400">
                  <span className="flex items-center"><Heart className="h-3 w-3 mr-1" />23</span>
                  <span className="flex items-center"><MessageCircle className="h-3 w-3 mr-1" />8</span>
                  <span className="flex items-center"><Repeat2 className="h-3 w-3 mr-1" />5</span>
                  <span className="text-slate-500">36 total</span>
                </div>
              </div>

              {/* Post 2 */}
              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-blue-600">Parlay</Badge>
                  <span className="text-xs text-slate-400">5 hours ago</span>
                </div>
                <p className="text-slate-300 text-sm mb-3">
                  💰 4-Leg Parlay Builder 💰 1. Mahomes O 2.5 Passing TDs 2. Kelce O 5.5 Receptions 3. Chiefs -3.5 4. Game O 47.5 Odds: ...
                </p>
                <div className="flex items-center space-x-4 text-xs text-slate-400">
                  <span className="flex items-center"><Heart className="h-3 w-3 mr-1" />41</span>
                  <span className="flex items-center"><MessageCircle className="h-3 w-3 mr-1" />15</span>
                  <span className="flex items-center"><Repeat2 className="h-3 w-3 mr-1" />12</span>
                  <span className="text-slate-500">68 total</span>
                </div>
              </div>

              {/* Post 3 */}
              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-purple-600">Elite</Badge>
                  <span className="text-xs text-slate-400">1 day ago</span>
                </div>
                <p className="text-slate-300 text-sm mb-3">
                  📊 Elite Players Alert - Week 3 📊 Top performers with 85%+ edge scores: 🏈 Lamar Jackson (QB) 🏈 Christian McCaffrey ...
                </p>
                <div className="flex items-center space-x-4 text-xs text-slate-400">
                  <span className="flex items-center"><Heart className="h-3 w-3 mr-1" />67</span>
                  <span className="flex items-center"><MessageCircle className="h-3 w-3 mr-1" />22</span>
                  <span className="flex items-center"><Repeat2 className="h-3 w-3 mr-1" />18</span>
                  <span className="text-slate-500">107 total</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
