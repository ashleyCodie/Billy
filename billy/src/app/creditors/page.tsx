import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { CreditorDialog } from "@/components/Creditor-dialog"
import { CreditorCard } from "@/components/Creditor-card"
import type { Creditor } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

export default async function CreditorsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: creditors } = await supabase
    .from("creditors")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true })

  // Get bill counts for each creditor
  const creditorBillCounts: Record<string, number> = {}
  if (creditors) {
    for (const creditor of creditors) {
      const { count } = await supabase
        .from("bills")
        .select("*", { count: "exact", head: true })
        .eq("creditor_id", creditor.id)
      creditorBillCounts[creditor.id] = count || 0
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Creditors</h1>
            <p className="text-muted-foreground">Manage your service providers and creditors</p>
          </div>
          <CreditorDialog />
        </div>

        {creditors && creditors.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {creditors.map((creditor) => (
              <CreditorCard
                key={creditor.id}
                creditor={creditor as Creditor}
                billCount={creditorBillCounts[creditor.id] || 0}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No creditors yet</h3>
              <p className="mb-4 text-center text-sm text-muted-foreground">
                Add your first creditor to start tracking bills
              </p>
              <CreditorDialog />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
