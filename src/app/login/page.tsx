import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Log In",
  description: "Return to your quest board.",
};

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/quests");

  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
