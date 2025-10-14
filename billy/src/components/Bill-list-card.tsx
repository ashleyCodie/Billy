"use client"

import type { Bill } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Eye, EyeOff, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { BillDialog } from "./Bill-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface BillListCardProps {
  bill: Bill
}

export function BillListCard({ bill }: BillListCardProps) {
  const [showCredentials, setShowCredentials] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
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

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()

    const { error } = await supabase.from("bills").delete().eq("id", bill.id)

    if (!error) {
      router.refresh()
    }
    setIsDeleting(false)
  }

  return (
    <Card className={bill.is_paid ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{bill.name}</h3>
                <p className="text-sm text-muted-foreground">{bill.creditor?.name}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-lg font-bold">${bill.amount.toFixed(2)}</p>
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

            <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Due: {dueDate.toLocaleDateString()}</span>
              {bill.is_paid && bill.paid_date && <span>Paid: {new Date(bill.paid_date).toLocaleDateString()}</span>}
            </div>

            {(bill.login_username || bill.login_password) && (
              <div className="mb-3 rounded-lg border bg-muted/50 p-3">
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

            {bill.notes && (
              <div className="mb-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">{bill.notes}</div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleMarkPaid}
                disabled={isUpdating}
                variant={bill.is_paid ? "outline" : "default"}
                size="sm"
              >
                {bill.is_paid ? "Mark as Unpaid" : "Mark as Paid"}
              </Button>
              <BillDialog
                bill={bill}
                trigger={
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                }
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Bill</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this bill? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
