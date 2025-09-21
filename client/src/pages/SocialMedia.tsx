import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import TwitterIntegration from '@/components/TwitterIntegration';
import { 
  Twitter, 
  TrendingUp, 
  Users, 
  Calendar,
  BarChart3,
  Share2,
  MessageSquare,
  Heart,
  Repeat2
} from 'lucide-react';

interface SocialMediaProps {
  selectedSport: string;
}

interface SocialStats {
  followers: number;
  engagement: number;
  postsThisWeek: number;
  topPerformingPost: string;
}

export default function SocialMedia({ selectedSport }: SocialMediaProps) {
  const [stats, setStats] = useState<SocialStats>({
    followers: 1247,
    engagement: 8.3,
    postsThisWeek: 12,
    topPerformingPost: "NFL Week 3 Parlay Builder"
  });
  const [recentPosts, setRecentPosts] = useState([
    {
      id: '1',
      text: '🔥 Top Value Plays - NFL Week 3 🔥\n\n1. Josh Allen Passing Yards O 267.5 - 73% edge\n2. CMC Rushing Yards O 89.5 - 68% edge\n3. Tyreek Hill Receiving Yards O 74.5 - 71% edge\n\nFull analysis available!\n\n#NFL #sportsbetting #valuebet',
      timestamp: '2 hours ago',
      engagement: { likes: 23, retweets: 8, replies: 5 },
      type: 'betting_picks'
    },
    {
      id: '2',
      text: '💰 4-Leg Parlay Builder 💰\n\n1. Mahomes O 2.5 Passing TDs\n2. Kelce O 5.5 Receptions\n3. Chiefs -3.5\n4. Game O 47.5\n\nOdds: +1247\nPotential Payout: $124.70\n\nBuild your own parlays!\n\n#parlay #sportsbetting',
      timestamp: '5 hours ago',
      engagement: { likes: 41, retweets: 15, replies: 12 },
      type: 'parlay'
    },
    {
      id: '3',
      text: '📊 Elite Players Alert - Week 3 📊\n\nTop performers with 85%+ edge scores:\n\n🏈 Lamar Jackson (QB)\n🏈 Christian McCaffrey (RB)\n🏈 Cooper Kupp (WR)\n\nDetailed breakdowns available on platform!\n\n#NFL #eliteplayers #analytics',
      timestamp: '1 day ago',
      engagement: { likes: 67, retweets: 22, replies: 18 },
      type: 'elite_players'
    }
  ]);
  const { toast } = useToast();

  const handleTweetPosted = (tweetId: string) => {
    // Add the new tweet to recent posts
    const newPost = {
      id: tweetId,
      text: 'New tweet posted successfully!',
      timestamp: 'Just now',
      engagement: { likes: 0, retweets: 0, replies: 0 },
      type: 'custom' as const
    };
    setRecentPosts(prev => [newPost, ...prev.slice(0, 4)]);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      postsThisWeek: prev.postsThisWeek + 1
    }));
  };

  const formatEngagement = (engagement: { likes: number; retweets: number; replies: number }) => {
    return engagement.likes + engagement.retweets + engagement.replies;
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'betting_picks': return 'bg-green-500/10 text-green-500';
      case 'parlay': return 'bg-blue-500/10 text-blue-500';
      case 'elite_players': return 'bg-purple-500/10 text-purple-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'betting_picks': return 'Picks';
      case 'parlay': return 'Parlay';
      case 'elite_players': return 'Elite';
      default: return 'Custom';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Media Hub</h1>
          <p className="text-muted-foreground">
            Manage your betting insights across social platforms
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Share2 className="h-3 w-3" />
          {selectedSport.toUpperCase()}
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.followers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.engagement}%</div>
            <p className="text-xs text-muted-foreground">
              Above industry average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.postsThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Consistent posting schedule
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Post</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{stats.topPerformingPost}</div>
            <p className="text-xs text-muted-foreground">
              156 total engagements
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="twitter" className="space-y-4">
        <TabsList>
          <TabsTrigger value="twitter" className="flex items-center gap-2">
            <Twitter className="h-4 w-4" />
            Twitter
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="twitter" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Twitter Integration */}
            <TwitterIntegration 
              selectedSport={selectedSport}
              onTweetPosted={handleTweetPosted}
            />

            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>
                  Your latest social media activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentPosts.map((post, index) => (
                  <div key={post.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getPostTypeColor(post.type)}`}
                      >
                        {getPostTypeLabel(post.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {post.timestamp}
                      </span>
                    </div>
                    
                    <p className="text-sm leading-relaxed">
                      {post.text.length > 120 
                        ? `${post.text.substring(0, 120)}...` 
                        : post.text
                      }
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.engagement.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat2 className="h-3 w-3" />
                        {post.engagement.retweets}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post.engagement.replies}
                      </span>
                      <span className="ml-auto">
                        {formatEngagement(post.engagement)} total
                      </span>
                    </div>
                    
                    {index < recentPosts.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Analytics</CardTitle>
              <CardDescription>
                Track your social media performance and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard coming soon!</p>
                <p className="text-sm">Track engagement, reach, and conversion metrics.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Scheduler</CardTitle>
              <CardDescription>
                Plan and schedule your social media posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Content scheduler coming soon!</p>
                <p className="text-sm">Schedule tweets, plan content themes, and automate posting.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
