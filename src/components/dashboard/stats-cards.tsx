import { StatsCard } from "./stats-card"
import { DollarSign, ShoppingBag, TrendingUp, FolderOpen, Wallet, BarChart3 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { ReactNode } from "react"

interface StatsCardsData {
  totalValue: number
  pendingItemsCount: number
  totalSpent: number
  purchasedItemsCount: number
  itemsCount: number
  categoriesCount: number
  monthlySpending: number
  budgetLabel: string
  mostExpensiveCategoryName: string
  mostExpensiveCategoryValue: number
  hasData: boolean
}

function StatsCards(data: StatsCardsData) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatsCard
        title="Total Wishlist Value"
        value={formatCurrency(data.totalValue)}
        description={`${data.pendingItemsCount} pending items`}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Total Money Spent"
        value={formatCurrency(data.totalSpent)}
        description={`${data.purchasedItemsCount} items purchased`}
        icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Average Item Price"
        value={data.itemsCount > 0 ? formatCurrency(data.totalValue / data.itemsCount) : "$0.00"}
        description={`Across ${data.itemsCount} items`}
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Categories"
        value={data.categoriesCount.toString()}
        description="Available categories"
        icon={<FolderOpen className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Monthly Spending"
        value={formatCurrency(data.monthlySpending)}
        description={data.budgetLabel}
        icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title={data.hasData ? data.mostExpensiveCategoryName : "Most Expensive"}
        value={data.hasData ? formatCurrency(data.mostExpensiveCategoryValue) : "-"}
        description={data.hasData ? "Category total" : "No items yet"}
        icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  )
}

export { StatsCards }
export type { StatsCardsData }
