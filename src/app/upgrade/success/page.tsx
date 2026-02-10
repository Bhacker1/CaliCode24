import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, ArrowRight, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function UpgradeSuccessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-blueprint bg-blueprint-grid px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center text-center py-10 space-y-5">
          <div className="flex size-16 items-center justify-center rounded-full bg-pass/10">
            <CheckCircle2 className="size-8 text-pass" />
          </div>

          <div>
            <h1 className="text-xl font-bold">Welcome to Pro!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account has been upgraded. You now have unlimited projects,
              PDF exports, detailed citations, and priority support.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-safety-orange/20 bg-safety-orange/5 px-4 py-2">
            <HardHat className="size-4 text-safety-orange" />
            <span className="text-sm font-semibold text-safety-orange">
              Pro Plan Active
            </span>
          </div>

          <Button className="w-full" asChild>
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
