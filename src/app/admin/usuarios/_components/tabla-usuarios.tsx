"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Shield, ShieldCheck, UserCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Usuario } from "@/core/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

// Extender el tipo Usuario del Frontend para incluir role
interface UsuarioExtendido extends Usuario {
    role: 'superadmin' | 'client' | 'public';
}

interface TablaUsuariosProps {
  data: UsuarioExtendido[];
  admins?: string[]; // Deprecado, usamos role
  currentUserId?: string | null;
}

const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
}

export default function TablaUsuarios({ data, currentUserId }: TablaUsuariosProps) {
  const { toast } = useToast();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [actionToConfirm, setActionToConfirm] = React.useState<{ user: UsuarioExtendido, newRole: string } | null>(null);

  const handleRoleChangeClick = (user: UsuarioExtendido, newRole: string) => {
    setActionToConfirm({ user, newRole });
    setIsConfirmDialogOpen(true);
  };

  const confirmRoleChange = async () => {
    if (actionToConfirm) {
      const { user, newRole } = actionToConfirm;
      try {
        await api.put(`/usuarios/${user.id}/role`, { role: newRole });

        toast({
          title: "Rol actualizado",
          description: `El usuario "${user.displayName}" ahora es ${newRole}.`,
        });
        window.location.reload();
      } catch (error) {
         console.error(error);
         toast({
          variant: "destructive",
          title: "Error al actualizar rol",
          description: "No se pudo cambiar el rol del usuario.",
        });
      } finally {
        setIsConfirmDialogOpen(false);
        setActionToConfirm(null);
      }
    }
  }

  const columns: ColumnDef<UsuarioExtendido>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "displayName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nombre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
          <div className="flex items-center gap-3">
              <Avatar>
                  <AvatarImage src={row.original.photoURL || undefined} alt={row.original.displayName || ""} />
                  <AvatarFallback>{getInitials(row.original.displayName)}</AvatarFallback>
              </Avatar>
              <div className="font-medium">{row.getValue("displayName")}</div>
          </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Correo Electrónico",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        let variant: "default" | "secondary" | "outline" | "destructive" = "secondary";
        if (role === 'superadmin') variant = "destructive";
        if (role === 'client') variant = "default";

        return (
            <Badge variant={variant} className="capitalize">
                {role}
            </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        const role = user.role;
        const isSelf = user.id === currentUserId;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                Copiar ID de Usuario
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {!isSelf && (
                  <>
                    {role !== 'superadmin' && (
                        <DropdownMenuItem onClick={() => handleRoleChangeClick(user, 'superadmin')}>
                            <Shield className="mr-2 h-4 w-4" />
                            Hacer Superadmin
                        </DropdownMenuItem>
                    )}
                    {role !== 'client' && (
                        <DropdownMenuItem onClick={() => handleRoleChangeClick(user, 'client')}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Hacer Cliente (Notario)
                        </DropdownMenuItem>
                    )}
                    {role !== 'public' && (
                        <DropdownMenuItem onClick={() => handleRoleChangeClick(user, 'public')}>
                             <User className="mr-2 h-4 w-4" />
                            Hacer Público
                        </DropdownMenuItem>
                    )}
                  </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const columnNames: { [key: string]: string } = {
    displayName: "Nombre",
    email: "Correo Electrónico",
    role: "Rol",
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por correo..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columnas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {columnNames[column.id] ?? column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay usuarios registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
               Estás a punto de cambiar el rol de {actionToConfirm?.user.displayName} a <strong>{actionToConfirm?.newRole}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>
              Sí, cambiar rol
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
