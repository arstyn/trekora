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
import { getUser } from '../action';

type UserProfile = {
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  location?: string;
};

export function UserProfileSection() {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserProfile>({} as UserProfile);

  useEffect(() => {
    const getUserData = async () => {
      const response = await getUser('0667f994-c1c2-441f-a6f2-2af73b536217');
      const userData = response?.user;
      if (userData) {
        setUser({
          name: userData?.name ?? '',
          email: userData?.email ?? '',
          phone: userData?.phoneNumber ?? '',
          position: userData?.role?.name ?? '',
          department:
            userData?.employeeDepartments?.[0]?.department?.name ?? '',
          location: userData?.organization?.name ?? '',
        });
      }
    };
    getUserData();
  }, []);

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast('Profile Updated', {
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
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
              <AvatarImage src={user?.name} alt={user.name} />
              <AvatarFallback>
                {user.name
                  ?.split(' ')
                  ?.map((n) => n[0])
                  ?.join('')}
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
            <p className="text-sm text-muted-foreground">Joined ghjkl</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ['Full Name', 'name'],
              [
                'Email',
                'email',
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />,
              ],
              [
                'Phone',
                'phone',
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />,
              ],
              [
                'Position',
                'position',
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />,
              ],
              ['Department', 'department'],
              [
                'Location',
                'location',
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />,
              ],
            ] as const
          ).map(([label, key, icon]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <div className="relative">
                {icon}
                <Input
                  id={key}
                  className={icon ? 'pl-10' : ''}
                  value={user[key] ?? ''}
                  disabled={['position', 'department', 'location'].includes(
                    key,
                  )}
                  onChange={(e) =>
                    setUser((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          ))}
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
