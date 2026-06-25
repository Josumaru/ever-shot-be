"use client";

import {
  ChevronsUpDown,
  Key,
  LayoutDashboard,
  LogOut,
  Settings2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { authClient, useSession } from "@/lib/auth-client";
import { useTranslation } from "@/lib/i18n";
import { I18N } from "@/shared/constants/i18n-keys";
import { DASHBOARD_PATH } from "@/shared/constants/routes";
import { SIDEBAR_BRAND_NAME } from "@/shared/constants/sidebar";

function getInitials(name: string | undefined | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function NavItems() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const items = [
    {
      href: DASHBOARD_PATH,
      icon: LayoutDashboard,
      key: I18N.SIDEBAR.NAV.OVERVIEW,
    },
    {
      href: "/dashboard/tokens",
      icon: Key,
      key: I18N.SIDEBAR.NAV.TOKENS,
    },
  ];

  return items.map((item) => {
    const isActive = pathname === item.href;
    const label = t(item.key);

    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton asChild tooltip={label}>
          <Link
            href={item.href}
            data-active={isActive || undefined}
            className={
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium relative before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-sidebar-primary"
                : ""
            }
          >
            <item.icon />
            <span>{label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  });
}

function UserMenu() {
  const { data: session } = useSession();
  const user = session?.user;
  const { t } = useTranslation();
  const initials = getInitials(user?.name);

  const handleSignOut = async () => {
    await authClient.signOut();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          tooltip={user?.name ?? t(I18N.SIDEBAR.USER)}
          className="group/user-button h-full bg-transparent"
        >
          <Avatar className="size-7 shrink-0">
            <AvatarImage src={user?.image ?? undefined} />
            <AvatarFallback className="text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col items-start group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">
              {user?.name ?? t(I18N.SIDEBAR.USER)}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.email ?? "mail@josumaru.dev"}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 shrink-0 text-sidebar-foreground/50" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" sideOffset={4}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            window.location.href = "/dashboard/settings";
          }}
        >
          <Settings2 className="size-4" />
          {t(I18N.SIDEBAR.SETTINGS)}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          {t(I18N.SIDEBAR.SIGN_OUT)}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppSidebar() {
  const { t } = useTranslation();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="h-14">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              variant="default"
              size="lg"
              className="group/logo text-base flex items-center font-semibold gap-3"
            >
              <Link href={DASHBOARD_PATH}>
                <Image
                  src="/icon.svg"
                  alt={SIDEBAR_BRAND_NAME}
                  width={24}
                  height={24}
                  unoptimized
                  className="shrink-0 inline-block size-6 dark:invert"
                />
                <span className="truncate">{SIDEBAR_BRAND_NAME}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <NavItems />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="mx-0 w-auto" />

      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
