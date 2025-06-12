'use client';

import DataTableFooter from '@/components/data-table-footer';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IBranch } from '@repo/api/branch/branch.entity';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { AddBranchDialog } from './add-branch-dialog';
import { deleteBranch } from '../action';
import { EditBranchDialog } from './edit-branch';
import StatusBadge from '@/components/status-badge';
import { IEmployeeStatus } from '@repo/api/employee/employee.entity';

interface Props {
  Initialbranches: IBranch[];
}

export function BranchTable({ Initialbranches }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [branches, setBranches] = useState<any[]>(Initialbranches ?? []);
  const [editId, setEditId] = useState<string>('');

  const columns: ColumnDef<IBranch>[] = [
    {
      accessorKey: 'name',
      header: 'Branch Name',
      cell: ({ row }) => {
        const branch = row.original;
        return <div className="font-medium text-sm">{branch.name}</div>;
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => row.original.location,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.isActive === true ? IEmployeeStatus.ACTIVE : IEmployeeStatus.INACTIVE } />,
    },
    {
      accessorKey: 'Actions',
      header: 'Actions',
      cell: ({ row }) => {
        const branch = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => console.log('View', branch)}>
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setEditId(branch?.id);
                  setIsEditModalOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  handleDeleteBranch(branch?.id);
                }}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleDeleteBranch = async (branchID: string) => {
    const response = await deleteBranch(branchID);
    if (response.branch?.name) {
      setBranches((prev) => prev.filter((branch) => branch.id !== branchID));
    }
  };

  const table = useReactTable({
    data: branches,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const handleOpenAddBranchDialog = () => {
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search branches..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(e) =>
              table.getColumn('name')?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <Button size="sm" onClick={handleOpenAddBranchDialog}>
          <Plus className="h-4 w-4 mr-2" /> Add Branch
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddBranchDialog
        open={isAddModalOpen}
        branches={branches}
        setBranches={setBranches}
        onOpenChange={setIsAddModalOpen}
      />

      <EditBranchDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        branchData={branches.find((i) => i.id === editId)}
        branches={branches}
        setBranches={setBranches}
      />

      <DataTableFooter table={table} />
    </div>
  );
}
