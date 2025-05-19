"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUserStore } from "@/store";
import { NavIcons, UIIcons } from "@/components/ui/icons";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<{email?: string, name?: string, image?: string} | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { theme, setTheme } = useTheme();
  const userPreferences = useUserStore((state) => state.preferences);
  const setLanguage = useUserStore((state) => state.setLanguage);
  const router = useRouter();

  const languages = [
    { code: "en" as const, label: "English" },
    { code: "sw" as const, label: "Swahili" },
  ];

  useEffect(() => {
    // Check if user is authenticated by looking for the token
    const authToken = localStorage.getItem('authToken');
    setIsAuthenticated(!!authToken);
    
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }, []);

  const handleLogout = () => {
    router.push('/auth/logout');
  };

  // Get initials for avatar fallback from the email
  const getInitials = () => {
    if (user?.name) {
      return user.name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return '?';
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
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
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
              className="h-6 w-6 hidden md:inline-block"
            />
            <span className="font-bold text-xl hidden md:inline-block">
              RADA
            </span>
          </Link>
        </div>

        {/* Search Bar (on larger screens or when toggled) */}
        <div
          className={`${
            isSearchOpen ? "flex" : "hidden md:flex"
          } absolute left-0 top-16 md:static md:w-1/3 w-full px-4 py-4 md:p-0} ${
            isSearchOpen ? "bg-background/80 backdrop-blur-sm" : ""
          }`}
        >
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Search region levels in Baringo..."
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

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="User Menu">
                <Avatar className="h-8 w-8">
                  {user?.image ? (
                    <AvatarImage
                      src={user.image}
                      alt={user.name || user.email || ""}
                    />
                  ) : (
                    <AvatarFallback>
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>


            <DropdownMenuContent align="center">
              {isAuthenticated ? (
                <>
                  <DropdownMenuLabel>
                    {user?.email || "My Account"}
                  </DropdownMenuLabel>

                  {/* Theme Toggle */}
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <UIIcons.Sun className="mr-2 h-4 w-4" />
                    <span>
                      Light
                      </span>
                    {theme === "light" && (
                      <UIIcons.Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <UIIcons.Moon className="mr-2 h-4 w-4" />
                    <span>
                      Dark
                    </span>
                    {theme === "dark" && (
                      <UIIcons.Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

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

                  {/* Logout */}
                  <DropdownMenuItem asChild>
                    <Link href="/auth/logout">
                      <UIIcons.LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </Link>
                  </DropdownMenuItem>
              </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/login">
                      <UIIcons.User className="mr-2 h-4 w-4" />
                      <span>Login</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/auth/signup">
                      <UIIcons.User className="mr-2 h-4 w-4" />
                      <span>Sign Up</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
