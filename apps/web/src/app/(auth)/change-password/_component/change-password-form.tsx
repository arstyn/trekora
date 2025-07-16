"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Eye, EyeIcon as EyeClosed, AlertTriangle, Mail } from "lucide-react"

// Define schema using Zod
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>

// Mock server actions - replace with your actual implementations
async function changePassword(values: ChangePasswordFormValues) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Simulate current password validation (for demo purposes)
  if (values.currentPassword !== "correct123") {
    throw new Error("Current password is incorrect")
  }

  console.log("Password changed successfully")
}

async function sendResetEmail(email: string) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000))
  console.log("Sending reset email to:", email)
}

export default function ChangePasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showEmailOption, setShowEmailOption] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: ChangePasswordFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      await changePassword(values)
      // Reset form on success
      form.reset()
      setFailedAttempts(0)
      setShowEmailOption(false)
      alert("Password changed successfully!")
    } catch (error: any) {
      console.log("🚀 ~ change-password-form.tsx ~ onSubmit ~ error:", error)

      if (error.message.includes("Current password is incorrect")) {
        const newFailedAttempts = failedAttempts + 1
        setFailedAttempts(newFailedAttempts)
        setError(
          `Current password is incorrect. ${newFailedAttempts >= 2 ? "" : `${2 - newFailedAttempts} attempt(s) remaining.`}`,
        )

        if (newFailedAttempts >= 2) {
          setShowEmailOption(true)
        }
      } else {
        setError("An error occurred while changing password")
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleEmailReset() {
    setIsLoading(true)
    try {
      // You would typically get the user's email from context/session
      await sendResetEmail("user@example.com")
      setEmailSent(true)
    } catch (error) {
      setError("Failed to send reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Reset email sent</h3>
          <p className="text-muted-foreground text-sm">We've sent a password reset link to your email address.</p>
        </div>
        <Button
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => {
            setEmailSent(false)
            setShowEmailOption(false)
            setFailedAttempts(0)
            form.reset()
          }}
        >
          Back to form
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Current Password Field */}
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <Eye className="w-4 h-4" /> : <EyeClosed className="w-4 h-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* New Password Field */}
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <Eye className="w-4 h-4" /> : <EyeClosed className="w-4 h-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirm Password Field */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeClosed className="w-4 h-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <Alert variant={failedAttempts >= 2 ? "destructive" : "default"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showEmailOption && (
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Having trouble remembering your current password? You can reset it via email instead.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Changing Password..." : "Change Password"}
          </Button>

          {/* Email Reset Option */}
          {showEmailOption && (
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleEmailReset}
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" />
              Reset via Email Instead
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
