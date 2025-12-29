import type { ReactNode } from "react";
import { useHasPermission } from "@/hooks/use-permissions";

type PermissionGuardProps = {
    resource: string;
    action: string;
    children: ReactNode;
    fallback?: ReactNode;
};

/**
 * Component that conditionally renders children based on user permissions
 *
 * @example
 * <PermissionGuard resource="booking" action="create">
 *   <Button>Create Booking</Button>
 * </PermissionGuard>
 */
export function PermissionGuard({
    resource,
    action,
    children,
    fallback = null,
}: PermissionGuardProps) {
    const { hasPermission, loading } = useHasPermission(resource, action);

    if (loading) {
        return null; // Or return a loading spinner
    }

    if (!hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
