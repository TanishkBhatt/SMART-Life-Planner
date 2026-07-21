"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  async function deleteAccount() {
    setDeleting(true)
    setError("")
    try {
      const res = await fetch("/api/account", { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to delete account")
        setDeleting(false)
        return
      }
      await signOut({ callbackUrl: "/login" })
    } catch {
      setError("Something went wrong")
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your account</p>
      </div>

      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Deleting your account will permanently remove all your data including todos, goals, habits,
            journal entries, and everything else. This action cannot be undone.
          </p>
          {error && (
            <p className="rounded-md bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
          )}
          {!confirming ? (
            <Button
              variant="secondary"
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete Account
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Are you absolutely sure? This will delete everything.
              </p>
              <div className="flex gap-2">
                <Button onClick={deleteAccount} disabled={deleting} className="bg-red-600 text-white hover:bg-red-700">
                  {deleting ? "Deleting..." : "Yes, delete my account"}
                </Button>
                <Button variant="secondary" onClick={() => setConfirming(false)} disabled={deleting}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
