import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { REFRESH_INTERVALS } from "@/lib/constants";

interface UseRealTimeOptions {
  refreshInterval?: number;
  enabled?: boolean;
  onRefresh?: () => void;
}

export function useRealTime({
  refreshInterval = REFRESH_INTERVALS.STANDARD,
  enabled = true,
  onRefresh
}: UseRealTimeOptions = {}) {
  const [isLive, setIsLive] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [nextRefresh, setNextRefresh] = useState(new Date(Date.now() + refreshInterval));
  const [countdown, setCountdown] = useState(Math.floor(refreshInterval / 1000));
  
  // const queryClient = useQueryClient(); // Temporarily disabled
  const intervalRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();

  // Main refresh logic
  const refresh = async () => {
    try {
      setIsLive(false);
      
      // Invalidate all queries to trigger refetch
      await queryClient.invalidateQueries();
      
      setLastRefresh(new Date());
      setNextRefresh(new Date(Date.now() + refreshInterval));
      setCountdown(Math.floor(refreshInterval / 1000));
      
      onRefresh?.();
      
      setIsLive(true);
    } catch (error) {
      console.error("Refresh failed:", error);
      setIsLive(false);
    }
  };

  // Manual refresh trigger
  const triggerRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    refresh();
    startIntervals();
  };

  // Start intervals
  const startIntervals = () => {
    if (!enabled) return;

    // Main refresh interval
    intervalRef.current = setInterval(refresh, refreshInterval);

    // Countdown interval (every second)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return Math.floor(refreshInterval / 1000);
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Format countdown as MM:SS
  const formatCountdown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Initialize on mount
  useEffect(() => {
    if (enabled) {
      startIntervals();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [enabled, refreshInterval]);

  return {
    isLive,
    lastRefresh,
    nextRefresh,
    countdown,
    countdownFormatted: formatCountdown(countdown),
    triggerRefresh
  };
}

export function useGameDayInterval() {
  const [isGameDay, setIsGameDay] = useState(false);
  
  useEffect(() => {
    // Simple check - in production this would check actual game schedules
    const now = new Date();
    const hour = now.getHours();
    
    // Consider 7AM to 11PM as potential game hours
    setIsGameDay(hour >= 7 && hour <= 23);
  }, []);

  return isGameDay ? REFRESH_INTERVALS.GAME_DAY : REFRESH_INTERVALS.STANDARD;
}
