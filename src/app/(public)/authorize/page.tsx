"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ImageIcon, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function getInitials(name: string | undefined | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AuthorizePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appName = searchParams.get("app_name") ?? "Screenshot Tool";
  const redirectUri = searchParams.get("redirect_uri");
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const handleAuthorize = useCallback(async () => {
    try {
      const res = await api.post("/oauth/authorize", {
        app_name: appName,
        redirect_uri: redirectUri || undefined,
      });
      const { key } = res.data.data;

      if (redirectUri) {
        const separator = redirectUri.includes("?") ? "&" : "?";
        window.location.href = `${redirectUri}${separator}api_key=${key}`;
      } else {
        const params = new URLSearchParams({
          key,
          redirect_uri: "evershot://",
        });
        router.push(`/authorize/success?${params}`);
      }
    } catch {
      toast.error("Authorization failed");
    }
  }, [appName, redirectUri, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    const loginUrl = new URL("/auth/login", window.location.origin);
    loginUrl.searchParams.set(
      "redirect",
      window.location.pathname + window.location.search,
    );
    router.push(loginUrl.toString());
    return null;
  }

  const initials = getInitials(user.name);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <ImageIcon className="size-8" />
          </div>
          <CardTitle>Authorize Application</CardTitle>
          <CardDescription>
            <strong>{appName}</strong> wants to upload images to your EverShot
            account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
            <Avatar className="size-10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="text-left text-sm">
              <p className="font-medium">{user.name}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              Upload screenshots to your account
            </p>
            <p className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              View and manage uploaded images
            </p>
          </div>

          <div className="space-y-2">
            <Button className="w-full" onClick={handleAuthorize}>
              Authorize
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
