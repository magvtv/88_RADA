"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlertStore } from "@/store";
import { AlertItem } from "@/components/alerts/AlertItem";
import { ActionIcons } from "@/components/ui/icons";
import type { Alert } from "@/types/alert";

export default function AlertsPage() {
  const {
    alerts,
    unreadCount,
    loading,
    markAllAsRead,
    fetchAllAlerts,
    fetchUnreadAlerts
  } = useAlertStore();

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const handleAlertSelect = (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    if (alert) {
      setSelectedAlert(alert);
    }
  };

  const handleCloseDetail = () => {
    setSelectedAlert(null);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setSelectedAlert(null);
  };

  const handleToggleFilter = () => {
    setSelectedAlert(null);
    setShowUnreadOnly(!showUnreadOnly);

    if (!showUnreadOnly) {
      fetchUnreadAlerts();
    } else {
      fetchAllAlerts();
    }
  };

  // Format timestamp to display
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Disaster Alerts</h1>
          <p className="text-muted-foreground">
            {unreadCount
              ? `You have ${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}`
              : "No new alerts"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showUnreadOnly ? "default" : "outline"}
            size="sm"
            onClick={handleToggleFilter}
          >
            {showUnreadOnly ? "Show All" : "Show Unread Only"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <ActionIcons.Check className="mr-2 h-4 w-4" /> Mark All as Read
          </Button>
        </div>
      </div>

      {/* Alerts Interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Alerts List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {showUnreadOnly ? "Unread Alerts" : "All Disaster Alerts"}
            </CardTitle>
            <CardDescription>
              {showUnreadOnly
                ? "Showing only unread alerts"
                : "Showing all alerts and notifications"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onSelect={handleAlertSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {showUnreadOnly
                    ? "No unread alerts at this time."
                    : "No alerts at this time."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  <ActionIcons.Refresh className="mr-2 h-4 w-4" /> Refresh
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert Detail */}
        <Card>
          <CardHeader>
            <CardTitle>Disaster Alert Details</CardTitle>
            <CardDescription>
              {selectedAlert
                ? "Selected alert information"
                : "Select an alert to view details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedAlert ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{selectedAlert.title}</h3>
                  <div className={`px-3 py-1 rounded-full inline-block text-sm font-medium ${
                    selectedAlert.severity === "error"
                      ? "bg-destructive/10 text-destructive"
                      : selectedAlert.severity === "warning"
                      ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  }`}>
                    {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)}
                  </div>
                </div>

                <p className="text-sm">{selectedAlert.description}</p>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Time:</strong> {formatTimestamp(selectedAlert.timestamp)}</p>
                    {selectedAlert.location && (
                      <p><strong>Location:</strong> {selectedAlert.location.name}</p>
                    )}
                    {selectedAlert.source && (
                      <p><strong>Source:</strong> {selectedAlert.source}</p>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseDetail}
                  className="w-full"
                >
                  Close Details
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Select an alert from the list to view its details
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
