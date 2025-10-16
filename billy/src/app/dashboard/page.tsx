import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { BillCard } from "@/components/Bill-card"
import type { Bill } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Calendar, CheckCircle, DollarSign } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch upcoming bills (next 30 days, unpaid)
  const today = new Date().toISOString().split("T")[0]
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const { data: upcomingBills } = await supabase
    .from("bills")
    .select(
      `
      *,
      creditor:creditors(*)
    `,
    )
    .eq("user_id", user.id)
    .eq("is_paid", false)
    .gte("due_date", today)
    .lte("due_date", thirtyDaysFromNow)
    .order("due_date", { ascending: true })

  // Fetch overdue bills
  const { data: overdueBills } = await supabase
    .from("bills")
    .select(
      `
      *,
      creditor:creditors(*)
    `,
    )
    .eq("user_id", user.id)
    .eq("is_paid", false)
    .lt("due_date", today)
    .order("due_date", { ascending: true })

  // Calculate stats
  const { data: allBills } = await supabase.from("bills").select("*").eq("user_id", user.id)

  const totalBills = allBills?.length || 0
  const paidBills = allBills?.filter((b) => b.is_paid).length || 0
  const unpaidBills = totalBills - paidBills

  const totalAmount =
    upcomingBills?.reduce((sum, bill) => sum + Number(bill.amount), 0) +
      (overdueBills?.reduce((sum, bill) => sum + Number(bill.amount), 0) || 0) || 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your bill overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBills}</div>
              <p className="text-xs text-muted-foreground">
                {paidBills} paid, {unpaidBills} unpaid
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueBills?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidBills}</div>
              <p className="text-xs text-muted-foreground">Great job!</p>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Bills */}
        {overdueBills && overdueBills.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-destructive">Overdue Bills</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {overdueBills.map((bill) => (
                <BillCard key={bill.id} bill={bill as Bill} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Bills */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Upcoming Bills</h2>
            <Link href="/bills">
              <Button variant="outline" size="sm">
                View All Bills
              </Button>
            </Link>
          </div>
          {upcomingBills && upcomingBills.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingBills.map((bill) => (
                <BillCard key={bill.id} bill={bill as Bill} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No upcoming bills</h3>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  You don't have any bills due in the next 30 days.
                </p>
                <Link href="/bills">
                  <Button className="bg-[#0A0]">Add Your First Bill</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/bills">
            <Card className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Add Bill</h3>
                  <p className="text-sm text-muted-foreground">Track a new bill</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/creditors">
            <Card className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Add Creditor</h3>
                  <p className="text-sm text-muted-foreground">Manage service providers</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/calendar">
            <Card className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">View Calendar</h3>
                  <p className="text-sm text-muted-foreground">See all due dates</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
