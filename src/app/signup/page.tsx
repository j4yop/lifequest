import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Sign Up",
  description: "Create your character and begin your legend.",
};

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/quests");

  return (
    <Suspense>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
