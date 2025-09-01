"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Goal } from "@/types"

interface GoalFormProps {
  goal?: Goal
  userId: string
}

export default function GoalForm({ goal, userId }: GoalFormProps) {
  const [name, setName] = useState(goal?.name || "")
  const [targetAmount, setTargetAmount] = useState(goal?.target_amount || 0)
  const [currentAmount, setCurrentAmount] = useState(goal?.current_amount || 0)
  const [deadline, setDeadline] = useState(goal?.deadline || "")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const isEdit = !!goal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const payload = {
      user_id: userId,
      name,
      target_amount: targetAmount,
      current_amount: currentAmount,
      deadline: deadline || null,
    }

    try {
      if (isEdit && goal) {
        const { error } = await supabase
          .from<Goal>("goals")
          .update(payload as Partial<Goal>)
          .eq("id", goal.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from<Goal>("goals")
          .insert(payload as Goal)

        if (error) throw error
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error saving goal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Goal Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="targetAmount">Target Amount</Label>
        <Input
          id="targetAmount"
          type="number"
          value={targetAmount}
          onChange={(e) => setTargetAmount(Number(e.target.value))}
          required
        />
      </div>

      <div>
        <Label htmlFor="currentAmount">Current Amount</Label>
        <Input
          id="currentAmount"
          type="number"
          value={currentAmount}
          onChange={(e) => setCurrentAmount(Number(e.target.value))}
          required
        />
      </div>

      <div>
        <Label htmlFor="deadline">Deadline</Label>
        <Input
          id="deadline"
          type="date"
          value={deadline || ""}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : isEdit ? "Update Goal" : "Create Goal"}
      </Button>
    </form>
  )
}
