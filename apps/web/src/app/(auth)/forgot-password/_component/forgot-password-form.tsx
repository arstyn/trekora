"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Mail, ArrowLeft } from "lucide-react"

// Define schema using Zod
export const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>

// Mock server action - replace with your actual implementation
async function sendResetEmail(values: ForgotPasswordFormValues) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000))
  console.log("Sending reset email to:", values.email)
}

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      await sendResetEmail(values)
      setEmailSent(true)
    } catch (error) {
      console.log("🚀 ~ forgot-password-form.tsx ~ onSubmit ~ error:", error)
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
          <h3 className="text-lg font-semibold">Check your email</h3>
          <p className="text-muted-foreground text-sm">We've sent a password reset link to {form.getValues("email")}</p>
        </div>
        <Button
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => {
            setEmailSent(false)
            form.reset()
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to form
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </Form>
  )
}
