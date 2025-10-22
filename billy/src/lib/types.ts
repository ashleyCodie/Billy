export interface Creditor {
  id: string
  user_id: string
  name: string
  website?: string
  phone?: string
  account_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Bill {
  id: string
  user_id: string
  creditor_id: string
  name: string
  amount: number
  due_date: string
  is_paid: boolean
  paid_date?: string
  login_username?: string
  login_password?: string
  notes?: string
  is_recurring: boolean
  recurrence_frequency?: 'weekly' | 'monthly' | 'yearly'
  recurrence_day?: number
  created_at?: string
  updated_at?: string
  creditor?: Creditor
}
