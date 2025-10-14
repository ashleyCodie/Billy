"use client"

import type { Bill } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface BillCardProps {
  bill: Bill
}

export function BillCard({ bill }: BillCardProps) {
  const [showCredentials, setShowCredentials] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const dueDate = new Date(bill.due_date)
  const today = new Date()
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const handleMarkPaid = async () => {
    setIsUpdating(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("bills")
      .update({
        is_paid: !bill.is_paid,
        paid_date: !bill.is_paid ? new Date().toISOString().split("T")[0] : null,
      })
      .eq("id", bill.id)

    if (!error) {
      router.refresh()
    }
    setIsUpdating(false)
  }

  return (
    <Card className={bill.is_paid ? "opacity-60" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{bill.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{bill.creditor?.name}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="text-xl font-bold">${bill.amount.toFixed(2)}</p>
            {bill.is_paid ? (
              <Badge variant="secondary" className="gap-1">
                <Check className="h-3 w-3" />
                Paid
              </Badge>
            ) : daysUntilDue < 0 ? (
              <Badge variant="destructive">Overdue</Badge>
            ) : daysUntilDue <= 3 ? (
              <Badge variant="default">Due soon</Badge>
            ) : (
              <Badge variant="outline">Upcoming</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Due date:</span>
            <span className="font-medium">{dueDate.toLocaleDateString()}</span>
          </div>

          {(bill.login_username || bill.login_password) && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Login Credentials</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="h-6 gap-1 px-2"
                >
                  {showCredentials ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showCredentials ? "Hide" : "Show"}
                </Button>
              </div>
              {showCredentials && (
                <div className="space-y-1 text-sm">
                  {bill.login_username && (
                    <div>
                      <span className="text-muted-foreground">Username: </span>
                      <span className="font-mono">{bill.login_username}</span>
                    </div>
                  )}
                  {bill.login_password && (
                    <div>
                      <span className="text-muted-foreground">Password: </span>
                      <span className="font-mono">{bill.login_password}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleMarkPaid}
            disabled={isUpdating}
            variant={bill.is_paid ? "outline" : "default"}
            size="sm"
          >
            {bill.is_paid ? "Mark as Unpaid" : "Mark as Paid"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
