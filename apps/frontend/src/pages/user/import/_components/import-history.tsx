"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  UserCheck,
  Building2,
  Clock,
  Download,
} from "lucide-react";

interface ImportResult {
  success: boolean;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  errors: string[];
  message: string;
  entityType?: string;
  createdAt?: string;
  fileName?: string;
}

interface ImportHistoryProps {
  history: ImportResult[];
}

export function ImportHistory({ history }: ImportHistoryProps) {
  const getIcon = (entityType: string) => {
    switch (entityType) {
      case "customer":
        return Users;
      case "lead":
        return UserCheck;
      case "employee":
        return Users;
      case "branch":
        return Building2;
      default:
        return FileSpreadsheet;
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge
        variant="default"
        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      >
        Success
      </Badge>
    ) : (
      <Badge variant="destructive">Failed</Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const downloadErrorLog = (result: ImportResult) => {
    if (result?.errors?.length === 0) return;

    const errorContent = result?.errors?.join("\n");
    const blob = new Blob([errorContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `import_errors_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Import History
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Import history will appear here after you complete your first import.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Import History
        </h2>
        <p className="text-muted-foreground">
          Track your previous import operations and their results
        </p>
      </div>

      <div className="space-y-4">
        {history.map((result: ImportResult, index: number) => {
          const Icon = getIcon(result.entityType || "unknown");

          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.success)}
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-blue-500" />
                      <CardTitle className="text-lg">
                        {result.entityType
                          ? result.entityType.charAt(0).toUpperCase() +
                            result.entityType.slice(1)
                          : "Unknown"}{" "}
                        Import
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(result.success)}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {result.createdAt
                        ? formatTimestamp(result.createdAt)
                        : "Just now"}
                    </div>
                  </div>
                </div>
                <CardDescription>{result.message}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {result.totalRows}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Rows</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {result.importedRows}
                    </p>
                    <p className="text-sm text-muted-foreground">Imported</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {result.failedRows}
                    </p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                </div>

                {result?.errors?.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span className="font-medium text-sm">
                          Errors ({result?.errors?.length})
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadErrorLog(result)}
                        className="text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download Log
                      </Button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 max-h-32 overflow-y-auto">
                      <div className="space-y-1">
                        {result?.errors
                          ?.slice(0, 3)
                          .map((error: string, errorIndex: number) => (
                            <p
                              key={errorIndex}
                              className="text-xs text-red-600 dark:text-red-400"
                            >
                              {error}
                            </p>
                          ))}
                        {result?.errors?.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            ... and {result?.errors?.length - 3} more errors
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gray-50 dark:bg-gray-900/50">
        <CardHeader>
          <CardTitle className="text-lg">Import Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {history.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Imports</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {history.filter((h: ImportResult) => h.success).length}
              </p>
              <p className="text-sm text-muted-foreground">Successful</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {history.filter((h: ImportResult) => !h.success).length}
              </p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {history.reduce(
                  (sum: number, h: ImportResult) => sum + h.importedRows,
                  0
                )}
              </p>
              <p className="text-sm text-muted-foreground">Total Records</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
