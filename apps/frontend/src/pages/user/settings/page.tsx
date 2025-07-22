import { UserProfileSection } from "./_component/user-profile-section";
import { ThemeSection } from "./_component/theme-section";
import { NotificationSection } from "./_component/notification-section";
import { AccountActionsSection } from "./_component/account-actions-section";

export default function SettingsPage() {
	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="grid gap-6 md:grid-cols-2">
				<UserProfileSection />
				<ThemeSection />
				<NotificationSection />
				<AccountActionsSection />
			</div>
		</div>
	);
}
