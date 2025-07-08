"use client"
import { Settings } from "lucide-react"
import { UserProfileSection } from "./_component/user-profile-section"
import { ThemeSection } from "./_component/theme-section"
import { NotificationSection } from "./_component/notification-section"
import { SecuritySection } from "./_component/security-section"
import { AccountActionsSection } from "./_component/account-actions-section"
import { getDepartments, getRoles } from "../teams/action"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  location: string
  avatar: string
  joinDate: string
}

export default async function SettingsPage() {
   const { departments, error: depError } = await getDepartments();
    const { roles, error: roleError } = await getRoles();
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <UserProfileSection departments={departments} roles={roles} />
        <ThemeSection />
        <NotificationSection />
        <AccountActionsSection />
      </div>
    </div>
  )
}
