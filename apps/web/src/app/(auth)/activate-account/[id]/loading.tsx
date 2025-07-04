import { Loader2, Shield } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="h-16 w-16 text-blue-500" />
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin absolute -top-1 -right-1" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Activating Your Account
          </CardTitle>
          <CardDescription>
            Please wait while we verify and activate your account...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Loader2 className="h-3 w-3 text-white animate-spin" />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Verifying activation token...
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                Updating account status...
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                Preparing your dashboard...
              </div>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full animate-pulse"
              style={{ width: '60%' }}
            ></div>
          </div>

          {/* Loading Message */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              This usually takes just a few seconds...
            </p>
          </div>

          {/* Animated Dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
