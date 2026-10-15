import { redirect } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { SetupForm } from "./setup-form";

export const dynamic = "force-dynamic";

export default async function SetupSchoolPage() {
  const { user, school } = await getCurrentUser();

  if (!user) redirect("/login");
  if (school) redirect("/dashboard"); // you only name your school once

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
      <div>
        <Image
          src="/dugtong-ojt-logo.png"
          alt="Dugtong OJT"
          width={260}
          height={70}
          priority
          className="dugtong-logo-light h-auto w-52"
        />
        <Image
          src="/dugtong-ojt-logo-dark.png"
          alt=""
          width={260}
          height={70}
          className="dugtong-logo-dark h-auto w-52"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Set up your school</CardTitle>
          <CardDescription>
            You do this once. Your students and records belong to this school.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetupForm />
        </CardContent>
      </Card>
    </main>
  );
}
