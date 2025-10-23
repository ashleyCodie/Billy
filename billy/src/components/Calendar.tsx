"use client";

import type { Bill } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface CalendarProps {
  bills: Bill[];
}

export function Calendar({ bills }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getBillsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return bills.filter((bill) => bill.due_date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(
      <div key={`empty-${i}`} className="min-h-24 border-b border-r p-2" />
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayBills = getBillsForDate(day);
    const today = isToday(day);

    days.push(
      <div
        key={day}
        className={`min-h-24 border-b border-r p-2 ${
          today ? "bg-primary/5" : ""
        } hover:bg-muted/50 transition-colors`}
      >
        <div
          className={`mb-1 text-sm font-medium ${today ? "text-primary" : ""}`}
        >
          {day}
        </div>
        <div className="space-y-1">
          {dayBills.map((bill) => {
            const today = new Date().toISOString().split("T")[0];
            const isOverdue = !bill.is_paid && bill.due_date < today;
            const isPaid = bill.is_paid;

            return (
              <div
                key={bill.id}
                className={`rounded px-2 py-1 text-xs ${
                  isPaid
                    ? "bg-green-100 text-green-900"
                    : isOverdue
                    ? "bg-red-100 text-red-900"
                    : "bg-purple-100 text-purple-900"
                }`}
              >
                <div className="truncate font-medium">{bill.name}</div>
                <div className="truncate">${bill.amount.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7">
            {dayNames.map((day) => (
              <div
                key={day}
                className="border-b border-r bg-muted p-2 text-center text-sm font-semibold last:border-r-0"
              >
                {day}
              </div>
            ))}
            {days}
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-purple-900" />
          <span>Unpaid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-red-900" />
          <span>Past Due</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-green-900" />
          <span>Paid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-primary/5 border" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
