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
import { createClient } from "@/lib/supabase/client"
import type { Creditor } from "@/lib/types"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface CreditorDialogProps {
  creditor?: Creditor
  trigger?: React.ReactNode
}

export function CreditorDialog({ creditor, trigger }: CreditorDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(creditor?.name || "")
  const [website, setWebsite] = useState(creditor?.website || "")
  const [phone, setPhone] = useState(creditor?.phone || "")
  const [accountNumber, setAccountNumber] = useState(creditor?.account_number || "") // Changed
  const [notes, setNotes] = useState(creditor?.notes || "")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    if (creditor) {
      const { error } = await supabase
        .from("creditors")
        .update({
          name,
          website: website || null,
          phone: phone || null,
          account_number: accountNumber || null, // Changed from accountNumber
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", creditor.id)

      if (!error) {
        setOpen(false)
        router.refresh()
      }
    } else {
      const { error } = await supabase.from("creditors").insert({
        user_id: user.id,
        name,
        website: website || null,
        phone: phone || null,
        account_number: accountNumber || null, // Changed from accountNumber
        notes: notes || null,
      })

      if (!error) {
        setOpen(false)
        setName("")
        setWebsite("")
        setPhone("")
        setAccountNumber("")
        setNotes("")
        router.refresh()
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
            Add Creditor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{creditor ? "Edit Creditor" : "Add New Creditor"}</DialogTitle>
            <DialogDescription>
              {creditor ? "Update creditor information" : "Add a new service provider or creditor"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Electric Company"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accountNumber">Account #</Label>
              <Input
                id="accountNumber"
                type="text"
                placeholder="1234567"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
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
            <Button type="submit" className="bg-[#0A0]" disabled={isLoading}>
              {isLoading ? "Saving..." : creditor ? "Update" : "Add Creditor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}