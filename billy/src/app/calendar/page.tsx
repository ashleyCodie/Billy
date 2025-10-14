import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Calendar } from "@/components/Calendar"
import type { Bill } from "@/lib/types"

export default async function CalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: bills } = await supabase
    .from("bills")
    .select(
      `
      *,
      creditor:creditors(*)
    `,
    )
    .eq("user_id", user.id)
    .order("due_date", { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View all your bills on the calendar</p>
        </div>

        <Calendar bills={(bills as Bill[]) || []} />
      </main>
    </div>
  )
}
