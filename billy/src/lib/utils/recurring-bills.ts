import type { SupabaseClient } from '@supabase/supabase-js'

export async function generateRecurringBills(supabase: SupabaseClient, userId: string) {
  // Get all recurring bills
  const { data: recurringBills } = await supabase
    .from("bills")
    .select("*")
    .eq("user_id", userId)
    .eq("is_recurring", true)

  if (!recurringBills || recurringBills.length === 0) return

  const today = new Date()
  const threeMonthsFromNow = new Date()
  threeMonthsFromNow.setMonth(today.getMonth() + 3)

  for (const bill of recurringBills) {
    // Get the last occurrence of this bill
    const { data: existingBills } = await supabase
      .from("bills")
      .select("due_date")
      .eq("creditor_id", bill.creditor_id)
      .eq("name", bill.name)
      .eq("amount", bill.amount)
      .order("due_date", { ascending: false })
      .limit(1)

    const lastDueDate = existingBills?.[0]?.due_date 
      ? new Date(existingBills[0].due_date)
      : new Date(bill.due_date)

    // Generate future bills based on frequency
    const billsToCreate = []
    let nextDueDate = new Date(lastDueDate)

    while (nextDueDate <= threeMonthsFromNow) {
      // Calculate next due date based on frequency
      if (bill.recurrence_frequency === "monthly") {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1)
      } else if (bill.recurrence_frequency === "weekly") {
        nextDueDate.setDate(nextDueDate.getDate() + 7)
      } else if (bill.recurrence_frequency === "yearly") {
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1)
      }

      if (nextDueDate <= threeMonthsFromNow) {
        // Check if this bill already exists
        const { data: existingBill } = await supabase
          .from("bills")
          .select("id")
          .eq("creditor_id", bill.creditor_id)
          .eq("name", bill.name)
          .eq("due_date", nextDueDate.toISOString().split("T")[0])
          .maybeSingle()

        if (!existingBill) {
          billsToCreate.push({
            user_id: userId,
            creditor_id: bill.creditor_id,
            name: bill.name,
            amount: bill.amount,
            due_date: nextDueDate.toISOString().split("T")[0],
            is_paid: false,
            paid_date: null,
            is_recurring: true,
            recurrence_frequency: bill.recurrence_frequency,
            recurrence_day: bill.recurrence_day,
            login_username: bill.login_username,
            login_password: bill.login_password,
            notes: bill.notes,
          })
        }
      }
    }

    // Insert all new bills at once
    if (billsToCreate.length > 0) {
      await supabase.from("bills").insert(billsToCreate)
    }
  }
}