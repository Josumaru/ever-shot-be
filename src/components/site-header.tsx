"use client";

import { LayoutDashboard, LogOut, Settings2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LocaleToggle } from "@/components/locale-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient, useSession } from "@/lib/auth-client";
import { useTranslation } from "@/lib/i18n";
import { I18N } from "@/shared/constants/i18n-keys";

function getInitials(name: string | undefined | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function SiteHeader() {
  const { data: session } = useSession();
  const user = session?.user;
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await authClient.signOut();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 h-14">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-base"
        >
          <Image
            src="/icon.svg"
            alt="EverShot"
            width={24}
            height={24}
            unoptimized
            className="dark:invert"
          />
          EVERSHOT
        </Link>
        <nav className="flex items-center gap-2">
          <LocaleToggle />
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="ml-2 h-9 w-9 rounded-full p-0"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback className="text-xs font-medium">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = "/dashboard";
                  }}
                >
                  <LayoutDashboard className="size-4" />
                  {t(I18N.DASHBOARD.TITLE)}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = "/dashboard/settings";
                  }}
                >
                  <Settings2 className="size-4" />
                  {t(I18N.SIDEBAR.SETTINGS)}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" />
                  {t(I18N.SIDEBAR.SIGN_OUT)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  {t(I18N.LANDING.SIGN_IN)}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">{t(I18N.LANDING.GET_STARTED)}</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
