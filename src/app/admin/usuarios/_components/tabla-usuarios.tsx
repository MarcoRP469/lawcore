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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Shield, ShieldCheck } from "lucide-react";
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
import type { Usuario } from "@/core/tipos";
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

const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
}

interface UsuarioConEstadoAdmin extends Usuario {
    isAdmin: boolean;
}

interface TablaUsuariosProps {
  data: Usuario[];
  admins: string[]; // Array of admin UIDs
  currentUserId?: string | null;
}

export default function TablaUsuarios({ data, admins, currentUserId }: TablaUsuariosProps) {
  const { toast } = useToast();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [actionToConfirm, setActionToConfirm] = React.useState<{ user: Usuario, makeAdmin: boolean } | null>(null);

  const handleRoleChangeClick = (user: Usuario, makeAdmin: boolean) => {
    setActionToConfirm({ user, makeAdmin });
    setIsConfirmDialogOpen(true);
  };

  const confirmRoleChange = async () => {
    if (actionToConfirm) {
      const { user, makeAdmin } = actionToConfirm;
      try {
        if (makeAdmin) {
          await api.post('/admins', { id: user.id });
        } else {
          await api.delete(`/admins/${user.id}`);
        }
        toast({
          title: "Rol actualizado",
          description: `El usuario "${user.displayName}" ahora ${makeAdmin ? 'es' : 'no es'} administrador.`,
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

  const tableData: UsuarioConEstadoAdmin[] = React.useMemo(() =>
    data.map(user => ({
      ...user,
      isAdmin: admins.includes(user.id),
    })), [data, admins]);

  const columns: ColumnDef<UsuarioConEstadoAdmin>[] = [
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
      accessorKey: "isAdmin",
      header: "Rol",
      cell: ({ row }) => {
        const isAdmin = row.getValue("isAdmin");
        return (
            <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? "Admin" : "Usuario"}
            </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        const isAdmin = user.isAdmin;
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
              {isAdmin ? (
                 <DropdownMenuItem onClick={() => handleRoleChangeClick(user, false)} disabled={isSelf}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Quitar Admin
                 </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRoleChangeClick(user, true)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Hacer Admin
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: tableData,
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
    isAdmin: "Rol",
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
              {actionToConfirm?.makeAdmin
                ? `Estás a punto de conceder permisos de administrador a ${actionToConfirm?.user.displayName}.`
                : `Estás a punto de revocar los permisos de administrador de ${actionToConfirm?.user.displayName}.`
              }
               Esta acción se puede revertir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>
              Sí, continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
