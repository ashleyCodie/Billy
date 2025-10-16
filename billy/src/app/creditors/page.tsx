"use client"

import { createClient } from "@/lib/supabase/client" // Changed from server to client
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation" // Changed from redirect
import { Navbar } from "@/components/Navbar"
import { CreditorDialog } from "@/components/Creditor-dialog"
import { CreditorCard } from "@/components/Creditor-card"
import type { Creditor } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function CreditorsPage() { // Removed async
  const [creditors, setCreditors] = useState<Creditor[]>([])
  const [loading, setLoading] = useState(true)
  const [creditorBillCounts, setCreditorBillCounts] = useState<Record<string, number>>({})
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current user:', user)

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Fetch creditors
      const { data: creditorsData, error: creditorsError } = await supabase
        .from('creditors')
        .select('*')
      
      if (creditorsError) {
        console.error('Error fetching creditors:', creditorsError)
        setLoading(false)
        return
      }

      setCreditors(creditorsData || [])

      // Fetch bill counts for each creditor
      if (creditorsData) {
        const counts: Record<string, number> = {}
        
        for (const creditor of creditorsData) {
          const { count } = await supabase
            .from("bills")
            .select("*", { count: "exact", head: true })
            .eq("creditor_id", creditor.id)
          
          counts[creditor.id] = count || 0
        }
        
        setCreditorBillCounts(counts)
      }
      
      setLoading(false)
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
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
                creditor={creditor}
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