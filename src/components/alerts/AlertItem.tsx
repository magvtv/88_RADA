"use client";

import type { Alert } from "@/types/alert";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Check,
  MapPin,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAlertStore } from "@/store";

interface AlertItemProps {
  alert: Alert;
  onSelect?: (id: string) => void;
}

export function AlertItem({ alert, onSelect }: AlertItemProps) {

  // const severityColors = {
  //   info: "bg-blue-500/10 text-blue-600",
  //   warning: "bg-yellow-500/10 text-yellow-600",
  //   error: "bg-red-500/10 text-red-600",
  // }


  const markAsRead = useAlertStore((state) => state.markAsRead);

  // Format timestamp to relative time
  const timeAgo = formatDistanceToNow(new Date(alert.timestamp), {
    addSuffix: true,
  });

  // Extract target audience from description if available
  const getTargetAudience = (): string | null => {
    const audienceMatch = alert.description.match(/\*\*Alert for ([^:]*)\*\*/i) || 
                         alert.description.match(/\*\*([^:]*) Alert\*\*/i) ||
                         alert.description.match(/\*\*Notice for ([^:]*)\*\*/i) ||
                         alert.description.match(/\*\*Urgent Alert for ([^:]*)\*\*/i);
    
    return audienceMatch ? audienceMatch[1] : null;
  };

  // Get truncated description without the audience prefix
  const getTruncatedDescription = (): string => {
    // Remove markdown formatting and audience prefix
    let cleanDescription = alert.description
      .replace(/\*\*Alert for [^:]*\*\*: /g, '')
      .replace(/\*\*[^:]*? Alert\*\*: /g, '')
      .replace(/\*\*Notice for [^:]*\*\*: /g, '')
      .replace(/\*\*Urgent Alert for [^:]*\*\*: /g, '')
      .replace(/\*\*/g, '');
    
    // Truncate to reasonable length for card view  
    return cleanDescription.length > 120 
      ? cleanDescription.substring(0, 120) + '...' 
      : cleanDescription;
  };

  // Get alert icon based on severity
  const getAlertIcon = () => {
    switch (alert.severity) {
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Get severity class
  const getSeverityClass = () => {
    switch (alert.severity) {
      case "error":
        return "border-l-4 border-destructive";
      case "warning":
        return "border-l-4 border-yellow-500";
      default:
        return "border-l-4 border-blue-500";
    }
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(alert.id);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click
    markAsRead(alert.id);
  };

  const targetAudience = getTargetAudience();

  return (
    <div
      className={cn(
        "bg-card rounded-md p-4 mb-3 cursor-pointer transition-all hover:shadow-md",
        getSeverityClass(),
        !alert.isRead && "bg-muted/50"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3 my-2">
        <div className="mt-1">{getAlertIcon()}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-sm sm:text-base">{alert.title}</h3>
            {!alert.isRead && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleMarkAsRead}
                aria-label="Mark as read"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {targetAudience && (
            <div className="flex items-center gap-1 mt-1 mb-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                For: {targetAudience}
              </span>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground mt-1">
            {getTruncatedDescription()}
          </p>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{timeAgo}</span>
            {alert.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{alert.location.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
