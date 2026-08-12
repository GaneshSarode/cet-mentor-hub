"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, GraduationCap, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/colleges", label: "Colleges" },
  { href: "/predict", label: "Predict" },
  { href: "/papers", label: "Tests" },
  { href: "/practice", label: "Practice" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isSignedIn } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 ${
        isScrolled ? "mt-4 px-4" : "mt-0 px-0"
      }`}
    >
      <nav 
        className={`w-full transition-all duration-300 ${
          isScrolled 
            ? "max-w-5xl rounded-full bg-background/80 backdrop-blur-lg border border-border shadow-lg shadow-black/5" 
            : "max-w-7xl bg-transparent"
        }`}
      >
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${
          isScrolled ? "h-14" : "h-16"
        }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden transition-transform group-hover:scale-105">
              <img src="/logo.png" alt="CET Mentor Hub Logo" className="h-full w-full object-cover" />
            </div>
            <span className={`font-bold text-lg ${isScrolled || pathname !== "/" ? "text-foreground" : "text-white"}`}>
              CET Mentor Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full z-10 ${
                  isActive
                    ? "text-slate-900"
                    : isScrolled || pathname !== "/"
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-indicator"
                    className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                {link.label}
              </Link>
            )})}

          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            {/* Dark Mode Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={`rounded-full transition-colors ${
                  isScrolled || pathname !== "/"
                    ? "text-foreground hover:bg-muted"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            {/* Auth Buttons */}
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                  <Button
                    variant="outline"
                    className={`rounded-full ${
                      isScrolled || pathname !== "/"
                        ? "border-primary text-primary hover:bg-primary/10"
                        : "border-white/20 text-white hover:bg-white/10"
                    }`}
                  >
                    Login
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                  <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Get Started
                  </Button>
                </SignUpButton>
              </>
            ) : (
              <UserButton />
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Dark Mode Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={`rounded-lg ${
                  isScrolled || pathname !== "/" ? "text-foreground" : "text-white"
                }`}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`md:hidden ${
                    isScrolled || pathname !== "/" ? "text-foreground" : "text-white"
                  }`}
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm">
                <div className="flex flex-col gap-6 pt-6">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden">
                        <img src="/logo.png" alt="CET Mentor Hub Logo" className="h-full w-full object-cover" />
                      </div>
                      <span className="font-bold text-lg">CET Mentor Hub</span>
                    </Link>
                  </div>
                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link) => {
                      const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                      return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`px-4 py-3 font-medium transition-colors ${
                          isActive
                            ? "bg-white text-slate-900 rounded-full"
                            : "rounded-lg text-foreground hover:bg-muted"
                        }`}
                      >
                        {link.label}
                      </Link>
                    )})}
                    
                  </nav>
                  <div className="flex flex-col gap-3 pt-4 border-t">
                    {!isSignedIn ? (
                      <>
                        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                          <Button variant="outline" className="w-full">
                            Sign In
                          </Button>
                        </SignInButton>
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                          <Button className="w-full bg-primary hover:bg-primary/90">
                            Get Started
                          </Button>
                        </SignUpButton>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 px-1">
                        <UserButton />
                        <span className="text-sm text-muted-foreground">My Account</span>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
