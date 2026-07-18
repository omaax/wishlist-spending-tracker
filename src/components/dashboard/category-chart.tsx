"use client";

import {
  Pie,
  PieChart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

interface CategoryChartProps {
  data: { name: string; value: number; color: string; fill: string }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data available
      </div>
    );
  }

  const config = Object.fromEntries(
    data.map((d) => [d.name, { label: d.name, color: d.color }])
  );

  return (
    <ChartContainer config={config} className="mx-auto aspect-square max-h-[300px]">
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent formatter={(v) => formatCurrency(v)} />}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        />
        <ChartLegend
          content={<ChartLegendContent />}
        />
      </PieChart>
    </ChartContainer>
  );
}
