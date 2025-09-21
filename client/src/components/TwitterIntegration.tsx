import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Twitter, Send, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface TwitterStatus {
  enabled: boolean;
  configured: boolean;
  message: string;
}

interface TwitterIntegrationProps {
  selectedSport: string;
  onTweetPosted?: (tweetId: string) => void;
}

export function TwitterIntegration({ selectedSport, onTweetPosted }: TwitterIntegrationProps) {
  const [status, setStatus] = useState<TwitterStatus | null>(null);
  const [tweetText, setTweetText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastTweetId, setLastTweetId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTwitterStatus();
  }, []);

  const fetchTwitterStatus = async () => {
    try {
      const response = await fetch('/api/twitter/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching Twitter status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Twitter status",
        variant: "destructive",
      });
    }
  };

  const generateTweet = async (type: 'waiver_wire' | 'betting_picks') => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/twitter/generate/${selectedSport}/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          week: getCurrentWeek(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tweet');
      }

      const data = await response.json();
      setTweetText(data.text);
      
      toast({
        title: "Tweet Generated",
        description: `Generated ${type.replace('_', ' ')} tweet for ${selectedSport.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error generating tweet:', error);
      toast({
        title: "Error",
        description: "Failed to generate tweet",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateParlayTweet = async (parlayData: any) => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/twitter/generate/${selectedSport}/parlay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parlayData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate parlay tweet');
      }

      const data = await response.json();
      setTweetText(data.text);
      
      toast({
        title: "Parlay Tweet Generated",
        description: `Generated parlay tweet for ${selectedSport.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error generating parlay tweet:', error);
      toast({
        title: "Error",
        description: "Failed to generate parlay tweet",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const postTweet = async () => {
    if (!tweetText.trim()) {
      toast({
        title: "Error",
        description: "Please enter tweet text",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    try {
      const response = await fetch('/api/twitter/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: tweetText,
          type: 'custom',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post tweet');
      }

      const data = await response.json();
      setLastTweetId(data.tweetId);
      setTweetText('');
      
      toast({
        title: "Tweet Posted",
        description: data.message,
      });

      if (onTweetPosted && data.tweetId) {
        onTweetPosted(data.tweetId);
      }
    } catch (error) {
      console.error('Error posting tweet:', error);
      toast({
        title: "Error",
        description: "Failed to post tweet",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const getCurrentWeek = () => {
    // Simple week calculation - in production, this would be more sophisticated
    const now = new Date();
    const startOfSeason = new Date(now.getFullYear(), 8, 1); // September 1st
    const diffTime = Math.abs(now.getTime() - startOfSeason.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  };

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Twitter className="h-5 w-5" />
            Twitter Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Twitter className="h-5 w-5" />
          Twitter Integration
        </CardTitle>
        <CardDescription>
          Share your betting insights and analysis on Twitter
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {status.configured ? (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Simulation Mode
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">{status.message}</span>
        </div>

        <Separator />

        {/* Quick Tweet Generators */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quick Tweet Generators</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateTweet('betting_picks')}
              disabled={isGenerating}
              className="flex items-center gap-1"
            >
              {isGenerating ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
              Best Picks
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateTweet('waiver_wire')}
              disabled={isGenerating}
              className="flex items-center gap-1"
            >
              {isGenerating ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
              Value Plays
            </Button>
          </div>
        </div>

        <Separator />

        {/* Tweet Composer */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Compose Tweet</h4>
          <Textarea
            placeholder="What's happening with your betting insights?"
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            className="min-h-[100px]"
            maxLength={280}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {tweetText.length}/280 characters
            </span>
            <Button
              onClick={postTweet}
              disabled={isPosting || !tweetText.trim()}
              className="flex items-center gap-1"
            >
              {isPosting ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              {isPosting ? 'Posting...' : 'Post Tweet'}
            </Button>
          </div>
        </div>

        {/* Last Tweet Info */}
        {lastTweetId && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Last tweet posted: {lastTweetId}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TwitterIntegration;
