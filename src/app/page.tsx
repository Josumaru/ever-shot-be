"use client";

import Link from "next/link";
import {
  ArrowRight,
  ImageIcon,
  Upload,
  Share2,
  LayoutDashboard,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { useTranslation } from "@/lib/i18n";
import { I18N } from "@/shared/constants/i18n-keys";

const features = [
  {
    icon: Upload,
    titleKey: I18N.LANDING.FEATURES_UPLOAD_TITLE,
    descKey: I18N.LANDING.FEATURES_UPLOAD_DESC,
  },
  {
    icon: Share2,
    titleKey: I18N.LANDING.FEATURES_SHARE_TITLE,
    descKey: I18N.LANDING.FEATURES_SHARE_DESC,
  },
  {
    icon: LayoutDashboard,
    titleKey: I18N.LANDING.FEATURES_DASHBOARD_TITLE,
    descKey: I18N.LANDING.FEATURES_DASHBOARD_DESC,
  },
  {
    icon: Shield,
    titleKey: I18N.LANDING.FEATURES_PRIVATE_TITLE,
    descKey: I18N.LANDING.FEATURES_PRIVATE_DESC,
  },
  {
    icon: Zap,
    titleKey: I18N.LANDING.FEATURES_COMPRESS_TITLE,
    descKey: I18N.LANDING.FEATURES_COMPRESS_DESC,
  },
  {
    icon: ImageIcon,
    titleKey: I18N.LANDING.FEATURES_QUALITY_TITLE,
    descKey: I18N.LANDING.FEATURES_QUALITY_DESC,
  },
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-muted/30 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-foreground/5 to-transparent rounded-full blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1 text-sm text-muted-foreground mb-8 animate-fade-in">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t(I18N.LANDING.BADGE)}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-in-delay-1">
              {t(I18N.LANDING.HERO_TITLE)}
              <br />
              <span className="bg-linear-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
                {t(I18N.LANDING.HERO_TITLE_ACCENT)}
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-lg mx-auto animate-fade-in-delay-2">
              {t(I18N.LANDING.HERO_DESC)}
            </p>

            <div className="mt-10 flex items-center justify-center gap-4 animate-fade-in-delay-3">
              <Link href="/auth/register">
                <Button size="lg" className="gap-2 h-11 px-6 text-base">
                  {t(I18N.LANDING.START_SHARING)}{" "}
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 px-6 text-base"
                >
                  {t(I18N.LANDING.SIGN_IN)}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.titleKey}
                    className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-center size-10 rounded-lg bg-muted text-foreground mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="font-semibold text-base mb-1.5">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(feature.descKey)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>EVERSHOT</span>
          <span>{t(I18N.LANDING.FOOTER)}</span>
        </div>
      </footer>
    </div>
  );
}
