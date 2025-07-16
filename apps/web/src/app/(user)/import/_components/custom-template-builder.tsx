'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  FileSpreadsheet, 
  Users, 
  UserCheck, 
  Building2,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  Settings
} from 'lucide-react';
import { AxiosRequest } from '@/lib/axios';
import { toast } from 'sonner';

interface EntitySchema {
  entityType: string;
  name: string;
  description: string;
  availableFields: ColumnMapping[];
}

interface ColumnMapping {
  excelColumn: string;
  entityField: string;
  required: boolean;
  dataType: 'string' | 'email' | 'phone' | 'date' | 'number' | 'boolean';
  description?: string;
}

export function CustomTemplateBuilder() {
  const [schemas, setSchemas] = useState<EntitySchema[]>([]);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadEntitySchemas();
  }, []);

  const loadEntitySchemas = async () => {
    setIsLoading(true);
    try {
      const response = await AxiosRequest.get('/import/schemas');
      setSchemas(response.schemas);
    } catch (error: any) {
      console.error('Failed to load schemas:', error);
      toast.error('Failed to load entity schemas');
    } finally {
      setIsLoading(false);
    }
  };

  const getEntityIcon = (entityType: string) => {
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

  const getSelectedSchema = () => {
    return schemas.find(schema => schema.entityType === selectedEntityType);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading entity schemas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Custom Template Builder</h2>
        <p className="text-muted-foreground">
          Create custom Excel templates by mapping your column names to entity fields
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>How it works:</strong> Select an entity type to see available fields and create custom templates.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entity Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Entity Configuration
            </CardTitle>
            <CardDescription>
              Choose the entity type to see available fields
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entity-type">Entity Type</Label>
              <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {schemas.map((schema) => {
                    const Icon = getEntityIcon(schema.entityType);
                    return (
                      <SelectItem key={schema.entityType} value={schema.entityType}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {schema.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedEntityType && (
              <div className="space-y-2">
                <Label>Available Fields</Label>
                <div className="grid grid-cols-2 gap-2">
                  {getSelectedSchema()?.availableFields.map((field) => (
                    <div key={field.entityField} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <div>
                        <p className="text-sm font-medium">{field.entityField}</p>
                        <p className="text-xs text-muted-foreground">{field.description}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">{field.dataType}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Template Instructions
            </CardTitle>
            <CardDescription>
              How to create and use custom templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">Step 1: Create Excel File</h4>
                <p className="text-sm text-muted-foreground">
                  Create an Excel file with headers that match the entity fields you want to import.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Step 2: Map Columns</h4>
                <p className="text-sm text-muted-foreground">
                  When uploading, you can specify how your Excel columns map to entity fields.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Step 3: Import Data</h4>
                <p className="text-sm text-muted-foreground">
                  Upload your Excel file and specify the column mapping during import.
                </p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Required fields must be included in your Excel file for successful import.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <CheckCircle className="w-5 h-5" />
            Template Usage Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium">Step 1: Select Entity Type</h4>
            <p className="text-muted-foreground">
              Choose the entity type you want to import data for (Customer, Lead, or Employee).
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Step 2: Create Excel File</h4>
            <p className="text-muted-foreground">
              Create an Excel file with headers that correspond to the entity fields you want to import.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Step 3: Fill Your Data</h4>
            <p className="text-muted-foreground">
              Add your data rows below the header row, ensuring required fields are filled.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Step 4: Import Data</h4>
            <p className="text-muted-foreground">
              Go to the "Upload & Import" tab and select your Excel file with the appropriate column mapping.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 