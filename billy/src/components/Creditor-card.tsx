"use client"

import type { Creditor } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, Phone, Pencil, Trash2, Hash } from "lucide-react"
import { CreditorDialog } from "./Creditor-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
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

interface CreditorCardProps {
  creditor: Creditor
  billCount: number
}

export function CreditorCard({ creditor, billCount }: CreditorCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()

    const { error } = await supabase.from("creditors").delete().eq("id", creditor.id)

    if (!error) {
      router.refresh()
    }
    setIsDeleting(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{creditor.name}</CardTitle>
          <div className="flex gap-1">
            <CreditorDialog
              creditor={creditor}
              trigger={
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Creditor</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this creditor? This will also delete all associated bills. This
                    action cannot be undone.
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
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {creditor.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a
                href={creditor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {creditor.website}
              </a>
            </div>
          )}
          {creditor.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{creditor.phone}</span>
            </div>
          )}
           {creditor.account_number && (
            <div className="flex items-center gap-2 text-sm">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span>{creditor.account_number}</span>
            </div>
          )}
          {creditor.notes && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="text-muted-foreground">{creditor.notes}</p>
            </div>
          )}
          <div className="pt-2 text-sm text-muted-foreground">
            {billCount} {billCount === 1 ? "bill" : "bills"} tracked
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
