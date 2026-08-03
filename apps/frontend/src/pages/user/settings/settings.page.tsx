import { UserProfileSection } from "./_components/user-profile-section";
import { OrganizationSection } from "./_components/organization-section";
import { ThemeSection } from "./_components/theme-section";
import { NotificationSection } from "./_components/notification-section";
import { AccountActionsSection } from "./_components/account-actions-section";
import { ClearDataSection } from "./_components/clear-data-section";

export default function SettingsPage() {
	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="grid gap-6 md:grid-cols-2">
				<UserProfileSection />
				<OrganizationSection />
				<ThemeSection />
				<NotificationSection />
				<AccountActionsSection />
				<ClearDataSection />
			</div>
		</div>
	);
}
