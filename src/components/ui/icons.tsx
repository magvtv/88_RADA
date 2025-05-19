import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Sun,
  SunDim,
  Wind,
  ThermometerSun,
  Droplets,
  BarChart,
  MessageSquare,
  Bell,
  Settings,
  Home,
  Menu,
  X,
  ChevronDown,
  AlertTriangle,
  Info,
  Search,
  Mic,
  Calendar,
  Share2,
  Download,
  UserCircle,
  LogOut,
  Moon,
  Check,
  Plus,
  Trash,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  ExternalLink,
  Loader2,
  Globe,
  type LucideIcon,
} from "lucide-react";

// Weather condition icons
export const WeatherIcons: Record<string, LucideIcon> = {
  Sunny: Sun,
  Clear: Sun,
  "Partly Cloudy": SunDim,
  Cloudy: Cloud,
  Overcast: Cloud,
  Rainy: CloudRain,
  Rain: CloudRain,
  Stormy: CloudLightning,
  Thunderstorm: CloudLightning,
  Snowy: CloudSnow,
  Snow: CloudSnow,
  Foggy: CloudFog,
  Fog: CloudFog,
  Windy: Wind,
  "Severe drought": Sun,
  "Moderate drought": Sun,
  "Mild drought": Sun,
  "Severe flood": CloudRain,
  "Moderate flood": CloudRain,
  "Mild flood": CloudRain,
};

// Get weather icon by condition
export function getWeatherIcon(condition: string): LucideIcon {
  if (condition.includes('drought') && condition.includes('flood')) {
    if (condition.includes('Severe drought') || 
        (condition.includes('Moderate drought') && !condition.includes('Severe flood'))) {
      return Sun;
    }
    return CloudRain;
  }
  
  return WeatherIcons[condition] || Cloud;
}

// Navigation icons
export const NavIcons = {
  Home,
  Dashboard: Home,
  Forecast: Calendar,
  Chat: MessageSquare,
  Alerts: Bell,
  Settings,
  Menu,
  Close: X,
};

// Action icons
export const ActionIcons = {
  Search,
  Mic,
  Download,
  Share: Share2,
  Delete: Trash,
  Add: Plus,
  Check,
  Refresh: RefreshCw,
  Next: ArrowRight,
  Previous: ArrowLeft,
  Help: HelpCircle,
  ExternalLink,
  Loader: Loader2,
  Globe,
};

// UI element icons
export const UIIcons = {
  ChevronDown,
  User: UserCircle,
  LogOut,
  Moon,
  Sun,
  Info,
  Warning: AlertTriangle,
  Check,
  Settings,
  Search,
  Close: X,
};

// Weather data icons
export const WeatherDataIcons = {
  Temperature: ThermometerSun,
  Humidity: Droplets,
  Wind,
  Chart: BarChart,
};

// Export all specific icons
export {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Sun,
  SunDim,
  Wind,
  ThermometerSun,
  Droplets,
  BarChart,
  MessageSquare,
  Bell,
  Settings,
  Home,
  Menu,
  X,
  ChevronDown,
  AlertTriangle,
  Info,
  Search,
  Mic,
  Calendar,
  Share2,
  Download,
  UserCircle,
  LogOut,
  Moon,
  Check,
  Plus,
  Trash,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  ExternalLink,
  Globe,
};
