import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Twitter, RefreshCw } from 'lucide-react';

interface TwitterButtonProps {
  parlayData?: any;
  sport: string;
  type?: 'parlay' | 'betting_picks' | 'waiver_wire';
  customText?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function TwitterButton({ 
  parlayData, 
  sport, 
  type = 'parlay',
  customText,
  variant = 'outline',
  size = 'sm',
  className = ''
}: TwitterButtonProps) {
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();

  const handleTweet = async () => {
    setIsPosting(true);
    
    try {
      let endpoint = '';
      let body = {};

      if (customText) {
        // Post custom text directly
        endpoint = '/api/twitter/post';
        body = {
          text: customText,
          type: 'custom'
        };
      } else {
        // Generate and post based on type
        endpoint = `/api/twitter/post-generated/${sport}/${type}`;
        body = {
          parlayData: type === 'parlay' ? parlayData : undefined,
          week: getCurrentWeek()
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to post tweet');
      }

      const data = await response.json();
      
      toast({
        title: "Tweet Posted!",
        description: data.message || "Successfully shared to Twitter",
      });

    } catch (error) {
      console.error('Error posting tweet:', error);
      toast({
        title: "Error",
        description: "Failed to post tweet. Please try again.",
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

  const getButtonText = () => {
    if (isPosting) return 'Posting...';
    
    switch (type) {
      case 'parlay':
        return 'Share Parlay';
      case 'betting_picks':
        return 'Share Picks';
      case 'waiver_wire':
        return 'Share Plays';
      default:
        return 'Tweet';
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleTweet}
      disabled={isPosting}
      className={`flex items-center gap-2 ${className}`}
    >
      {isPosting ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Twitter className="h-4 w-4" />
      )}
      {getButtonText()}
    </Button>
  );
}

export default TwitterButton;
