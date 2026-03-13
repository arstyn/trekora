import { getSession } from "@/lib/auth-utils";
import { PermissionService } from "@/services/permission.service";
import type { PermissionSet } from "@/types/permission.types";
import { useEffect, useState } from "react";

/**
 * Hook to get permission sets for the current user
 */
export function useMyPermissionSets() {
    const [permissionSets, setPermissionSets] = useState<PermissionSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchPermissionSets = async () => {
            try {
                setLoading(true);
                setError(null);
                const sets = await PermissionService.getMyPermissionSets();
                setPermissionSets(sets);
            } catch (err) {
                console.error('❌ Error fetching permission sets:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchPermissionSets();
    }, []);

    return { permissionSets, loading, error };
}

/**
 * Hook to check if current user has a specific permission
 * Note: This checks permission sets assigned to the user.
 * Admins have all permissions by default (handled on backend).
 */
export function useHasPermission(resource: string, action: string) {
    const { permissionSets, loading } = useMyPermissionSets();
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        if (loading) {
            setHasPermission(false);
            return;
        }
        // Check if any permission set contains the required permission
        const hasPerm = permissionSets.some((set) => {
            if (!set.permissionSetPermissions || set.permissionSetPermissions.length === 0) {
                return false;
            }


            const found = set.permissionSetPermissions.some(
                (psp) => {
                    if (!psp.permission) {
                        return false;
                    }

                    const matches = psp.permission.resource === resource &&
                        psp.permission.action === action;

                    return matches;
                }
            );

            return found;
        });

        setHasPermission(hasPerm);
    }, [permissionSets, loading, resource, action]);

    return { hasPermission, loading };
}

/**
 * Hook to check if current user has a specific role
 * Checks the role from the JWT token (which includes the role)
 */
export function useHasRole(roleName: string) {
    const [hasRole, setHasRole] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkRole = async () => {
            try {
                const session = await getSession();
                if (session && (session as any).role) {
                    setHasRole((session as any).role === roleName);
                } else {
                    setHasRole(false);
                }
            } catch (err) {
                console.error("Error checking role:", err);
                setHasRole(false);
            } finally {
                setLoading(false);
            }
        };

        checkRole();
    }, [roleName]);

    return { hasRole, loading };
}

/**
 * Hook to check if current user is admin
 */
export function useIsAdmin() {
    return useHasRole("admin");
}
