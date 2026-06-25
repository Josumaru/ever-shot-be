"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthorizeSuccessPage() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key") ?? "";
  const redirectUri = searchParams.get("redirect_uri");
  const [copied, setCopied] = useState(false);
  const redirected = useRef(false);

  useEffect(() => {
    if (redirectUri && !redirected.current) {
      redirected.current = true;
      const separator = redirectUri.includes("?") ? "&" : "?";
      const url = `${redirectUri}${separator}api_key=${key}`;
      window.location.href = url;
    }
  }, [redirectUri, key]);

  function handleCopy() {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="size-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="size-6 text-emerald-500" />
            </div>
          </div>
          <CardTitle>Authorized!</CardTitle>
          <CardDescription>
            {redirectUri
              ? "Redirecting to the app..."
              : "API key created. Copy it now — it won&apos;t be shown again."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input readOnly value={key} className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              <Copy className="size-4" />
            </Button>
          </div>
          {!redirectUri && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.location.href = `/dashboard/tokens`;
              }}
            >
              Manage Tokens
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
