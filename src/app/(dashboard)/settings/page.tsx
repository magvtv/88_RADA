"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUserStore } from "@/store";
import { useTheme } from "@/components/ui/theme-provider";
import type { TemperatureUnit, Language } from "@/types/user";
import { toast } from "sonner";
import { UIIcons } from "@/components/ui/icons";

export default function SettingsPage() {
  const userPreferences = useUserStore((state) => state.preferences);
  const {
    setTemperatureUnit,
    setLanguage,
    setTheme,
    setNotificationPreference,
    setDefaultLocation,
    clearDefaultLocation,
    resetPreferences,
  } = useUserStore();
  const { theme } = useTheme();

  const [locationName, setLocationName] = useState(
    userPreferences.defaultLocation?.name || ""
  );
  const [latitude, setLatitude] = useState(
    userPreferences.defaultLocation?.coordinates.latitude.toString() || ""
  );
  const [longitude, setLongitude] = useState(
    userPreferences.defaultLocation?.coordinates.longitude.toString() || ""
  );

  const languages = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "zh", label: "中文" },
    { code: "ja", label: "日本語" },
  ];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    toast.success(`Language changed to ${languages.find(l => l.code === lang)?.label || lang}`);
  };

  const handleTemperatureUnitChange = (unit: TemperatureUnit) => {
    setTemperatureUnit(unit);
    toast.success(`Temperature unit changed to ${unit === "celsius" ? "Celsius (°C)" : "Fahrenheit (°F)"}`);
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleNotificationChange = (
    type: "enabled" | "alerts" | "forecasts" | "chat",
    checked: boolean
  ) => {
    setNotificationPreference(type, checked);

    if (type === "enabled") {
      toast.success(checked ? "Notifications enabled" : "Notifications disabled");
    } else {
      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} notifications ${
          checked ? "enabled" : "disabled"
        }`
      );
    }
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();

    const latValue = Number.parseFloat(latitude);
    const lonValue = Number.parseFloat(longitude);

    if (isNaN(latValue) || isNaN(lonValue)) {
      toast.error("Please enter valid coordinates");
      return;
    }

    if (latValue < -90 || latValue > 90) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }

    if (lonValue < -180 || lonValue > 180) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }

    if (!locationName.trim()) {
      toast.error("Please enter a location name");
      return;
    }

    setDefaultLocation(locationName, latValue, lonValue);
    toast.success("Default location saved");
  };

  const handleClearLocation = () => {
    clearDefaultLocation();
    setLocationName("");
    setLatitude("");
    setLongitude("");
    toast.success("Default location cleared");
  };

  const handleResetPreferences = () => {
    if (window.confirm("Are you sure you want to reset all preferences to default?")) {
      resetPreferences();
      toast.success("All preferences reset to default values");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences and application settings</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetPreferences}
        >
          Reset to Defaults
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme Setting */}
            <div className="space-y-4">
              <div className="font-medium">Theme</div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => handleThemeChange("light")}
                >
                  <UIIcons.Sun className="mr-2 h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => handleThemeChange("dark")}
                >
                  <UIIcons.Moon className="mr-2 h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => handleThemeChange("system")}
                >
                  <span className="mr-2">💻</span>
                  System
                </Button>
              </div>
            </div>

            {/* Language Setting */}
            <div className="space-y-4">
              <div className="font-medium">Language</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={userPreferences.language === lang.code ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => handleLanguageChange(lang.code as Language)}
                  >
                    {lang.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Temperature Unit Setting */}
            <div className="space-y-4">
              <div className="font-medium">Temperature Unit</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={userPreferences.temperatureUnit === "celsius" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => handleTemperatureUnitChange("celsius")}
                >
                  Celsius (°C)
                </Button>
                <Button
                  variant={userPreferences.temperatureUnit === "fahrenheit" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => handleTemperatureUnitChange("fahrenheit")}
                >
                  Fahrenheit (°F)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage push notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Enable Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Allow the app to send you notifications
                </div>
              </div>
              <Switch
                checked={userPreferences.notifications.enabled}
                onCheckedChange={(checked) => handleNotificationChange("enabled", checked)}
                aria-label="Enable notifications"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Weather Alerts</div>
                <div className="text-sm text-muted-foreground">
                  Receive notifications for severe weather alerts
                </div>
              </div>
              <Switch
                checked={userPreferences.notifications.alerts}
                onCheckedChange={(checked) => handleNotificationChange("alerts", checked)}
                disabled={!userPreferences.notifications.enabled}
                aria-label="Enable weather alerts"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Forecast Updates</div>
                <div className="text-sm text-muted-foreground">
                  Receive notifications when forecasts are updated
                </div>
              </div>
              <Switch
                checked={userPreferences.notifications.forecasts}
                onCheckedChange={(checked) => handleNotificationChange("forecasts", checked)}
                disabled={!userPreferences.notifications.enabled}
                aria-label="Enable forecast updates"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Chat Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Receive notifications for chatbot responses
                </div>
              </div>
              <Switch
                checked={userPreferences.notifications.chat}
                onCheckedChange={(checked) => handleNotificationChange("chat", checked)}
                disabled={!userPreferences.notifications.enabled}
                aria-label="Enable chat notifications"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Default Location</CardTitle>
            <CardDescription>Set your default weather forecast location</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveLocation} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location-name">Location Name</Label>
                  <Input
                    id="location-name"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g., New York City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g., 40.7128"
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g., -74.0060"
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Set your default location for weather forecasts. You can find coordinates using Google Maps.
              </p>
              <div className="flex items-center space-x-2">
                <Button type="submit">Save Location</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearLocation}
                  disabled={!userPreferences.defaultLocation}
                >
                  Clear Location
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
