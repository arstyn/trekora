import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit, MoreHorizontal, PlusCircle, Trash2 } from "lucide-react"
import type { Customer, Group } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"

interface GroupManagementProps {
  groups: Group[]
  customers: Customer[]
  onAdd(group: Group):void
  onUpdate(group: Group):void
    onDelete(group: Group):void

  
}
export default function GroupManagement({
    groups,customers
    , onAdd, onUpdate, onDelete,
}: GroupManagementProps) {

const [isAddingGroup, setIsAddingGroup] = useState(false)
}