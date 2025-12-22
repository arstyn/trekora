"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import axiosInstance from "@/lib/axios";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

interface NotificationSettings {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    whatsappNotifications: boolean;
    marketingEmails: boolean;
}

// Default state
const defaultSettings: NotificationSettings = {
    emailNotifications: false,
    pushNotifications: false,
    smsNotifications: false,
    whatsappNotifications: false,
    marketingEmails: false,
};

// API keys from backend mapped to internal state
const apiToStateKeyMap: Record<string, keyof NotificationSettings> = {
    "Email notification": "emailNotifications",
    "Push notification": "pushNotifications",
    "Sms notification": "smsNotifications",
    "Whatsapp notification": "whatsappNotifications",
    "Marketing emails": "marketingEmails",
};

// Internal state mapped back to API keys for sending back
const stateToApiKeyMap: Record<keyof NotificationSettings, string> = {
    emailNotifications: "Email notification",
    pushNotifications: "Push notification",
    smsNotifications: "Sms notification",
    whatsappNotifications: "Whatsapp notification",
    marketingEmails: "Marketing emails",
};

export function NotificationSection() {
    const [notifications, setNotifications] =
        useState<NotificationSettings>(defaultSettings);

    const [initialSettings, setInitialSettings] =
        useState<NotificationSettings>(defaultSettings);

    const [isChanged, setIsChanged] = useState(false);

    useEffect(() => {
        const getNotification = async () => {
            const response = await axiosInstance.get<Record<string, boolean>>(
                "/user-notification"
            );

            const apiData = response.data;

            const updatedSettings: NotificationSettings = {
                ...defaultSettings,
            };

            for (const [apiKey, value] of Object.entries(apiData)) {
                const stateKey = apiToStateKeyMap[apiKey];
                if (stateKey) {
                    updatedSettings[stateKey] = value;
                }
            }

            setNotifications(updatedSettings);
            setInitialSettings(updatedSettings); // Used for change comparison
        };

        getNotification();
    }, []);

    const updateNotification = (
        key: keyof NotificationSettings,
        value: boolean
    ) => {
        setNotifications((prev) => {
            const updated = { ...prev, [key]: value };
            setIsChanged(
                JSON.stringify(updated) !== JSON.stringify(initialSettings)
            );
            return updated;
        });
    };

    const handleSaveChanges = async () => {
        // Prepare payload to match API keys
        const payload: Record<string, boolean> = {};
        for (const [stateKey, value] of Object.entries(notifications)) {
            const apiKey =
                stateToApiKeyMap[stateKey as keyof NotificationSettings];
            payload[apiKey] = value;
        }

        await axiosInstance.patch("/user-notification", payload);

        // Update base state
        setInitialSettings(notifications);
        setIsChanged(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                </CardTitle>
                <CardDescription>
                    Configure your notification preferences
                </CardDescription>
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
                                <p className="text-sm text-muted-foreground">
                                    {desc}
                                </p>
                            </div>
                            <Switch
                                checked={
                                    notifications[
                                        key as keyof NotificationSettings
                                    ]
                                }
                                onCheckedChange={(checked) =>
                                    updateNotification(
                                        key as keyof NotificationSettings,
                                        checked
                                    )
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
    );
}
