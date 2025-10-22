import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { BillDialog } from "@/components/Bill-dialog"
import { BillListCard } from "@/components/Bill-list-card"
import type { Bill } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateRecurringBills } from "@/lib/utils/recurring-bills" 

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BillsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }
  
  await generateRecurringBills(supabase, user.id)

  console.log('Fetching bills for user:', user.id)

  const { data: allBills, error } = await supabase
    .from("bills")
    .select(
      `
      *,
      creditor:creditors(*)
    `,
    )
    .eq("user_id", user.id)
    .order("due_date", { ascending: true })

      console.log('All bills fetched:', allBills)
 console.log('Fetch error:', JSON.stringify(Error, null, 2))
  console.log('Number of bills:', allBills?.length)

  const today = new Date().toISOString().split("T")[0]

  const upcomingBills = allBills?.filter((bill) => !bill.is_paid && bill.due_date >= today) || []
  const overdueBills = allBills?.filter((bill) => !bill.is_paid && bill.due_date < today) || []
  const paidBills = allBills?.filter((bill) => bill.is_paid) || []


    console.log('Upcoming:', upcomingBills.length)
  console.log('Overdue:', overdueBills.length)  
  console.log('Paid:', paidBills.length)
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bills</h1>
            <p className="text-muted-foreground">Manage all your bills in one place</p>
          </div>
          <BillDialog />
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming ({upcomingBills.length})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({overdueBills.length})</TabsTrigger>
            <TabsTrigger value="paid">Paid ({paidBills.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingBills.length > 0 ? (
              <div className="space-y-4">
                {upcomingBills.map((bill) => (
                  <BillListCard key={bill.id} bill={bill as Bill} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No upcoming bills</h3>
                  <p className="mb-4 text-center text-sm text-muted-foreground">
                    You don't have any upcoming bills to pay
                  </p>
                  <BillDialog />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="overdue" className="mt-6">
            {overdueBills.length > 0 ? (
              <div className="space-y-4">
                {overdueBills.map((bill) => (
                  <BillListCard key={bill.id} bill={bill as Bill} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No overdue bills</h3>
                  <p className="text-center text-sm text-muted-foreground">Great job staying on top of your bills!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="paid" className="mt-6">
            {paidBills.length > 0 ? (
              <div className="space-y-4">
                {paidBills.map((bill) => (
                  <BillListCard key={bill.id} bill={bill as Bill} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No paid bills</h3>
                  <p className="text-center text-sm text-muted-foreground">Bills you mark as paid will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
