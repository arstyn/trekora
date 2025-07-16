'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Users, 
  UserCheck, 
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { ImportUploader } from './_components/import-uploader';
import { ImportHistory } from './_components/import-history';
import { TemplateFormBuilder } from './_components/template-form-builder';

interface ImportTemplate {
  entityType: string;
  name: string;
  description: string;
  requiredFields: string[];
}

const importTemplates: ImportTemplate[] = [
  {
    entityType: 'customer',
    name: 'Customer Import',
    description: 'Import customer data with fields: Name, Email, Phone, Address, Status, Notes',
    requiredFields: ['Name', 'Email', 'Phone'],
  },
  {
    entityType: 'lead',
    name: 'Lead Import',
    description: 'Import lead data with fields: Name, Email, Phone, Company, Status, Notes',
    requiredFields: ['Name'],
  },
  {
    entityType: 'employee',
    name: 'Employee Import',
    description: 'Import employee data with fields: Name, Email, Phone, Role, Address, Gender, Nationality, Join Date',
    requiredFields: ['Name', 'Email'],
  },
];

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState('upload');
  const [importHistory, setImportHistory] = useState<any[]>([]);

  const handleImportComplete = (result: any) => {
    setImportHistory(prev => [result, ...prev]);
    setActiveTab('history');
  };

  return (
    <div className="container mx-auto py-6 space-y-6 px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Import</h1>
          <p className="text-muted-foreground">
            Import your data from Excel sheets to streamline your workflow
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          Excel Support
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload & Import
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Custom Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Import History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ImportUploader onImportComplete={handleImportComplete} />
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Import Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-medium">Supported Formats</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Excel (.xlsx, .xls)</li>
                      <li>• Maximum file size: 10MB</li>
                      <li>• First row must contain headers</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Data Types</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Customers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Leads</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">Employees</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tip:</strong> Download a template first to ensure your data format is correct.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TemplateFormBuilder />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <ImportHistory history={importHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 