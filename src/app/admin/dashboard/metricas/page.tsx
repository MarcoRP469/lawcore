
"use client"

import * as React from "react"
import {
  Activity,
  Eye,
  Users,
  MessageSquare,
  Star,
  Search,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { Visita, Metrica, ComentarioReciente, Notaria } from "@/core/tipos";
import { Skeleton } from "@/components/ui/skeleton"
import { useData } from "@/hooks/use-data";


const chartConfig = {
  visits: {
    label: "Visitas",
    color: "hsl(var(--chart-1))",
  },
  notaries: {
    label: "Notarías",
    color: "hsl(var(--chart-2))",
  },
} satisfies React.ComponentProps<typeof ChartContainer>["config"]

// --- Placeholder Data ---
const datosKPI: Metrica = {
  totalVisitas: 12530,
  cambioVisitas: 15.2,
  nuevosUsuarios: 120,
  cambioNuevosUsuarios: 10,
  comentariosPublicados: 45,
  cambioComentarios: 25.5,
  activosAhora: 12,
  cambioActivosAhora: 5,
};

const datosVisitas: Visita[] = [
    { date: "Ene", visits: 2000 },
    { date: "Feb", visits: 1800 },
    { date: "Mar", visits: 2200 },
    { date: "Abr", visits: 2500 },
    { date: "May", visits: 2300 },
    { date: "Jun", visits: 3000 },
    { date: "Jul", visits: 3100 },
];

const vistasNotarias: { name: string; views: number }[] = [
  { name: "Notaría Estacio", views: 450 },
  { name: "Notaría Gonzales", views: 300 },
  { name: "Notaría Smith", views: 200 },
  { name: "Notaría Johnson", views: 180 },
  { name: "Notaría Williams", views: 120 },
];

const comentariosRecientes: ComentarioReciente[] = [
    { id: 1, userName: "Ana García", userEmail: "ana@example.com", notaryName: "Notaría Estacio", rating: 5, date: "2023-10-26T10:00:00Z" },
    { id: 2, userName: "Carlos Ruiz", userEmail: "carlos@example.com", notaryName: "Notaría Gonzales", rating: 4, date: "2023-10-25T14:30:00Z" },
    { id: 3, userName: "Lucía Fernández", userEmail: "lucia@example.com", notaryName: "Notaría Estacio", rating: 5, date: "2023-10-25T09:15:00Z" },
]

const fuentesTrafico = [
  { source: "Directo", visitors: 45, fill: "var(--color-visits)" },
  { source: "Google", visitors: 30, fill: "var(--color-notaries)" },
  { source: "Facebook", visitors: 15, fill: "var(--color-chart-3)" },
  { source: "Otro", visitors: 10, fill: "var(--color-chart-4)" },
]
// --- End Placeholder Data ---

export default function PaginaMetricasDashboard() {
  const [notariaSeleccionada, setNotariaSeleccionada] = React.useState<string>("all");
  const { data: notaries, isLoading: cargandoNotarias } = useData<Notaria>("/notarias");

  const resumenSeleccionado = React.useMemo(() => {
    if (cargandoNotarias) return null;

    if (notariaSeleccionada === "all") {
        return "Selecciona una notaría para ver el resumen de sus comentarios.";
    }

    const selectedNotary = notaries?.find(n => n.id.toString() === notariaSeleccionada);
    return selectedNotary?.commentSummary || "No hay resumen disponible para esta notaría.";
  }, [notariaSeleccionada, notaries, cargandoNotarias]);


  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Métricas</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Visitas Totales
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{datosKPI.totalVisitas.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{datosKPI.cambioVisitas}% desde el mes pasado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Nuevos Usuarios
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{datosKPI.nuevosUsuarios.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{datosKPI.cambioNuevosUsuarios}% desde el mes pasado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comentarios Publicados</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{datosKPI.comentariosPublicados.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{datosKPI.cambioComentarios}% desde el mes pasado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{datosKPI.activosAhora}</div>
              <p className="text-xs text-muted-foreground">
                +{datosKPI.cambioActivosAhora}% desde la hora pasada
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Visión General de Visitas</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
               <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <LineChart data={datosVisitas} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={50}
                  />
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Line
                    dataKey="visits"
                    type="natural"
                    stroke="var(--color-visits)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-visits)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notarías más Vistas</CardTitle>
              <CardDescription>
                Top de notarías con más visitas este mes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart data={vistasNotarias} layout="vertical" margin={{ left: -10, right: 20 }}>
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={80}
                  />
                  <XAxis type="number" hide />
                  <Tooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="views" fill="var(--color-notaries)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card className="xl:col-span-3">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-6 w-6 text-primary" />
                            Análisis de Comentarios por IA
                        </CardTitle>
                        <CardDescription>Selecciona una notaría para ver el resumen de sus comentarios generado por IA.</CardDescription>
                    </div>
                    {cargandoNotarias ? (
                        <Skeleton className="h-10 w-full sm:w-[280px]" />
                    ) : (
                        <Select value={notariaSeleccionada} onValueChange={setNotariaSeleccionada}>
                            <SelectTrigger className="w-full sm:w-[280px]">
                                <SelectValue placeholder="Seleccionar notaría..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Seleccionar Notaría</SelectItem>
                                {notaries?.map(n => <SelectItem key={n.id} value={n.id.toString()}>{n.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </CardHeader>
            {cargandoNotarias ? (
                <CardContent className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                </CardContent>
            ) : resumenSeleccionado ? (
                <CardContent className="space-y-2">
                    <h4 className="font-semibold">Resumen Generado por IA:</h4>
                    <p className="text-sm text-muted-foreground italic">&ldquo;{resumenSeleccionado}&rdquo;</p>
                </CardContent>
            ) : null}
            </Card>

           <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>Comentarios Recientes</CardTitle>
              <CardDescription>
                Se han publicado {comentariosRecientes.length} comentarios este mes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Notaría</TableHead>
                    <TableHead className="text-right">Calificación</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comentariosRecientes.length > 0 ? comentariosRecientes.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell>
                        <div className="font-medium">{comment.userName}</div>
                        <div className="text-sm text-muted-foreground">
                          {comment.userEmail}
                        </div>
                      </TableCell>
                      <TableCell>{comment.notaryName}</TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-1">
                          {comment.rating} <Star className="h-4 w-4 text-primary" />
                      </TableCell>
                       <TableCell>{new Date(comment.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No hay comentarios recientes.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
           <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>Fuentes de Tráfico</CardTitle>
               <CardDescription>Distribución de visitas al sitio web.</CardDescription>
            </CardHeader>
            <CardContent>
               <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <PieChart>
                  <Tooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={fuentesTrafico}
                    dataKey="visitors"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="var(--color-notaries)"
                  >
                    {fuentesTrafico.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                    ))}
                  </Pie>
                  <Legend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
