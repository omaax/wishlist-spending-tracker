"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

const THEMES = { light: "", dark: ".dark" } as const

type ChartConfig = Record<string, { label?: React.ReactNode; color?: string }>

const ChartContext = React.createContext<{
  config: ChartConfig
} | null>(null)

function useChart() {
  const ctx = React.useContext(ChartContext)
  if (!ctx) throw new Error("useChart must be used within a <ChartContainer />")
  return ctx
}

interface ChartContainerProps extends React.ComponentProps<"div"> {
  config: ChartConfig
  children: React.ReactElement
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: ChartContainerProps) {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line-line]:stroke-border [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([, cfg]) => cfg.color
  )

  if (!colorConfig.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.color
    return `  --color-${key}: ${color};`
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  label,
  hideLabel = false,
  hideIndicator = false,
  indicator = "dot",
  labelKey,
  nameKey,
  formatter,
}: {
  active?: boolean
  payload?: { value?: number; name?: string; dataKey?: string; color?: string; stroke?: string; fill?: string }[]
  className?: string
  label?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
  labelKey?: string
  formatter?: (value: number) => string
}) {
  const { config } = useChart()

  if (!active || !payload?.length) return null

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3 text-sm text-card-foreground shadow-lg shadow-black/5",
        className
      )}
    >
      {!nestLabel && !hideLabel && (
        <div className="mb-1.5 grid grid-cols-1 gap-1.5">
          <span className="font-medium">{label}</span>
        </div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item: { value?: number; name?: string; dataKey?: string; color?: string; stroke?: string; fill?: string }, index: number) => {
          const key = `${nameKey ?? item.dataKey ?? item.name ?? "value"}`
          const itemConfig = config[key]
          const indicatorColor = item.color ?? item.stroke ?? item.fill ?? "hsl(var(--foreground))"
          const isDot = indicator === "dot"

          return (
            <div
              key={item.dataKey ?? index}
              className={cn(
                "flex w-full items-center gap-2",
                nestLabel ? "items-start" : "items-center"
              )}
            >
              {!hideIndicator && (
                <div
                  className={cn(
                    "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                    isDot && "size-2.5 rounded-full",
                    indicator === "line" && "w-1",
                    indicator === "dashed" &&
                      "w-0 border-[1.5px] border-dashed bg-transparent",
                    nestLabel && isDot && "mt-0.5"
                  )}
                  style={
                    {
                      "--color-bg": indicatorColor,
                      "--color-border": indicatorColor,
                    } as React.CSSProperties
                  }
                />
              )}
              <div
                className={cn(
                  "flex flex-1 justify-between leading-none",
                  nestLabel ? "items-end" : "items-center"
                )}
              >
                <span className="text-muted-foreground">
                  {itemConfig?.label ?? item.name}
                </span>
                {item.value != null && (
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {formatter ? formatter(item.value) : item.value.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

interface ChartLegendContentProps
  extends React.ComponentProps<"div"> {
  payload?: { value: string; color?: string }[]
  hideIcon?: boolean
  nameKey?: string
}

function ChartLegendContent({
  className,
  payload,
  hideIcon = false,
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChart()

  if (!payload?.length) return null

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-3 pt-3",
        className
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey ?? item.value}`
        const itemConfig = config[key]

        return (
          <div key={item.value} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {!hideIcon && (
              <div
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
            )}
            {itemConfig?.label ?? item.value}
          </div>
        )
      })}
    </div>
  )
}

const Pie = RechartsPrimitive.Pie
const PieChart = RechartsPrimitive.PieChart
const Bar = RechartsPrimitive.Bar
const BarChart = RechartsPrimitive.BarChart
const Line = RechartsPrimitive.Line
const LineChart = RechartsPrimitive.LineChart
const XAxis = RechartsPrimitive.XAxis
const YAxis = RechartsPrimitive.YAxis
const CartesianGrid = RechartsPrimitive.CartesianGrid

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  Pie,
  PieChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
}
