'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  FileSpreadsheet, 
  Users, 
  UserCheck, 
  Building2,
  CheckCircle,
  Info,
  Loader2
} from 'lucide-react';
import { AxiosRequest } from '@/lib/axios';
import { toast } from 'sonner';

interface ImportTemplate {
  entityType: string;
  name: string;
  description: string;
  requiredFields: string[];
}

interface ImportTemplatesProps {
  templates: ImportTemplate[];
}

export function ImportTemplates({ templates }: ImportTemplatesProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const getIcon = (entityType: string) => {
    switch (entityType) {
      case 'customer':
        return Users;
      case 'lead':
        return UserCheck;
      case 'employee':
        return Building2;
      default:
        return FileSpreadsheet;
    }
  };

  const handleDownloadTemplate = async (entityType: string) => {
    setDownloading(entityType);
    
    try {
      const response = await AxiosRequest.get(`/import/template/${entityType}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${entityType}_import_template.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${entityType} template downloaded successfully`);
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Import Templates</h2>
        <p className="text-muted-foreground">
          Download Excel templates to ensure your data is formatted correctly for import
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Use these templates to ensure your Excel files have the correct column headers and data format. 
          The first row should contain the headers exactly as shown in the template.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const Icon = getIcon(template.entityType);
          
          return (
            <Card key={template.entityType} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.requiredFields.length} required
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Required Fields:</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.requiredFields.map((field) => (
                      <Badge key={field} variant="secondary" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Optional Fields:</h4>
                  <div className="text-xs text-muted-foreground">
                    All other fields in the template are optional and can be left empty.
                  </div>
                </div>

                <Button
                  onClick={() => handleDownloadTemplate(template.entityType)}
                  disabled={downloading === template.entityType}
                  className="w-full"
                  variant="outline"
                >
                  {downloading === template.entityType ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <CheckCircle className="w-5 h-5" />
            Template Usage Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium">Step 1: Download Template</h4>
            <p className="text-muted-foreground">
              Click the download button above to get the Excel template for your data type.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Step 2: Fill Your Data</h4>
            <p className="text-muted-foreground">
              Replace the sample data with your actual data. Make sure to keep the header row intact.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Step 3: Upload & Import</h4>
            <p className="text-muted-foreground">
              Go to the "Upload & Import" tab and select your filled template file.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Step 4: Review Results</h4>
            <p className="text-muted-foreground">
              Check the import results to see how many records were successfully imported.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 