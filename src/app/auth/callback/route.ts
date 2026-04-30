import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/database.types";

/**
 * Auth callback route — handles both:
 * 1. Email confirmation code exchange
 * 2. OAuth (Google) redirect with optional role assignment
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const roleParam = searchParams.get("role") as UserRole | null;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // If a role was passed (from registro with Google), update the profile
        if (roleParam && (roleParam === "profesor" || roleParam === "alumno")) {
          await supabase
            .from("profiles")
            .update({ role: roleParam })
            .eq("id", user.id);
        }

        // Check if user has a role assigned
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // If no role and no roleParam, they logged in directly via OAuth -> go to role selection
        if (!profile?.role && !roleParam) {
          return NextResponse.redirect(new URL("/onboarding/rol", origin));
        }

        const effectiveRole = roleParam || profile?.role;

        if (effectiveRole === "profesor") {
          const { data: teacherDetails } = await supabase
            .from("teacher_details")
            .select("id")
            .eq("id", user.id)
            .single();

          if (!teacherDetails) {
            return NextResponse.redirect(
              new URL("/onboarding/profesor", origin)
            );
          }
        }
      }

      return NextResponse.redirect(new URL("/", origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
