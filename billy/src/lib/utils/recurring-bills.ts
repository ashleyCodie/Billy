import type { SupabaseClient } from "@supabase/supabase-js";

export async function generateRecurringBills(supabase: SupabaseClient, userId: string) {
  const { data: recurringBills } = await supabase
    .from("bills")
    .select("*")
    .eq("user_id", userId)
    .eq("is_recurring", true)

  if (!recurringBills || recurringBills.length === 0) return

  const today = new Date()
  const oneYearFromNow = new Date()
  oneYearFromNow.setFullYear(today.getFullYear() + 1)

  for (const bill of recurringBills) {
    const { data: existingBills } = await supabase
      .from("bills")
      .select("due_date")
      .eq("creditor_id", bill.creditor_id)
      .eq("name", bill.name)
      .eq("amount", bill.amount)
      .eq("user_id", userId) // Add this
      .order("due_date", { ascending: false })
      .limit(1)

    const lastDueDate = existingBills?.[0]?.due_date 
      ? new Date(existingBills[0].due_date)
      : new Date(bill.due_date)

    const billsToCreate = []
    let iterationDate = new Date(lastDueDate)

    while (iterationDate <= oneYearFromNow) {
      if (bill.recurrence_frequency === "monthly") {
        iterationDate = new Date(iterationDate.setMonth(iterationDate.getMonth() + 1))
      } else if (bill.recurrence_frequency === "weekly") {
        iterationDate = new Date(iterationDate.setDate(iterationDate.getDate() + 7))
      } else if (bill.recurrence_frequency === "yearly") {
        iterationDate = new Date(iterationDate.setFullYear(iterationDate.getFullYear() + 1))
      }

      if (iterationDate <= oneYearFromNow) {
        const dueDateStr = iterationDate.toISOString().split("T")[0]
        
        // Better duplicate check
        const { data: existingBill, error } = await supabase
          .from("bills")
          .select("id")
          .eq("user_id", userId) // Add this
          .eq("creditor_id", bill.creditor_id)
          .eq("name", bill.name)
          .eq("amount", bill.amount) // Add this to be more specific
          .eq("due_date", dueDateStr)
          .maybeSingle()

        if (!existingBill && !error) {
          billsToCreate.push({
            user_id: userId,
            creditor_id: bill.creditor_id,
            name: bill.name,
            amount: bill.amount,
            due_date: dueDateStr,
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

    if (billsToCreate.length > 0) {
      await supabase.from("bills").insert(billsToCreate)
    }
  }
}