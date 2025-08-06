import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import type { ILead } from "@/types/lead/lead.entity";
import { leadSchema, type LeadFormDTO } from "@/types/lead/lead.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface LeadFormProps {
  lead?: ILead;
  isCreating: boolean;
  onSave: (isCreating: boolean, lead: ILead) => void;
  onClose?: (open: boolean) => void;
  setOpenCustomerCreateModal: (open: boolean) => void;
}

export function LeadForm({
  lead,
  isCreating,
  onSave,
  onClose,
  setOpenCustomerCreateModal,
}: LeadFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormDTO>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      company: "",
      email: undefined,
      phone: "",
      status: "new",
      notes: "",
    },
  });

  useEffect(() => {
    if (lead && !isCreating) {
      reset(lead);
    } else if (isCreating) {
      reset({
        name: "",
        company: "",
        email: "",
        phone: "",
        status: "new",
        notes: "",
      });
    }
  }, [lead, isCreating, reset]);

  const onSubmit = async (data: LeadFormDTO) => {
    setLoading(true);
    if (isCreating) {
      try {
        const res = await axiosInstance.post<ILead>("/lead", data);

        onSave(isCreating, res.data);
        if (onClose) {
          onClose(false);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to load updates");
        }
      }
    } else if (lead) {
      try {
        const res = await axiosInstance.put<ILead>(`/lead/${lead.id}`, data);
        if (res) {
          onSave(isCreating, { ...lead, ...res.data });
          if (onClose) {
            onClose(false);
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to load updates");
        }
      }
    }
    if (data.status === "converted" && setOpenCustomerCreateModal) {
      setOpenCustomerCreateModal(true);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input id="name" {...field} />}
            />
            {errors.name && (
              <span className="text-red-500 text-sm">
                {errors.name.message}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Controller
              name="company"
              control={control}
              render={({ field }) => <Input id="company" {...field} />}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input id="email" type="email" {...field} />
              )}
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <Input id="phone" {...field} />}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => <Textarea id="notes" rows={5} {...field} />}
          />
        </div>
      </div>
      <div className="pt-4 pr-4 flex justify-end gap-2 border-t">
        <Button
          variant="outline"
          onClick={() => {
            if (onClose) {
              onClose(false);
            }
          }}
          type="button"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : isCreating ? "Create Lead" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
