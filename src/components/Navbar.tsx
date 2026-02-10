"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HardHat, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavbarProps {
  user?: { email?: string } | null;
}

export function Navbar({ user: userProp }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clientUser, setClientUser] = useState<{ email?: string } | null>(null);
  const isLanding = pathname === "/";

  // If no user prop was passed (e.g. landing page), check browser session
  useEffect(() => {
    if (userProp) return; // server already told us
    const supabase = createClient();
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setClientUser({ email: data.user.email ?? "" });
    };
    check();
  }, [userProp]);

  const user = userProp ?? clientUser;

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-sm",
        isLanding ? "bg-white/80" : "bg-card/80"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-safety-orange">
            <HardHat className="size-4.5 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">
            Cali<span className="text-safety-orange">Code</span>{" "}
            <span className="font-mono text-xs text-muted-foreground">24</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {user ? (
            <>
              <Button
                variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                size="sm"
                asChild
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="size-3.5" />
                  Dashboard
                </Link>
              </Button>
              <div className="mx-2 h-5 w-px bg-border" />
              <span className="text-xs text-muted-foreground mr-2 hidden md:inline">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="size-3.5" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Start Free</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="sm:hidden p-1.5"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t bg-card px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-1">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  asChild
                  onClick={() => setMobileOpen(false)}
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="size-3.5" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="size-3.5" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  asChild
                  onClick={() => setMobileOpen(false)}
                >
                  <Link href="/login">Log In</Link>
                </Button>
                <Button
                  size="sm"
                  className="justify-start"
                  asChild
                  onClick={() => setMobileOpen(false)}
                >
                  <Link href="/signup">Start Free</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
