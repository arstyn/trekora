import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import { Building2, Globe, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type OrganizationProfile = {
  id?: string;
  name: string;
  size?: string;
  industry?: string;
  domain?: string;
  description?: string;
};

export function OrganizationSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [organization, setOrganization] = useState<OrganizationProfile>({} as OrganizationProfile);
  const [initialOrg, setInitialOrg] = useState<OrganizationProfile>({} as OrganizationProfile);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const getOrganizationData = async () => {
      try {
        // First get employee profile to find organizationId and role
        const employeeRes = await axiosInstance.get(`/employee/profile`);
        const orgId = employeeRes.data.organizationId;
        const permissionSets = employeeRes.data.permissionSets || [];
        const isAdminSet = permissionSets.some((ps: any) => ps.name?.toLowerCase().includes("admin"));
        setRole(isAdminSet ? "admin" : "employee");

        if (orgId) {
          const orgRes = await axiosInstance.get(`/organization/${orgId}`);
          const transformed: OrganizationProfile = {
            id: orgRes.data.id,
            name: orgRes.data.name || "",
            size: orgRes.data.size || "",
            industry: orgRes.data.industry || "",
            domain: orgRes.data.domain || "",
            description: orgRes.data.description || "",
          };
          setOrganization(transformed);
          setInitialOrg(transformed);
        }
      } catch (error) {
        toast.error("Failed to load organization data");
      }
    };

    getOrganizationData();
  }, []);

  const isOrgModified = (): boolean => {
    return (
      organization.name !== initialOrg.name ||
      organization.size !== initialOrg.size ||
      organization.industry !== initialOrg.industry ||
      organization.domain !== initialOrg.domain ||
      organization.description !== initialOrg.description
    );
  };

  const handleOrgUpdate = async () => {
    if (!organization.id) return;
    setIsLoading(true);
    
    try {
      const payload = {
        name: organization.name,
        size: organization.size,
        industry: organization.industry,
        domain: organization.domain,
        description: organization.description,
      };

      const result = await axiosInstance.put(`/organization/${organization.id}`, payload);
      setOrganization({ ...organization, ...result.data });
      setInitialOrg({ ...organization, ...result.data });
      toast.success("Organization Details Updated");
    } catch (error) {
      toast.error("Failed to update organization");
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = role?.toLowerCase() === "admin";

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Organization Profile
        </CardTitle>
        <CardDescription>
          Manage your organization's details and industry information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="orgName"
                className="pl-10"
                value={organization.name ?? ""}
                disabled={!isAdmin}
                onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="website"
                className="pl-10"
                value={organization.domain ?? ""}
                disabled={!isAdmin}
                onChange={(e) => setOrganization({ ...organization, domain: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgSize">Organization Size</Label>
            <Select
              disabled={!isAdmin}
              value={organization.size}
              onValueChange={(val) => setOrganization({ ...organization, size: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-1000">201-1000 employees</SelectItem>
                <SelectItem value="1000+">1000+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select
              disabled={!isAdmin}
              value={organization.industry}
              onValueChange={(val) => setOrganization({ ...organization, industry: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="travel-agency">Travel Agencies</SelectItem>
                <SelectItem value="hotel-resort">Hotels & Resorts</SelectItem>
                <SelectItem value="hajj-umra">Hajj & Umra</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              disabled={!isAdmin}
              value={organization.description ?? ""}
              onChange={(e) => setOrganization({ ...organization, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        {isAdmin && (
          <div className="flex justify-end w-full items-center pt-2">
            <Button
              onClick={handleOrgUpdate}
              disabled={isLoading || !isOrgModified()}
              className="w-full md:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Updating..." : "Update Organization"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
