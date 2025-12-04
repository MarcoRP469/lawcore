"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = {
  light: "",
  dark: ".dark",
} as const

export type ChartTheme = keyof typeof THEMES

const ChartContext = React.createContext<{
  theme: ChartTheme
  dir?: "ltr" | "rtl"
} | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: any
    theme?: ChartTheme
  }
>(({ id, className, children, config, theme: themeProp, ...props }, ref) => {
  const theme = "dark";
  const dir = "ltr";

  return (
    <ChartContext.Provider value={{ theme, dir }}>
      <div
        data-chart-theme={theme}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-polar-grid_[stroke]!]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-reference-line_[stroke]!]:stroke-border [&_.recharts-dot_[stroke]!]:stroke-transparent [&_.recharts-layer[data-name=body]_[stroke]!]:stroke-transparent [&_.recharts-layer[data-name=body]_[fill]!]:fill-primary [&_.recharts-bar_[stroke]!]:stroke-transparent [&_.recharts-tooltip-cursor]:stroke-border",
          THEMES[theme],
          className
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children as React.ReactElement}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { dir } = useChart()
    const [finalLabel, setFinalLabel] = React.useState<React.ReactNode>(label)

    React.useEffect(() => {
      if (!label) {
        if (active && payload?.length) {
          const item = payload[0]
          if (item) {
            setFinalLabel(item.payload[labelKey || "x"] as React.ReactNode)
          }
        }
      }
    }, [label, active, payload, labelKey])

    if (!active || !payload || !payload.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"
    const finalFormatter = formatter || ((value) => value)

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!hideLabel && (
          <div className={cn("grid gap-1.5", labelClassName)}>
            <span className="font-semibold text-muted-foreground">
              {labelFormatter
                ? labelFormatter(finalLabel, payload)
                : finalLabel}
            </span>
            {nestLabel ? (
              payload.map((item, index) => {
                const finalColor = color || item.color || "hsl(var(--foreground))"

                return (
                  <div
                    key={`nest-item-${index}`}
                    className="grid grid-cols-2 items-center gap-x-2 gap-y-1 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
                  >
                    <div className="flex items-center gap-2">
                      {hideIndicator ? null : (
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"
                          style={
                            {
                              "--color-bg": finalColor,
                              "--color-border": finalColor,
                            } as React.CSSProperties
                          }
                        />
                      )}
                      <span>
                        {item.name || (nameKey && item.payload[nameKey]) || "-"}
                      </span>
                    </div>
                    <span className="ml-auto font-mono font-medium text-foreground">
                      {finalFormatter(
                        item.value as number,
                      item.name || "",
                        item,
                        index,
                        payload
                      )}
                    </span>
                  </div>
                )
              })
            ) : null}
          </div>
        )}
        {!nestLabel &&
          payload.map((item, index) => {
            const finalColor = color || item.color || "hsl(var(--foreground))"
            return (
              <div
                key={`item-${index}`}
                className="grid grid-cols-2 items-center gap-x-2 gap-y-1 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  {hideIndicator ? null : indicator === "dot" ? (
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"
                      style={
                        {
                          "--color-bg": finalColor,
                          "--color-border": finalColor,
                        } as React.CSSProperties
                      }
                    />
                  ) : indicator === "line" ? (
                    <div
                      className="h-3 w-px shrink-0 bg-[--color-bg] "
                      style={
                        {
                          "--color-bg": finalColor,
                        } as React.CSSProperties
                      }
                    />
                  ) : indicator === "dashed" ? (
                    <div
                      className="w-3 shrink-0 border-[1.5px] border-dashed border-[--color-border]"
                      style={
                        {
                          "--color-border": finalColor,
                        } as React.CSSProperties
                      }
                    />
                  ) : null}
                  <span>
                    {item.name || (nameKey && item.payload[nameKey]) || "-"}
                  </span>
                </div>
                <span className="ml-auto font-mono font-medium text-foreground">
                  {finalFormatter(
                    item.value as number,
                    item.name || "",
                    item,
                    index,
                    payload
                  )}
                </span>
              </div>
            )
          })}
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { dir } = useChart()

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload?.map((item) => {
          const key = (nameKey && (item.payload as any)?.[nameKey]) || item.value
          const color = item.color as string

          return (
            <div
              key={`legend-item-${key}`}
              className={cn(
                "flex items-center gap-2 text-muted-foreground [&>svg]:h-3 [&>svg]:w-3"
              )}
            >
              {!hideIcon &&
                (item.type === "line" ? (
                  <div
                    className="h-3 w-px shrink-0 bg-[--color-bg]"
                    style={
                      {
                        "--color-bg": color,
                      } as React.CSSProperties
                    }
                  />
                ) : (item.type as string) === "dashed" ? (
                  <div
                    className="w-3 shrink-0 border-[1.5px] border-dashed border-[--color-border]"
                    style={
                      {
                        "--color-border": color,
                      } as React.CSSProperties
                    }
                  />
                ) : (
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                    style={
                      {
                        "--color-bg": color,
                      } as React.CSSProperties
                    }
                  />
                ))}
              <span>{key}</span>
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}
