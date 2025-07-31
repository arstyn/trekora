import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import axiosInstance from "@/lib/axios";
import type { IUser } from "@/types/user.types";
import {
  Building,
  Camera,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type UserProfile = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  location?: string;
  avatar?: string;
};

export function UserProfileSection() {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserProfile>({} as UserProfile);
  const [initialUser, setInitialUser] = useState<UserProfile>(
    {} as UserProfile
  );
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const getUserData = async () => {
      try {
        const user = await axiosInstance.get(`/employee/profile`);

        setRole(user.data.role?.name || "employee");
        const transformed: UserProfile = {
          id: user.data.id,
          name: user.data.name,
          email: user.data.email || user.data.user?.email || "",
          phone: user.data.phone || user.data.user?.phone || "",
          position: user.data.role?.name || "",
          department:
            user.data.employeeDepartments?.[0]?.department?.name || "",
          location: user.data.address || "",
          avatar: user.data.avatar || "",
        };
        setUser(transformed);
        setInitialUser(transformed);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to load user data");
        }
      }
    };

    getUserData();
  }, []);

  const isUserModified = (): boolean => {
    return (
      user.name !== initialUser.name ||
      user.email !== initialUser.email ||
      user.phone !== initialUser.phone ||
      user.position !== initialUser.position ||
      user.department !== initialUser.department ||
      user.location !== initialUser.location ||
      user.avatar !== initialUser.avatar
    );
  };

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    if (user.id) {
      const payload = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.location,
      };

      try {
        const userData = await axiosInstance.put<typeof payload, IUser>(
          `/employee/${user.id}`,
          payload
        );
        setUser({ ...user, ...userData });
        setInitialUser({ ...user, ...userData }); // update initial after save
        toast("Employee Details Updated", {
          description: "Your details have been updated successfully.",
        });
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to update profile");
        }
      }
    }

    setIsLoading(false);
  };

  const handleAvatarChange = () => {
    fileInputRef.current?.click();
  };

  const onAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const avatarUrl = URL.createObjectURL(file);
    setUser((prev) => ({ ...prev, avatar: avatarUrl }));

    toast("Avatar Updated", {
      description: "Your avatar has been updated successfully.",
    });
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
        <CardDescription>
          Manage your personal information and profile settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {user.name
                  ?.split(" ")
                  ?.map((n) => n[0])
                  ?.join("")
                  ?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              onClick={handleAvatarChange}
              aria-label="Change avatar"
            >
              <Camera className="h-4 w-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarFileChange}
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <Badge variant="secondary">{user.position || "Employee"}</Badge>
            <p className="text-sm text-muted-foreground">Joined</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={user.name ?? ""}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                className="pl-10"
                value={user.email ?? ""}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                className="pl-10"
                value={user.phone ?? ""}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="position"
                className="pl-10"
                value={user.position ?? ""}
                disabled={role?.toLowerCase() === "admin" ? false : true}
                onChange={(e) => setUser({ ...user, position: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={user.department ?? ""}
              disabled={role?.toLowerCase() === "admin" ? false : true}
              onChange={(e) => setUser({ ...user, department: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                className="pl-10"
                value={user.location ?? ""}
                onChange={(e) => setUser({ ...user, location: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end w-full items-center">
          <Button
            onClick={handleProfileUpdate}
            disabled={isLoading || !isUserModified()}
            className="w-full md:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
