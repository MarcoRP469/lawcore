
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
import type { Notaria, MetricasDashboard, ComentarioReciente, FuenteTrafico } from "@/core/tipos";
import { Skeleton } from "@/components/ui/skeleton"
import { useData, useOneData } from "@/hooks/use-data";
import { useUser } from "@/context/auth-provider";
import { generateSummary } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


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

export default function PaginaMetricasDashboard() {
  const user = useUser();
  const isClient = user?.role === 'client';
  const isSuperAdmin = user?.role === 'superadmin' || user?.es_admin === true;

  const [notariaSeleccionada, setNotariaSeleccionada] = React.useState<string>("all");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedSummaries, setGeneratedSummaries] = React.useState<Record<string, string>>({});
  const { toast } = useToast();

  // 1. Fetch Notarias for dropdown
  const endpointNotarias = isClient ? `/notarias?owner_id=${user?.id}` : "/notarias";
  const { data: notaries, isLoading: cargandoNotarias } = useData<Notaria>(endpointNotarias);

  // 2. Auto-select for client
  React.useEffect(() => {
      if (isClient && notaries && notaries.length > 0) {
          setNotariaSeleccionada(notaries[0].id.toString());
      }
  }, [isClient, notaries]);

  const handleGenerateSummary = async () => {
    if (notariaSeleccionada === "all") return;
    
    setIsGenerating(true);
    try {
      const response = await generateSummary(notariaSeleccionada);
      const newSummary = response.data.summary;
      
      setGeneratedSummaries(prev => ({
        ...prev,
        [notariaSeleccionada]: newSummary
      }));

      toast({
        title: "Resumen Generado",
        description: "El análisis de comentarios se ha completado exitosamente.",
      });
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el resumen.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Fetch Metrics
  // Construct URL with optional owner_id filter
  // If Client, we ALWAYS pass owner_id.
  // If Superadmin, we pass owner_id ONLY if they selected a specific notary?
  // Wait, the backend supports filtering by owner.
  // BUT the current UI requirement for "Notaria Seleccionada" is mainly for the "AI Summary".
  // However, usually Dashboard metrics should filter if a context is selected.
  // Let's implement:
  // - If Client: metrics fetched with ?owner_id=user.id
  // - If Superadmin: fetch all. (Refining by specific notary in charts isn't implemented in backend yet, just by Owner).

  const endpointMetrics = isClient ? `/metricas?owner_id=${user?.id}` : "/metricas";
  const { data: metricsData, isLoading: loadingMetrics } = useOneData<MetricasDashboard>(endpointMetrics);

  const resumenSeleccionado = React.useMemo(() => {
    if (cargandoNotarias) return null;

    if (notariaSeleccionada === "all") {
        if (isClient) return "Cargando tu notaría...";
        return "Selecciona una notaría para ver el resumen de sus comentarios.";
    }

    // Check if we have a locally generated summary first
    if (generatedSummaries[notariaSeleccionada]) {
        return generatedSummaries[notariaSeleccionada];
    }

    const selectedNotary = notaries?.find(n => n.id.toString() === notariaSeleccionada);
    return selectedNotary?.commentSummary || null;
  }, [notariaSeleccionada, notaries, cargandoNotarias, isClient, generatedSummaries]);

  if (loadingMetrics || !metricsData) {
      return <div className="p-8 space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
          </div>
      </div>
  }

  const { kpi, visitas, topNotarias, comentariosRecientes, fuentesTrafico } = metricsData;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Métricas</h1>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitas Totales</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.totalVisitas.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {kpi.cambioVisitas > 0 ? "+" : ""}{kpi.cambioVisitas}% desde el mes pasado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                 {isClient ? "Usuarios Únicos" : "Nuevos Usuarios"}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{kpi.nuevosUsuarios.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total registrado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comentarios Publicados</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{kpi.comentariosPublicados.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total histórico
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                No disponible en tiempo real
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">

          {/* Line Chart: Visits */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Visión General de Visitas</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
               <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <LineChart data={visitas} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
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

          {/* Bar Chart: Top Notaries (Only helpful if user has multiple notaries or is Superadmin) */}
          <Card>
            <CardHeader>
              <CardTitle>Notarías más Vistas</CardTitle>
              <CardDescription>
                Top de tus notarías con más visitas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topNotarias.length > 0 ? (
                  <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart data={topNotarias} layout="vertical" margin={{ left: -10, right: 20 }}>
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
              ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                      No hay datos suficientes.
                  </div>
              )}
            </CardContent>
          </Card>
          
          {/* AI Summary Section */}
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
                        <Select
                            value={notariaSeleccionada}
                            onValueChange={setNotariaSeleccionada}
                            disabled={isClient}
                        >
                            <SelectTrigger className="w-full sm:w-[280px]">
                                <SelectValue placeholder="Seleccionar notaría..." />
                            </SelectTrigger>
                            <SelectContent>
                                {isSuperAdmin && <SelectItem value="all">Seleccionar Notaría</SelectItem>}
                                {notaries?.map(n => <SelectItem key={n.id} value={n.id.toString()}>{n.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Resumen Generado por IA:</h4>
                  {!resumenSeleccionado && notariaSeleccionada !== "all" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleGenerateSummary}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generar Resumen
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {resumenSeleccionado ? (
                   <p className="text-sm text-muted-foreground italic">&ldquo;{resumenSeleccionado}&rdquo;</p>
                ) : (
                   <p className="text-sm text-muted-foreground italic">
                     {notariaSeleccionada === "all" ? "Selecciona una notaría." : "No hay resumen disponible. Haz clic en Generar."}
                   </p>
                )}
            </CardContent>
          </Card>

           {/* Recent Comments Table */}
           <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>Comentarios Recientes</CardTitle>
              <CardDescription>
                Últimos comentarios recibidos.
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
                  {comentariosRecientes.length > 0 ? comentariosRecientes.map((comment: ComentarioReciente) => (
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

           {/* Pie Chart: Traffic Source (Static for now) */}
           <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>Fuentes de Tráfico</CardTitle>
               <CardDescription>Distribución de visitas al sitio web (Simulado).</CardDescription>
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
                    {fuentesTrafico.map((entry: FuenteTrafico, index: number) => (
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
