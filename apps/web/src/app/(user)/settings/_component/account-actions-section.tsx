"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { LogOut, Download, Key } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export function AccountActionsSection() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast("Logged Out", {
        description: "You have been successfully logged out.",
      })

      // Redirect to login page
      // router.push('/login');
    } catch (error) {
      toast("Error", {
        description: "Failed to logout. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = () => {
    toast("Change Password", {
      description: "Password change functionality would be implemented here.",
    })
  }

  const handleDownloadData = () => {
    toast("Download Data", {
      description: "Data download functionality would be implemented here.",
    })
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Account Actions</CardTitle>
        <CardDescription>Manage your account and session</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="flex-1" onClick={handleChangePassword}>
            <Key className="h-4 w-4 mr-2" />
            Change Password
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleDownloadData}>
            <Download className="h-4 w-4 mr-2" />
            Download Data
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be signed out of your account and redirected to the login page.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} disabled={isLoading}>
                  {isLoading ? "Logging out..." : "Logout"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
