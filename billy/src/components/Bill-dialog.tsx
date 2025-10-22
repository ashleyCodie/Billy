"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import type { Bill, Creditor } from "@/lib/types"
import { Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"

interface BillDialogProps {
  bill?: Bill
  trigger?: React.ReactNode
}

export function BillDialog({ bill, trigger }: BillDialogProps) {
  const [open, setOpen] = useState(false)
  const [creditors, setCreditors] = useState<Creditor[]>([])
  const [name, setName] = useState(bill?.name || "")
  const [creditorId, setCreditorId] = useState(bill?.creditor_id || "")
  const [amount, setAmount] = useState(bill?.amount.toString() || "")
  const [dueDate, setDueDate] = useState(bill?.due_date || "")
  const [isPaid, setIsPaid] = useState(bill?.is_paid || false)
  const [isRecurring, setIsRecurring] = useState(bill?.is_recurring || false)
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<string>(bill?.recurrence_frequency || "monthly")
  const [recurrenceDay, setRecurrenceDay] = useState(bill?.recurrence_day?.toString() || "1")
  const [loginUsername, setLoginUsername] = useState(bill?.login_username || "")
  const [loginPassword, setLoginPassword] = useState(bill?.login_password || "")
  const [notes, setNotes] = useState(bill?.notes || "")
  const [isLoading, setIsLoading] = useState(false)


  useEffect(() => {
    const fetchCreditors = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase.from("creditors").select("*").eq("user_id", user.id).order("name")

      if (data) {
        setCreditors(data as Creditor[])
      }
    }

    if (open) {
      fetchCreditors()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setIsLoading(false)
      return
    }

    const billData = {
      name,
      creditor_id: creditorId,
      amount: Number.parseFloat(amount),
      due_date: dueDate,
      is_paid: isPaid,
      paid_date: isPaid ? new Date().toISOString().split("T")[0] : null,
      is_recurring: isRecurring,
      recurrence_frequency: isRecurring ? recurrenceFrequency : null,
      recurrence_day: isRecurring ? Number.parseInt(recurrenceDay) : null,
      login_username: loginUsername || null,
      login_password: loginPassword || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    }

    if (bill) {
      const { error } = await supabase.from("bills").update(billData).eq("id", bill.id)

      if (error) {
        console.error('Update error:', error)
      } else {
        setOpen(false)
        window.location.reload()
      }
    } else {
      const dataToInsert = {
        ...billData,
        user_id: user.id,
      }

      const { error } = await supabase.from("bills").insert(dataToInsert)

      if (error) {
        console.error('Insert error:', error)
      } else {
        setOpen(false)
        setName("")
        setCreditorId("")
        setAmount("")
        setDueDate("")
        setIsPaid(false)
        setIsRecurring(false)
        setRecurrenceFrequency("monthly")
        setRecurrenceDay("1")
        setLoginUsername("")
        setLoginPassword("")
        setNotes("")
        window.location.reload()
      }
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-[#0A0]">
            <Plus className="h-4 w-4" />
            Add Bill
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{bill ? "Edit Bill" : "Add New Bill"}</DialogTitle>
            <DialogDescription>{bill ? "Update bill information" : "Add a new bill to track"}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Bill Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Monthly Electric Bill"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="creditor">Creditor *</Label>
              <Select value={creditorId} onValueChange={setCreditorId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a creditor" />
                </SelectTrigger>
                <SelectContent>
                  {creditors.map((creditor) => (
                    <SelectItem key={creditor.id} value={creditor.id}>
                      {creditor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {creditors.length === 0 && (
                <p className="text-xs text-muted-foreground">No creditors found. Add a creditor first.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="due-date">Due Date *</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="is-paid" checked={isPaid} onCheckedChange={(checked) => setIsPaid(checked as boolean)} />
              <Label htmlFor="is-paid" className="cursor-pointer font-normal">
                Mark as paid
              </Label>
            </div>

            {/* Recurring Bill Section */}
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is-recurring" 
                  checked={isRecurring} 
                  onCheckedChange={(checked) => setIsRecurring(checked as boolean)} 
                />
                <Label htmlFor="is-recurring" className="cursor-pointer font-medium">
                  Recurring Bill
                </Label>
              </div>

              {isRecurring && (
                <div className="space-y-4 pl-6">
                  <div className="grid gap-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={recurrenceFrequency} onValueChange={setRecurrenceFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="recurrence-day">
                      {recurrenceFrequency === 'monthly' ? 'Day of Month (1-31)' : 
                       recurrenceFrequency === 'weekly' ? 'Day of Week (1=Monday, 7=Sunday)' : 
                       'Day of Year (1-365)'}
                    </Label>
                    <Input
                      id="recurrence-day"
                      type="number"
                      min="1"
                      max={recurrenceFrequency === 'monthly' ? '31' : recurrenceFrequency === 'weekly' ? '7' : '365'}
                      value={recurrenceDay}
                      onChange={(e) => setRecurrenceDay(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="text-sm font-medium">Login Credentials (Optional)</h4>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Your login username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your login password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0A0]" disabled={isLoading || creditors.length === 0}>
              {isLoading ? "Saving..." : bill ? "Update" : "Add Bill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}