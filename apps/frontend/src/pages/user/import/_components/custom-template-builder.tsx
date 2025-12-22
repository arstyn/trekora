import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import AxiosRequest from "@/lib/axios";
import {
    Building2,
    Download,
    FileSpreadsheet,
    Loader2,
    Plus,
    Save,
    Settings,
    Trash2,
    UserCheck,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
    dataType: "string" | "email" | "phone" | "date" | "number" | "boolean";
    description?: string;
    validation?: string;
    defaultValue?: string;
}

interface CustomTemplate {
    id?: string;
    name: string;
    description: string;
    entityType: string;
    columns: CustomColumn[];
    isActive: boolean;
    createdAt?: string;
}

interface CustomColumn {
    id: string;
    excelColumnName: string;
    entityField: string;
    isRequired: boolean;
    dataType: "string" | "email" | "phone" | "date" | "number" | "boolean";
    description: string;
    validation: string;
    defaultValue: string;
    isVisible: boolean;
    order: number;
}

export function CustomTemplateBuilder() {
    const [schemas, setSchemas] = useState<EntitySchema[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [templates, setTemplates] = useState<CustomTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] =
        useState<CustomTemplate | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<CustomTemplate>>({
        name: "",
        description: "",
        entityType: "",
        columns: [],
        isActive: true,
    });

    useEffect(() => {
        loadEntitySchemas();
        loadTemplates();
    }, []);

    const loadEntitySchemas = async () => {
        setIsLoading(true);
        try {
            const response = await AxiosRequest.get("/import/schemas");
            console.log("🔄 API Response for schemas:", response);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const schemasData = (response.data as any)?.schemas || [];
            console.log("📋 Loaded schemas:", schemasData);
            setSchemas(schemasData);
        } catch (error) {
            console.error("❌ Failed to load schemas:", error);
            toast.error("Failed to load entity schemas");
        } finally {
            setIsLoading(false);
        }
    };

    const loadTemplates = async () => {
        try {
            const response = await AxiosRequest.get("/import/templates");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setTemplates((response.data as any)?.templates || []);
        } catch (error) {
            console.error("Failed to load templates:", error);
        }
    };

    const getEntityIcon = (entityType: string) => {
        switch (entityType) {
            case "customer":
                return Users;
            case "lead":
                return UserCheck;
            case "employee":
                return Building2;
            default:
                return FileSpreadsheet;
        }
    };

    const handleEntityTypeChange = (entityType: string) => {
        console.log("handleEntityTypeChange called with:", entityType);
        const newSchema = schemas.find(
            (schema) => schema.entityType === entityType
        );
        console.log("Schemas:", schemas);
        console.log("New Schema:", newSchema);
        console.log("Available Fields:", newSchema?.availableFields);

        setFormData((prev) => ({
            ...prev,
            entityType,
            columns:
                newSchema?.availableFields.map((field, index) => ({
                    id: `col-${index}`,
                    excelColumnName: field.excelColumn,
                    entityField: field.entityField,
                    isRequired: field.required,
                    dataType: field.dataType,
                    description: field.description || "",
                    validation: field.validation || "",
                    defaultValue: field.defaultValue || "",
                    isVisible: true,
                    order: index,
                })) || [],
        }));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleColumnChange = (
        columnId: string,
        field: keyof CustomColumn,
        value: any
    ) => {
        setFormData((prev) => ({
            ...prev,
            columns:
                prev.columns?.map((col) =>
                    col.id === columnId ? { ...col, [field]: value } : col
                ) || [],
        }));
    };

    const addColumn = () => {
        const newColumn: CustomColumn = {
            id: `col-${Date.now()}`,
            excelColumnName: "",
            entityField: "",
            isRequired: false,
            dataType: "string",
            description: "",
            validation: "",
            defaultValue: "",
            isVisible: true,
            order: formData.columns?.length || 0,
        };

        setFormData((prev) => ({
            ...prev,
            columns: [...(prev.columns || []), newColumn],
        }));
    };

    const removeColumn = (columnId: string) => {
        setFormData((prev) => ({
            ...prev,
            columns: prev.columns?.filter((col) => col.id !== columnId) || [],
        }));
    };

    const saveTemplate = async () => {
        if (
            !formData.name ||
            !formData.entityType ||
            !formData.columns?.length
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            const payload = {
                ...formData,
                columns: formData.columns?.map((col) => ({
                    excelColumnName: col.excelColumnName,
                    entityField: col.entityField,
                    isRequired: col.isRequired,
                    dataType: col.dataType,
                    description: col.description,
                    validation: col.validation,
                    defaultValue: col.defaultValue,
                    isVisible: col.isVisible,
                    order: col.order,
                })),
            };

            if (isEditing && selectedTemplate?.id) {
                await AxiosRequest.put(
                    `/import/templates/${selectedTemplate.id}`,
                    payload
                );
                toast.success("Template updated successfully");
            } else {
                await AxiosRequest.post("/import/templates", payload);
                toast.success("Template created successfully");
            }

            setIsCreating(false);
            setIsEditing(false);
            setSelectedTemplate(null);
            setFormData({
                name: "",
                description: "",
                entityType: "",
                columns: [],
                isActive: true,
            });
            loadTemplates();
        } catch (error) {
            console.error("Failed to save template:", error);
            toast.error("Failed to save template");
        }
    };

    const downloadTemplate = async (templateId: string) => {
        try {
            const response = await AxiosRequest.get(
                `/import/templates/${templateId}/download`,
                {
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response as unknown as BlobPart])
            );
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `template-${templateId}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Template downloaded successfully");
        } catch (error) {
            console.error("Failed to download template:", error);
            toast.error("Failed to download template");
        }
    };

    const deleteTemplate = async (templateId: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;

        try {
            await AxiosRequest.delete(`/import/templates/${templateId}`);
            toast.success("Template deleted successfully");
            loadTemplates();
        } catch (error) {
            console.error("Failed to delete template:", error);
            toast.error("Failed to delete template");
        }
    };

    const editTemplate = (template: CustomTemplate) => {
        setSelectedTemplate(template);
        setFormData({
            name: template.name,
            description: template.description,
            entityType: template.entityType,
            columns: template.columns,
            isActive: template.isActive,
        });
        setIsEditing(true);
        setIsCreating(false);
    };

    const createNewTemplate = () => {
        setSelectedTemplate(null);
        setFormData({
            name: "",
            description: "",
            entityType: "",
            columns: [],
            isActive: true,
        });
        setIsCreating(true);
        setIsEditing(false);
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">
                        Custom Template Builder
                    </h2>
                    <p className="text-muted-foreground">
                        Create and manage custom Excel templates with field
                        mapping and validation
                    </p>
                </div>
                <Button
                    onClick={createNewTemplate}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Template
                </Button>
            </div>

            {isCreating || isEditing ? (
                <div className="space-y-6">
                    {/* Template Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                {isEditing
                                    ? "Edit Template"
                                    : "Create New Template"}
                            </CardTitle>
                            <CardDescription>
                                Configure your custom import template
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Basic Template Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="template-name">
                                        Template Name *
                                    </Label>
                                    <Input
                                        id="template-name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter template name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="entity-type">
                                        Entity Type *
                                    </Label>
                                    <Select
                                        value={formData.entityType}
                                        onValueChange={handleEntityTypeChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select entity type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schemas.map((schema) => {
                                                const Icon = getEntityIcon(
                                                    schema.entityType
                                                );
                                                return (
                                                    <SelectItem
                                                        key={schema.entityType}
                                                        value={
                                                            schema.entityType
                                                        }
                                                    >
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
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="template-description">
                                    Description
                                </Label>
                                <Textarea
                                    id="template-description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="Describe what this template is for"
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="template-active"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            isActive: checked,
                                        }))
                                    }
                                />
                                <Label htmlFor="template-active">
                                    Active Template
                                </Label>
                            </div>

                            {/* Column Configuration */}
                            {formData.entityType && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">
                                            Column Configuration
                                        </h3>
                                        <Button
                                            onClick={addColumn}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Column
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.columns?.map((column) => (
                                            <Card
                                                key={column.id}
                                                className="border-l-4 border-l-blue-500"
                                            >
                                                <CardContent className="pt-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>
                                                                Excel Column
                                                                Name *
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    column.excelColumnName
                                                                }
                                                                onChange={(e) =>
                                                                    handleColumnChange(
                                                                        column.id,
                                                                        "excelColumnName",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="e.g., Customer Name"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>
                                                                Entity Field *
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    column.entityField
                                                                }
                                                                onValueChange={(
                                                                    value
                                                                ) =>
                                                                    handleColumnChange(
                                                                        column.id,
                                                                        "entityField",
                                                                        value
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select field" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {schemas
                                                                        .find(
                                                                            (
                                                                                schema
                                                                            ) =>
                                                                                schema.entityType ===
                                                                                formData.entityType
                                                                        )
                                                                        ?.availableFields.map(
                                                                            (
                                                                                field
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        field.entityField
                                                                                    }
                                                                                    value={
                                                                                        field.entityField
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        field.entityField
                                                                                    }
                                                                                </SelectItem>
                                                                            )
                                                                        )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>
                                                                Data Type
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    column.dataType
                                                                }
                                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                                onValueChange={(
                                                                    value: any
                                                                ) =>
                                                                    handleColumnChange(
                                                                        column.id,
                                                                        "dataType",
                                                                        value
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="string">
                                                                        Text
                                                                    </SelectItem>
                                                                    <SelectItem value="email">
                                                                        Email
                                                                    </SelectItem>
                                                                    <SelectItem value="phone">
                                                                        Phone
                                                                    </SelectItem>
                                                                    <SelectItem value="date">
                                                                        Date
                                                                    </SelectItem>
                                                                    <SelectItem value="number">
                                                                        Number
                                                                    </SelectItem>
                                                                    <SelectItem value="boolean">
                                                                        Boolean
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>
                                                                Required
                                                            </Label>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`required-${column.id}`}
                                                                    checked={
                                                                        column.isRequired
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked
                                                                    ) =>
                                                                        handleColumnChange(
                                                                            column.id,
                                                                            "isRequired",
                                                                            checked
                                                                        )
                                                                    }
                                                                />
                                                                <Label
                                                                    htmlFor={`required-${column.id}`}
                                                                >
                                                                    Required
                                                                    field
                                                                </Label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                        <div className="space-y-2">
                                                            <Label>
                                                                Description
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    column.description
                                                                }
                                                                onChange={(e) =>
                                                                    handleColumnChange(
                                                                        column.id,
                                                                        "description",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Column description"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>
                                                                Default Value
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    column.defaultValue
                                                                }
                                                                onChange={(e) =>
                                                                    handleColumnChange(
                                                                        column.id,
                                                                        "defaultValue",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Default value if empty"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 mt-4">
                                                        <Label>
                                                            Validation Rules
                                                        </Label>
                                                        <Input
                                                            value={
                                                                column.validation
                                                            }
                                                            onChange={(e) =>
                                                                handleColumnChange(
                                                                    column.id,
                                                                    "validation",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="e.g., min:3,max:50,email"
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                id={`visible-${column.id}`}
                                                                checked={
                                                                    column.isVisible
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleColumnChange(
                                                                        column.id,
                                                                        "isVisible",
                                                                        checked
                                                                    )
                                                                }
                                                            />
                                                            <Label
                                                                htmlFor={`visible-${column.id}`}
                                                            >
                                                                Include in
                                                                template
                                                            </Label>
                                                        </div>

                                                        <Button
                                                            onClick={() =>
                                                                removeColumn(
                                                                    column.id
                                                                )
                                                            }
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 pt-4 border-t">
                                <Button
                                    onClick={saveTemplate}
                                    className="flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {isEditing
                                        ? "Update Template"
                                        : "Create Template"}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsCreating(false);
                                        setIsEditing(false);
                                        setSelectedTemplate(null);
                                        setFormData({
                                            name: "",
                                            description: "",
                                            entityType: "",
                                            columns: [],
                                            isActive: true,
                                        });
                                    }}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* Template List */
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5" />
                                Your Templates
                            </CardTitle>
                            <CardDescription>
                                Manage your custom import templates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {templates.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">
                                        No templates yet
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Create your first custom template to get
                                        started
                                    </p>
                                    <Button onClick={createNewTemplate}>
                                        Create Template
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {templates.map((template) => {
                                        const Icon = getEntityIcon(
                                            template.entityType
                                        );
                                        return (
                                            <Card
                                                key={template.id}
                                                className="border-l-4 border-l-blue-500"
                                            >
                                                <CardContent className="pt-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Icon className="w-8 h-8 text-blue-600" />
                                                            <div>
                                                                <h3 className="font-semibold">
                                                                    {
                                                                        template.name
                                                                    }
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {
                                                                        template.description
                                                                    }
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Badge variant="outline">
                                                                        {
                                                                            template.entityType
                                                                        }
                                                                    </Badge>
                                                                    {template.isActive && (
                                                                        <Badge variant="default">
                                                                            Active
                                                                        </Badge>
                                                                    )}
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {template
                                                                            .columns
                                                                            ?.length ||
                                                                            0}{" "}
                                                                        columns
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                onClick={() =>
                                                                    downloadTemplate(
                                                                        template.id!
                                                                    )
                                                                }
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex items-center gap-2"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                Download
                                                            </Button>
                                                            <Button
                                                                onClick={() =>
                                                                    editTemplate(
                                                                        template
                                                                    )
                                                                }
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex items-center gap-2"
                                                            >
                                                                <Settings className="w-4 h-4" />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                onClick={() =>
                                                                    deleteTemplate(
                                                                        template.id!
                                                                    )
                                                                }
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
