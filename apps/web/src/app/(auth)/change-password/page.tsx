import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import ChangePasswordForm from "./_component/change-password-form"

export default function ChangePasswordPage() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-3xl" />

      {/* Geometric shapes */}
      <div className="absolute top-20 right-20 w-20 h-20 border border-purple-500/20 dark:border-purple-500/30 rounded-lg rotate-12" />
      <div className="absolute bottom-32 left-20 w-16 h-16 border border-cyan-500/20 dark:border-cyan-500/30 rounded-full" />

      <Card className="mx-auto max-w-md w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
          <CardDescription>Enter your current password and choose a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            <Link href="/forgot-password" className="text-primary hover:underline underline-offset-4">
              Forgot your password?
            </Link>
          </div>
          <div className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline underline-offset-4">
              Back to sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
