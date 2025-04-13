"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/ui/theme-provider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUserStore } from "@/store";
import { NavIcons, UIIcons } from "@/components/ui/icons";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const userPreferences = useUserStore((state) => state.preferences);
  const setLanguage = useUserStore((state) => state.setLanguage);
  const setTemperatureUnit = useUserStore((state) => state.setTemperatureUnit);

  const languages = [
    { code: "en" as const, label: "English" },
    { code: "sw" as const, label: "Swahili" },
  ];

  const handleTemperatureUnitToggle = () => {
    const newUnit = userPreferences.temperatureUnit === "celsius"
      ? "fahrenheit"
      : "celsius";
    setTemperatureUnit(newUnit);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-2">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open Menu"
              >
                <NavIcons.Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="RADA Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-bold text-xl hidden sm:inline-block">
              RADA
            </span>
          </Link>
        </div>

        {/* Search Bar (on larger screens or when toggled) */}
        <div
          className={`${
            isSearchOpen ? "flex" : "hidden md:flex"
          } absolute left-0 top-16 md:static md:w-1/3 w-full px-4 py-2 md:p-0`}
        >
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Search forecasts, locations..."
              className="w-full pr-8"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
              aria-label="Search"
            >
              <UIIcons.Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Search Toggle (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label={isSearchOpen ? "Close Search" : "Open Search"}
          >
            {isSearchOpen ? (
              <UIIcons.Close className="h-5 w-5" />
            ) : (
              <UIIcons.Search className="h-5 w-5" />
            )}
            <span className="sr-only">
              {isSearchOpen ? "Close Search" : "Open Search"}
            </span>
          </Button>

          {/* Unit Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTemperatureUnitToggle}
            className="hidden md:flex"
          >
            {userPreferences.temperatureUnit === "celsius" ? "°C" : "°F"}
          </Button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="User Menu">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Theme Toggle */}
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <UIIcons.Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
                {theme === "light" && (
                  <UIIcons.Check className="ml-auto h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <UIIcons.Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
                {theme === "dark" && (
                  <UIIcons.Check className="ml-auto h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <span className="mr-2">💻</span>
                <span>System</span>
                {theme === "system" && (
                  <UIIcons.Check className="ml-auto h-4 w-4" />
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Temperature Unit (Mobile) */}
              <DropdownMenuItem
                onClick={handleTemperatureUnitToggle}
                className="md:hidden"
              >
                <span>
                  {userPreferences.temperatureUnit === "celsius"
                    ? "°C Celsius"
                    : "°F Fahrenheit"}
                </span>
              </DropdownMenuItem>

              {/* Language Menu */}
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                >
                  <span>{lang.label}</span>
                  {userPreferences.language === lang.code && (
                    <UIIcons.Check className="ml-auto h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <UIIcons.Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
