import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
  FileCheck,
  Star,
  HardHat,
  Upload,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { PricingUpgradeButton } from "@/components/PricingUpgradeButton";

function TrustBadge({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-blueprint-line bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground">
      <Icon className="size-3.5 text-safety-orange" />
      {label}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-blueprint">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-blueprint-grid">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            {/* Trust badges row */}
            <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
              <TrustBadge icon={Shield} label="SOC 2 Compliant" />
              <TrustBadge icon={FileCheck} label="2025 Code Updated" />
              <TrustBadge icon={Zap} label="Results in &lt;30s" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Instant Title 24 Compliance Checks{" "}
              <span className="text-safety-orange">
                for California Contractors
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Stop paying consultants $150/hr. Upload your plans and get a
              pass/fail report in seconds — powered by AI that knows the 2025
              California Energy Code inside and out.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/signup">
                  Check Compliance Now
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base"
                asChild
              >
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required. 1 free project per month.
            </p>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blueprint to-transparent" />
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Three Steps. Zero Headaches.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
            From plan upload to compliance report in under a minute.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "01",
                icon: Upload,
                title: "Upload Your Plans",
                desc: "Drag & drop floor plans, equipment lists, or snap a photo on your phone. We accept JPG, PNG, and PDF.",
              },
              {
                step: "02",
                icon: Zap,
                title: "AI Scans for Compliance",
                desc: "Our AI checks your plans against every applicable section of the 2025 California Title 24 Energy Code.",
              },
              {
                step: "03",
                icon: FileCheck,
                title: "Get Your Report",
                desc: "Receive a detailed pass/fail report with specific code citations and actionable fixes — instantly.",
              },
            ].map((item) => (
              <Card key={item.step} className="relative overflow-hidden">
                <div className="absolute top-4 right-4 font-mono text-4xl font-black text-muted/60">
                  {item.step}
                </div>
                <CardHeader>
                  <div className="flex size-11 items-center justify-center rounded-lg bg-safety-orange/10">
                    <item.icon className="size-5 text-safety-orange" />
                  </div>
                  <CardTitle className="mt-2">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Trusted by California Contractors
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                quote:
                  "Saved us 3 hours per project on compliance reviews. We run every plan through CaliCode before submitting now.",
                name: "Mike Reynolds",
                role: "Owner, Reynolds HVAC Pros",
                stars: 5,
              },
              {
                quote:
                  "The AI caught a Section 150.1 ventilation issue my team missed. Paid for itself on the first job.",
                name: "Sarah Chen",
                role: "Project Manager, Pacific Builders",
                stars: 5,
              },
              {
                quote:
                  "My inspectors love the detailed citations. Makes the review process 10x smoother.",
                name: "Dave Ortiz",
                role: "General Contractor, Ortiz & Sons",
                stars: 5,
              },
            ].map((t) => (
              <Card key={t.name}>
                <CardContent>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 fill-safety-orange text-safety-orange"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </CardContent>
                <CardFooter>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
            Start free. Upgrade when you need more firepower.
          </p>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Free Tier */}
            <Card>
              <CardHeader>
                <CardDescription>Free</CardDescription>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Perfect for trying it out
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  "1 project per month",
                  "AI compliance analysis",
                  "Basic code citations",
                  "Email support",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="size-4 shrink-0 text-pass" />
                    {f}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/signup">Get Started Free</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Tier — Featured */}
            <Card className="relative border-safety-orange shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-safety-orange px-3 py-0.5 text-xs font-bold text-white">
                MOST POPULAR
              </div>
              <CardHeader>
                <CardDescription>Pro</CardDescription>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$99</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  For active contractors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  "Unlimited projects",
                  "AI compliance analysis",
                  "Detailed code citations",
                  "PDF report generation",
                  "Priority support",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="size-4 shrink-0 text-pass" />
                    {f}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <PricingUpgradeButton />
              </CardFooter>
            </Card>

            {/* Enterprise */}
            <Card>
              <CardHeader>
                <CardDescription>Enterprise</CardDescription>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">Custom</span>
                </div>
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  For large firms & teams
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  "Everything in Pro",
                  "Team management",
                  "API access",
                  "Custom integrations",
                  "Dedicated account manager",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="size-4 shrink-0 text-pass" />
                    {f}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-safety-orange/10">
            <HardHat className="size-7 text-safety-orange" />
          </div>
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to Save Hours on Compliance?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join hundreds of California contractors who trust CaliCode 24 for
            instant Title 24 compliance checks.
          </p>
          <Button size="lg" className="mt-6 h-12 px-8 text-base" asChild>
            <Link href="/signup">
              Upload Your First Plan
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded bg-safety-orange">
              <HardHat className="size-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold">
              CaliCode <span className="font-mono text-xs text-muted-foreground">24</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Clock className="size-3" />
            <span>2025 California Title 24 Energy Code</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CaliCode 24. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
