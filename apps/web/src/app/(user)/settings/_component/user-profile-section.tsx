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

// interface UserProfile {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   position: string;
//   department: string;
//   location: string;
//   avatar: string;
//   joinDate: string;
// }

interface UserProfileData {
  id: string;
  branchId?: string;
  email: string;
  phone: string;
  password: string;
}

// const initialData = {
//   id: '1',
//   name: 'John Doe',
//   email: 'john.doe@company.com',
//   phone: '+1 (555) 123-4567',
//   position: 'Branch Manager',
//   department: 'Operations',
//   location: 'New York Branch',
//   avatar: '/placeholder.svg?height=100&width=100',
//   joinDate: '2023-01-15',
// };

export function UserProfileSection() {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const [userProfile, setUserProfile] = useState<UserProfile>(initialData);
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const getUserData = async () => {
      const response = await getUser('d03cdfda-5200-41b9-b90a-6a5222a6f4ea');
      console.log('Updated Profile Data:', response.user);
      if (response?.user) {
        setUser(response?.user);
      }
    };
    getUserData();
  }, []);

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to update profile. Please try again.', error);
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
    setUser((prev: any) => ({ ...prev, avatar: avatarUrl }));

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
                  ?.map((n: any) => n[0])
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
            <Badge variant="secondary">{user.position}</Badge>
            <p className="text-sm text-muted-foreground">
              Joined {new Date(user.joinDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
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
          ].map(([label, key, icon]) => (
            <div key={key as string} className="space-y-2">
              <Label htmlFor={key as string}>{label}</Label>
              <div className="relative">
                {icon}
                <Input
                  id={key as string}
                  className={icon ? 'pl-10' : ''}
                  value={user[key as keyof any] as string}
                  onChange={(e) =>
                    setUser((prev: any) => ({
                      ...prev,
                      [key as string]: e.target.value,
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
