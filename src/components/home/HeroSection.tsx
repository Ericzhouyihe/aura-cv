import { useTranslations } from "@/i18n/compat/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutTemplate, Check } from "lucide-react";
import AnimatedFeature from "./client/AnimatedFeature";
import GoDashboard from "./GoDashboard";
import Image from "@/lib/image";

export default function HeroSection() {
  const t = useTranslations("home");

  const tags = [
    t("hero.tag1"),
    t("hero.tag2"),
    t("hero.tag3"),
  ];

  return (
    <section className="relative overflow-hidden bg-background pb-20 pt-28 md:pt-36">
      {/* subtle top divider instead of decorative blobs */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,hsl(var(--primary)/0.06),transparent)]" />

      <div className="container relative z-10 mx-auto grid max-w-6xl items-stretch gap-14 px-6 lg:grid-cols-12 lg:gap-10">
        {/* Left: value proposition */}
        <div className="flex flex-col justify-center lg:col-span-5">
          <AnimatedFeature>
            <h1 className="mb-6 font-serif font-semibold leading-[1.2] tracking-tight text-foreground text-2xl md:text-[26px]">
              {t("hero.title")}
            </h1>

            <p className="mb-8 max-w-xl text-lg font-light leading-relaxed text-muted-foreground">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <GoDashboard>
                <Button
                  size="lg"
                  className="group h-12 rounded-xl px-8 text-base font-medium shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-95"
                >
                  {t("hero.cta")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </GoDashboard>

              <GoDashboard type="templates">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl border-border/60 px-8 text-base font-medium transition-all hover:bg-secondary/60 active:scale-95"
                >
                  <LayoutTemplate className="mr-2 h-4 w-4" />
                  {t("hero.secondary")}
                </Button>
              </GoDashboard>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <Check className="h-4 w-4 text-primary/70" />
                  {tag}
                </li>
              ))}
            </ul>
          </AnimatedFeature>
        </div>

        {/* Right: workbench screenshot in a window frame */}
        <div className="lg:col-span-7">
          <AnimatedFeature delay={0.2}>
            <div className="overflow-hidden rounded-xl border border-border/60 bg-secondary/30 shadow-2xl shadow-foreground/5 transition-shadow hover:shadow-foreground/10">
              {/* browser window chrome */}
              <div className="flex h-9 items-center gap-1.5 border-b border-border/50 bg-secondary/60 px-4">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                <span className="ml-3 hidden h-5 flex-1 max-w-[280px] items-center rounded-md bg-background/70 px-3 text-xs text-muted-foreground/70 sm:flex">
                  {t("header.title")} — {t("hero.windowTitle")}
                </span>
              </div>
              <Image
                src="/web-shot.png"
                alt={t("hero.imageAlt")}
                width={1200}
                height={629}
                className="w-full"
                priority
              />
            </div>
          </AnimatedFeature>
        </div>
      </div>
    </section>
  );
}
