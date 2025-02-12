import { CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card"
import { AnimatedCard } from "./animated-card"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"

export function KPICards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi, index) => (
        <AnimatedCard key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            {kpi.increase ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground">
              {kpi.increase ? "+" : "-"}
              {kpi.change} from last month
            </p>
          </CardContent>
        </AnimatedCard>
      ))}
    </div>
  )
}

