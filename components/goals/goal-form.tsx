"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Goal } from "@/types"

interface GoalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal?: Goal | null
  userId: string
  onSuccess?: () => void
}

export default function GoalForm({ open, onOpenChange, goal, userId, onSuccess }: GoalFormProps) {
  const [name, setName] = useState("")
  const [targetAmount, setTargetAmount] = useState(0)
  const [currentAmount, setCurrentAmount] = useState(0)
  const [deadline, setDeadline] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const isEdit = !!goal

  useEffect(() => {
    if (goal) {
      setName(goal.name)
      setTargetAmount(goal.target_amount)
      setCurrentAmount(goal.current_amount)
      setDeadline(goal.deadline || "")
    } else {
      setName("")
      setTargetAmount(0)
      setCurrentAmount(0)
      setDeadline("")
    }
  }, [goal])

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
        const { error } = await (supabase as any)
          .from("goals")
          .update(payload)
          .eq("id", goal.id)

        if (error) throw error
      } else {
        const { error } = await (supabase as any)
          .from("goals")
          .insert(payload)

        if (error) throw error
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving goal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Target" : "Tambah Target Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Target</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Beli Motor"
              required
            />
          </div>

          <div>
            <Label htmlFor="targetAmount">Jumlah Target</Label>
            <Input
              id="targetAmount"
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              placeholder="0"
              required
            />
          </div>

          <div>
            <Label htmlFor="currentAmount">Jumlah Saat Ini</Label>
            <Input
              id="currentAmount"
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(Number(e.target.value))}
              placeholder="0"
              required
            />
          </div>

          <div>
            <Label htmlFor="deadline">Deadline (Opsional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : isEdit ? "Update Target" : "Tambah Target"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
