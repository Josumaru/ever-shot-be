"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Key, Loader2, Plus, Trash2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ApiKeyItem = {
  id: string;
  name: string;
  key: string;
  lastUsedAt: string | null;
  createdAt: string;
};

export default function ApiKeysPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push("/auth/login");
      return;
    }
    if (session) fetchKeys();
  }, [session, sessionLoading]);

  async function fetchKeys() {
    try {
      const res = await api.get("/tokens");
      setKeys(res.data.data);
    } catch {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await api.post("/tokens", { name: "Screenshot Tool" });
      const { key } = res.data.data;
      setNewKeyValue(key);
      await fetchKeys();
    } catch {
      toast.error("Failed to create API key");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/tokens/${id}`);
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success("API key deleted");
    } catch {
      toast.error("Failed to delete API key");
    }
  }

  const isBusy = sessionLoading || loading;

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className={cn(
          "flex items-center justify-between transition-opacity duration-200",
          isBusy && "pointer-events-none opacity-40",
        )}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage keys for external apps
          </p>
        </div>
        <Button onClick={handleCreate} disabled={creating} className="gap-2">
          {creating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          New Key
        </Button>
      </div>

      {newKeyValue && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Key created! Copy it now — it won&apos;t be shown again.
            </p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={newKeyValue}
                className="font-mono text-xs bg-background"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(newKeyValue);
                  setNewKeyValue(null);
                  toast.success("Copied!");
                }}
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {keys.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex items-center justify-center size-16 rounded-2xl bg-muted mb-5">
            <Key className="size-7 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No API keys</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Create an API key to let external apps upload images to your
            account.
          </p>
          <Button onClick={handleCreate} disabled={creating} className="gap-2">
            <Plus className="size-4" />
            Create API Key
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "space-y-3 transition-opacity duration-200",
            isBusy && "pointer-events-none opacity-40",
          )}
        >
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-medium">{key.name}</p>
                <p className="text-xs font-mono text-muted-foreground">
                  {key.key}
                </p>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(key.createdAt).toLocaleDateString()}
                </p>
              </div>
              {confirmDeleteId === key.id ? (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      handleDelete(key.id);
                      setConfirmDeleteId(null);
                    }}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmDeleteId(key.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
