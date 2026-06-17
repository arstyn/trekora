import type { UseFormReturn } from "react-hook-form";
import type { PackageFormData } from "@/types/package.schema";
import { AlertCircle } from "lucide-react";

interface StepErrorsProps {
    form: UseFormReturn<PackageFormData>;
    fields: string[];
}

export function StepErrors({ form, fields }: StepErrorsProps) {
    const { errors } = form.formState;
    const errorMessages: string[] = [];

    // Helper to recursively collect error messages from field errors
    const collectErrors = (obj: any) => {
        if (!obj) return;
        if (typeof obj.message === "string") {
            errorMessages.push(obj.message);
            return;
        }
        if (Array.isArray(obj)) {
            obj.forEach((item) => collectErrors(item));
        } else if (typeof obj === "object") {
            Object.values(obj).forEach((val) => collectErrors(val));
        }
    };

    fields.forEach((field) => {
        const fieldError = errors[field as keyof typeof errors];
        if (fieldError) {
            collectErrors(fieldError);
        }
    });

    // Also check root/global refinement errors if we are looking at all or specific steps
    if (errors.root?.message) {
        errorMessages.push(errors.root.message);
    }

    if (errorMessages.length === 0) return null;

    // Deduplicate error messages
    const uniqueErrors = Array.from(new Set(errorMessages));

    return (
        <div className="flex flex-col items-end gap-1 text-right max-w-[280px] sm:max-w-md animate-in fade-in slide-in-from-bottom-1 duration-200">
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Please fix the following errors:</span>
            </div>
            <ul className="text-[11px] text-red-500 space-y-0.5 list-none">
                {uniqueErrors.map((msg, i) => (
                    <li key={i} className="flex items-start gap-1 justify-end">
                        <span className="w-1 h-1 rounded-full bg-red-500 shrink-0 mt-1.5" />
                        <span>{msg}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
