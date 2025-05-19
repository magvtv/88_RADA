"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlertStore, useForecastStore, useUserStore } from "@/store";
import { AlertItem } from "@/components/alerts/AlertItem";
import { ActionIcons, WeatherDataIcons } from "@/components/ui/icons";
import type { Alert } from "@/types/alert";
import type { DailyForecast } from "@/types/forecast";
import { sendChatQuery } from "@/services/nlpService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AlertsPage() {
  const {
    alerts,
    unreadCount,
    loading,
    markAllAsRead,
    fetchAllAlerts,
    fetchUnreadAlerts
  } = useAlertStore();

  const { weeklyForecast, fetchWeeklyForecast } = useForecastStore();
  const { preferences } = useUserStore();
  
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [mitigationStrategies, setMitigationStrategies] = useState<string[]>([]);
  const [relatedForecast, setRelatedForecast] = useState<DailyForecast | null>(null);
  const [fetchingMitigation, setFetchingMitigation] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const alertsPerPage = 5;

  // Fetch forecast data when component mounts
  useEffect(() => {
    if (!weeklyForecast) {
      fetchWeeklyForecast();
    }
  }, [weeklyForecast, fetchWeeklyForecast]);

  // Set initial user filter based on user preferences
  useEffect(() => {
    if (preferences.userType !== 'general') {
      const filterMap: Record<string, string> = {
        'farmer': 'Farmers',
        'pastoralist': 'Pastoralists',
        'aid_organization': 'Aid Organizations'
      };
      setUserFilter(filterMap[preferences.userType] || null);
    }
  }, [preferences.userType]);

  // Filter alerts based on user type
  const filteredAlerts = useMemo(() => {
    if (!userFilter) return alerts;
    
    return alerts.filter(alert => {
      const description = alert.description.toLowerCase();
      const filterTerms: Record<string, string[]> = {
        'Farmers': ['farmer', 'crop', 'plant', 'harvest', 'agriculture'],
        'Pastoralists': ['pastoralist', 'livestock', 'cattle', 'animal', 'herd'],
        'Aid Organizations': ['aid organization', 'humanitarian', 'relief', 'ngo']
      };
      
      // Check if description explicitly mentions the user type
      if (description.includes(userFilter.toLowerCase())) return true;
      
      // Check for related terms
      const terms = filterTerms[userFilter] || [];
      return terms.some(term => description.includes(term.toLowerCase()));
    });
  }, [alerts, userFilter]);

  // Get paginated alerts
  const paginatedAlerts = useMemo(() => {
    const startIndex = (currentPage - 1) * alertsPerPage;
    return filteredAlerts.slice(startIndex, startIndex + alertsPerPage);
  }, [filteredAlerts, currentPage, alertsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(filteredAlerts.length / alertsPerPage)),
    [filteredAlerts, alertsPerPage]
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [userFilter, showUnreadOnly]);

  const handleAlertSelect = async (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    if (alert) {
      setSelectedAlert(alert);
      setMitigationStrategies([]);
      setRelatedForecast(null);
      
      // Find related forecast data if weeklyForecast exists
      if (weeklyForecast?.forecasts && weeklyForecast.forecasts.length > 0) {
        const alertDate = new Date(alert.timestamp);
        const matchingForecast = weeklyForecast.forecasts.find(f => {
          const forecastDate = new Date(f.date);
          return forecastDate.getDate() === alertDate.getDate() && 
                 forecastDate.getMonth() === alertDate.getMonth() && 
                 forecastDate.getFullYear() === alertDate.getFullYear();
        });
        
        if (matchingForecast) {
          setRelatedForecast(matchingForecast);
        }
      }
      
      // Get mitigation strategies from the chatbot for this specific alert type
      if (alert.severity === "error" || alert.severity === "warning") {
        setFetchingMitigation(true);
        
        // Determine the disaster type from the alert title
        const isFlood = alert.title.toLowerCase().includes("flood");
        const isDrought = alert.title.toLowerCase().includes("drought") || 
                          alert.title.toLowerCase().includes("dry spell");
        
        const disasterType = isFlood ? "flood" : isDrought ? "drought" : "disaster";
        const query = `What are the top 5 mitigation strategies for ${disasterType} in ${alert.location?.name || "Baringo"}?`;
        
        try {
          const response = await sendChatQuery(query);
          // Extract bullet points or numbered list items from the response
          const strategies = response.answer
            .split('\n')
            .filter(line => line.trim().startsWith('-') || 
                   line.trim().startsWith('•') || 
                   line.trim().startsWith('*') || 
                   line.trim().match(/^\d+\./))
            .map(line => line.trim());
          
          setMitigationStrategies(strategies.length > 0 ? strategies : [
            "**Immediate Action**: Seek information from local authorities",
            "**Safety**: Follow evacuation procedures if advised",
            "**Preparation**: Store emergency food, water and medicine supplies",
            "**Documentation**: Protect valuables and important documents",
            "**Stay Informed**: Monitor emergency broadcasts for updates"
          ]);
        } catch (error) {
          console.error("Failed to fetch mitigation strategies:", error);
          setMitigationStrategies([
            "**Immediate Action**: Seek information from local authorities",
            "**Safety**: Follow evacuation procedures if advised",
            "**Preparation**: Store emergency food, water and medicine supplies",
            "**Documentation**: Protect valuables and important documents",
            "**Stay Informed**: Monitor emergency broadcasts for updates"
          ]);
        } finally {
          setFetchingMitigation(false);
        }
      }
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
            {userFilter 
              ? `${filteredAlerts.length} alert${filteredAlerts.length !== 1 ? 's' : ''} for ${userFilter}`
              : unreadCount
                ? `You have ${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}`
                : "No new alerts"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant={userFilter === 'Farmers' ? "default" : "outline"}
              size="sm"
              onClick={() => setUserFilter(userFilter === 'Farmers' ? null : 'Farmers')}
              className="text-xs px-2 py-1 h-8"
            >
              Farmers
            </Button>
            <Button
              variant={userFilter === 'Pastoralists' ? "default" : "outline"}
              size="sm"
              onClick={() => setUserFilter(userFilter === 'Pastoralists' ? null : 'Pastoralists')}
              className="text-xs px-2 py-1 h-8"
            >
              Pastoralists
            </Button>
            <Button
              variant={userFilter === 'Aid Organizations' ? "default" : "outline"}
              size="sm"
              onClick={() => setUserFilter(userFilter === 'Aid Organizations' ? null : 'Aid Organizations')}
              className="text-xs px-2 py-1 h-8"
            >
              Aid Orgs
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              size="sm"
              onClick={handleToggleFilter}
              className="text-xs px-2 py-1 h-8"
            >
              {showUnreadOnly ? "Show All" : "Unread Only"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="text-xs px-2 py-1 h-8"
            >
              <ActionIcons.Check className="mr-2 h-3 w-3" /> Mark All Read
            </Button>
          </div>
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
                {paginatedAlerts.map((alert) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onSelect={handleAlertSelect}
                  />
                ))}
                {filteredAlerts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No alerts found for {userFilter}.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setUserFilter(null)}
                    >
                      <ActionIcons.Refresh className="mr-2 h-4 w-4" /> Clear Filter
                    </Button>
                  </div>
                )}
                
                {/* Pagination Controls */}
                {filteredAlerts.length > 0 && totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      &lt;
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      &gt;
                    </Button>
                  </div>
                )}
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

                <div className="text-sm prose dark:prose-invert prose-sm max-w-none prose-p:my-1 prose-strong:text-primary">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedAlert.description}
                  </ReactMarkdown>
                </div>

                {/* Related forecast data */}
                {relatedForecast && (
                  <div className="p-3 bg-muted/40 rounded-md">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <WeatherDataIcons.Chart className="mr-2 h-4 w-4" />
                      Related Forecast
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Drought Risk:</p>
                        <p className="font-medium">{relatedForecast.weatherData.drought_probability}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Flood Risk:</p>
                        <p className="font-medium">{relatedForecast.weatherData.flood_probability}%</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Condition:</p>
                        <p className="font-medium">{relatedForecast.weatherData.condition}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mitigation strategies */}
                {fetchingMitigation ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <ActionIcons.Loader className="mr-2 h-4 w-4 animate-spin" />
                      Loading Mitigation Strategies...
                    </h4>
                    <div className="pl-2">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                    </div>
                  </div>
                ) : mitigationStrategies.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <ActionIcons.Check className="mr-2 h-4 w-4" />
                      Mitigation Strategies
                    </h4>
                    <div className="text-sm prose dark:prose-invert prose-sm max-w-none pl-2 prose-p:my-1 prose-strong:text-primary prose-li:my-0">
                      {mitigationStrategies.map((strategy, index) => (
                        <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>
                          {strategy.replace(/^[-•\d.]+ ?/, '* ')}
                        </ReactMarkdown>
                      ))}
                    </div>
                  </div>
                )}

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

                {/* Action buttons */}
                <div className="flex flex-col space-y-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      const alertType = selectedAlert.title.toLowerCase().includes("flood") ? "flood" : 
                                       selectedAlert.title.toLowerCase().includes("drought") ? "drought" : "disaster";
                      const userType = selectedAlert.severity === "warning" ? "farmers" : "disaster aid organizations";
                      const location = selectedAlert.location?.name || "Baringo";
                      
                      // Create a more detailed markdown query
                      const query = `# Mitigation Advice Request\n\n` +
                        `Please provide **detailed mitigation strategies** for ${userType} dealing with ` +
                        `${alertType} conditions in **${location}**.\n\n` +
                        `Focus on:\n` +
                        `- Immediate actions\n` +
                        `- Resource management\n` +
                        `- Coordination with authorities\n` +
                        `- Long-term planning`;
                        
                      window.location.href = `/chat?query=${encodeURIComponent(query)}`;
                    }}
                  >
                    Get Detailed Mitigation Advice
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCloseDetail}
                  >
                    Close Details
                  </Button>
                </div>
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
