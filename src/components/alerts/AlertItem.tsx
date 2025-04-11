"use client";

import type { Alert } from "@/types/alert";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Check,
  MapPin,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAlertStore } from "@/store";

interface AlertItemProps {
  alert: Alert;
  onSelect?: (id: string) => void;
}

export function AlertItem({ alert, onSelect }: AlertItemProps) {
  const markAsRead = useAlertStore((state) => state.markAsRead);

  // Format timestamp to relative time
  const timeAgo = formatDistanceToNow(new Date(alert.timestamp), {
    addSuffix: true,
  });

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

  return (
    <div
      className={cn(
        "bg-card rounded-md p-4 mb-3 cursor-pointer transition-all hover:shadow-md",
        getSeverityClass(),
        !alert.isRead && "bg-muted/50"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
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
          <p className="text-sm text-muted-foreground mt-1">
            {alert.description}
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
