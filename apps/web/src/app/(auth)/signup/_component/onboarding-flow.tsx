'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  Building2,
  Users,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Phone,
  Globe,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

type Step = 'signup' | 'organization' | 'team' | 'complete';

interface FormData {
  // Personal info
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;

  // Organization info
  orgName: string;
  orgSize: string;
  industry: string;
  website: string;
  description: string;

  // Team info
  teamMembers: Array<{ email: string; role: string }>;

  // Preferences
  notifications: boolean;
  newsletter: boolean;
}

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<Step>('signup');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    orgName: '',
    orgSize: '',
    industry: '',
    website: '',
    description: '',
    teamMembers: [],
    notifications: true,
    newsletter: false,
  });

  const steps = [
    { id: 'signup', title: 'Personal Info', icon: User },
    { id: 'organization', title: 'Organization', icon: Building2 },
    { id: 'team', title: 'Team Setup', icon: Users },
    { id: 'complete', title: 'Complete', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const addTeamMember = () => {
    updateFormData({
      teamMembers: [...formData.teamMembers, { email: '', role: 'member' }],
    });
  };

  const updateTeamMember = (
    index: number,
    field: 'email' | 'role',
    value: string,
  ) => {
    const updated = formData.teamMembers.map((member, i) =>
      i === index ? { ...member, [field]: value } : member,
    );
    updateFormData({ teamMembers: updated });
  };

  const removeTeamMember = (index: number) => {
    updateFormData({
      teamMembers: formData.teamMembers.filter((_, i) => i !== index),
    });
  };

  const nextStep = () => {
    const stepOrder: Step[] = ['signup', 'organization', 'team', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1] as Step);
    }
  };

  const prevStep = () => {
    const stepOrder: Step[] = ['signup', 'organization', 'team', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1] as Step);
    }
  };

  const renderStepIndicator = () => (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = index < currentStepIndex;

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`
                w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                ${
                  isActive
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background border-muted-foreground/30 text-muted-foreground'
                }
              `}
              >
                <StepIcon className="w-5 h-5" />
              </div>
              <span
                className={`text-sm mt-2 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );

  const renderSignupStep = () => (
    <Card className="mx-auto max-w-md w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Your Account</CardTitle>
        <CardDescription>
          Let's start with your personal information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData({ firstName: e.target.value })}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData({ lastName: e.target.value })}
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              className="pl-10"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              className="pl-10"
              value={formData.password}
              onChange={(e) => updateFormData({ password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              className="pl-10"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <Button onClick={nextStep} className="w-full">
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderOrganizationStep = () => (
    <Card className="mx-auto max-w-md w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Setup Your Organization</CardTitle>
        <CardDescription>
          Tell us about your company or organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orgName">Organization Name</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="orgName"
              className="pl-10"
              value={formData.orgName}
              onChange={(e) => updateFormData({ orgName: e.target.value })}
              placeholder="Acme Corporation"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="orgSize">Organization Size</Label>
          <Select
            value={formData.orgSize}
            onValueChange={(value) => updateFormData({ orgSize: value })}
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
            value={formData.industry}
            onValueChange={(value) => updateFormData({ industry: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (Optional)</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="website"
              className="pl-10"
              value={formData.website}
              onChange={(e) => updateFormData({ website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Brief description of your organization..."
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={prevStep}
            className="flex-1 bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={nextStep} className="flex-1">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderTeamStep = () => (
    <Card className="mx-auto max-w-md w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Invite Your Team</CardTitle>
        <CardDescription>
          Add team members to collaborate (you can skip this step)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {formData.teamMembers.length > 0 && (
          <div className="space-y-3">
            {formData.teamMembers.map((member, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={member.email}
                    onChange={(e) =>
                      updateTeamMember(index, 'email', e.target.value)
                    }
                    placeholder="colleague@example.com"
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={member.role}
                    onValueChange={(value) =>
                      updateTeamMember(index, 'role', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeTeamMember(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="outline"
          onClick={addTeamMember}
          className="w-full bg-transparent"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>

        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notifications"
              checked={formData.notifications}
              onCheckedChange={(checked) =>
                updateFormData({ notifications: !!checked })
              }
            />
            <Label htmlFor="notifications" className="text-sm">
              Send me notifications about team activity
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="newsletter"
              checked={formData.newsletter}
              onCheckedChange={(checked) =>
                updateFormData({ newsletter: !!checked })
              }
            />
            <Label htmlFor="newsletter" className="text-sm">
              Subscribe to product updates and tips
            </Label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={prevStep}
            className="flex-1 bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={nextStep} className="flex-1">
            Complete Setup <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCompleteStep = () => (
    <Card className="mx-auto max-w-md w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Welcome to the Platform!</CardTitle>
        <CardDescription>
          Your account and organization have been successfully created
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {formData.firstName[0]}
                {formData.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {formData.firstName} {formData.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{formData.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span>{formData.orgName}</span>
            <Badge variant="secondary">{formData.orgSize}</Badge>
          </div>

          {formData.teamMembers.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{formData.teamMembers.length} team member(s) invited</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            What's next?
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Check your email for verification</li>
            <li>• Explore your dashboard</li>
            <li>• Set up your first project</li>
            <li>• Invite more team members</li>
          </ul>
        </div>

        <Button className="w-full" size="lg">
          Go to Dashboard
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-3xl" />

      {/* Geometric shapes */}
      <div className="absolute top-20 right-20 w-20 h-20 border border-purple-500/20 dark:border-purple-500/30 rounded-lg rotate-12" />
      <div className="absolute bottom-32 left-20 w-16 h-16 border border-cyan-500/20 dark:border-cyan-500/30 rounded-full" />
      <div className="container mx-auto">
        {renderStepIndicator()}

        {currentStep === 'signup' && renderSignupStep()}
        {currentStep === 'organization' && renderOrganizationStep()}
        {currentStep === 'team' && renderTeamStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </div>
    </div>
  );
}
