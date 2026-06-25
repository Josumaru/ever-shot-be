"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, ImageIcon, Loader2, Save, Upload } from "lucide-react";
import { useSession, updateUser } from "@/lib/auth-client";
import { api } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export default function SettingsPage() {
  const { t } = useTranslation();
  const { data: session, isPending: sessionLoading, refetch } = useSession();
  const user = session?.user;

  const loading = sessionLoading;
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const avatarUrl = user?.image || null;

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");

      const res = await api.post("/storage", formData);
      const { path } = res.data.data;

      const proxyUrl = `/api/v1/storage?file=${encodeURIComponent(path)}`;

      await updateUser({ image: proxyUrl });
      await refetch();

      toast.success("Avatar updated");
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      await updateUser({ name: name.trim() });
      await refetch();
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  const initials = getInitials(user?.name);

  return (
    <div className="flex flex-col gap-6">
      <div
        className={cn(
          "flex items-center justify-between transition-opacity duration-200",
          loading && "pointer-events-none opacity-40",
        )}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your account settings
          </p>
        </div>
      </div>

      <div
        className={cn(
          "max-w-xl transition-opacity duration-200",
          loading && "pointer-events-none opacity-40",
        )}
      >
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your name and avatar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <Avatar className="size-16">
                  <AvatarImage src={avatarUrl ?? undefined} />
                  <AvatarFallback className="text-base">
                    {uploading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      initials
                    )}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="size-5 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email ?? ""}
                disabled
                className="bg-muted"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
