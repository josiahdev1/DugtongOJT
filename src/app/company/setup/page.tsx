import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { findEmployer, getCurrentUser } from "@/lib/auth";
import { CompanySetupForm } from "./setup-form";

export const dynamic = "force-dynamic";

export default async function CompanySetupPage() {
  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");

  // You only create a company account once.
  if (await findEmployer(supabase)) redirect("/company");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Set up your company</CardTitle>
          <CardDescription>
            Next you will upload your registration and a permit, and the
            Dugtong team will check them before your company can post
            anything. Name the person who is authorized to speak for the
            company.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanySetupForm />
        </CardContent>
      </Card>
    </main>
  );
}
