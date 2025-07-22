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
import { Shield } from "lucide-react";
import { useState } from "react";

interface SecuritySettings {
	twoFactorAuth: boolean;
	sessionTimeout: string;
	loginAlerts: boolean;
}

export function SecuritySection() {
	const [security, setSecurity] = useState<SecuritySettings>({
		twoFactorAuth: false,
		sessionTimeout: "30",
		loginAlerts: true,
	});

	const updateSecurity = (key: keyof SecuritySettings, value: boolean | string) => {
		setSecurity((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Shield className="h-5 w-5" />
					Security
				</CardTitle>
				<CardDescription>Manage your account security settings</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label>Two-Factor Authentication</Label>
						<p className="text-sm text-muted-foreground">
							Add an extra layer of security
						</p>
					</div>
					<Switch
						checked={security.twoFactorAuth}
						onCheckedChange={(checked) =>
							updateSecurity("twoFactorAuth", checked)
						}
					/>
				</div>
				<Separator />
				<Separator />
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label>Login Alerts</Label>
						<p className="text-sm text-muted-foreground">
							Get notified of new login attempts
						</p>
					</div>
					<Switch
						checked={security.loginAlerts}
						onCheckedChange={(checked) =>
							updateSecurity("loginAlerts", checked)
						}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
