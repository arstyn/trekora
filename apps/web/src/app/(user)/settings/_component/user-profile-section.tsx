'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';
import { getUser, updateUser } from '../action';

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

  useEffect(() => {
    const getUserData = async () => {
      const response = await getUser();
      console.log("-------------response of get user", response.user)
      const data = response?.user;

      if (data?.id) {
        const transformed: UserProfile = {
          id: data.id,
          name: data.name,
          email: data.email || data.user?.email || '',
          phone: data.phoneNumber || data.user?.phone || '',
          position: data.role?.name || '',
          department: data.employeeDepartments?.[0]?.department?.name || '',
          location: data.address || '',
        };

        console.log('Transformed User Profile:', transformed);
        setUser(transformed);
      }
    };

    getUserData();
  }, []);

  const handleProfileUpdate = async () => {
    console.log('------------------------------user.id>', user.id);
    if(user.id) {
      const response = await updateUser(user.id, user);
      console.log('------------------------------response>', response);
    }
  };

  const handleAvatarChange = () => {
    fileInputRef.current?.click();
  };

  const onAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const avatarUrl = URL.createObjectURL(file);
    setUser((prev) => ({ ...prev, avatar: avatarUrl }));

    toast('Avatar Updated', {
      description: 'Your avatar has been updated successfully.',
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
                  ?.split(' ')
                  ?.map((n) => n[0])
                  ?.join('')
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
            <Badge variant="secondary">{user.position || 'Employee'}</Badge>
            <p className="text-sm text-muted-foreground">Joined</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={user.name ?? ''}
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
                value={user.email ?? ''}
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
                value={user.phone ?? ''}
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
                value={user.position ?? ''}
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" value={user.department ?? ''} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                className="pl-10"
                value={user.location ?? ''}
                onChange={(e) => setUser({ ...user, location: e.target.value })}
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleProfileUpdate}
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Updating...' : 'Update Profile'}
        </Button>
      </CardContent>
    </Card>
  );
}
