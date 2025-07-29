"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
}

const defaultSettings: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: true,
  marketingEmails: false,
}

export function NotificationSection() {
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultSettings)
  const [isChanged, setIsChanged] = useState(false)

  const updateNotification = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: value }
      setIsChanged(JSON.stringify(updated) !== JSON.stringify(defaultSettings))
      return updated
    })
  }

  const handleSaveChanges = () => {
    console.log("Saving changes:", notifications)
    // Here you can add your API call or logic to save changes
    // Once saved, reset the change detection state
    Object.assign(defaultSettings, notifications) // Update the default to new saved settings
    setIsChanged(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>Configure your notification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          {
            key: "whatsappNotifications",
            label: "Whatsapp Notifications",
            desc: "Receive important alerts via Whatsapp",
          },
          {
            key: "smsNotifications",
            label: "SMS Notifications",
            desc: "Receive important alerts via SMS",
          },
          {
            key: "emailNotifications",
            label: "Email Notifications",
            desc: "Receive notifications via email",
          },
          {
            key: "pushNotifications",
            label: "Push Notifications",
            desc: "Receive push notifications in browser",
          },
          {
            key: "marketingEmails",
            label: "Marketing Emails",
            desc: "Receive updates and promotional content",
          },
        ].map(({ key, label, desc }, idx, arr) => (
          <div key={key}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{label}</Label>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={notifications[key as keyof NotificationSettings]}
                onCheckedChange={(checked) =>
                  updateNotification(key as keyof NotificationSettings, checked)
                }
              />
            </div>
            {idx !== arr.length - 1 && <Separator />}
          </div>
        ))}

        <div className="pt-4 flex justify-end">
          <Button
            disabled={!isChanged}
            onClick={handleSaveChanges}
            className="ml-auto"
          >
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
