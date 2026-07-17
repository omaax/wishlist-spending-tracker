import Link from "next/link";
import { Gift, LayoutDashboard, BarChart3, Wallet, History } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <Gift className="h-16 w-16 text-primary mb-6" />
      <h1 className="text-4xl font-bold mb-3">Wishlist Tracker</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        Smart Wishlist &amp; Spending Tracker. All data stays on your device.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/dashboard">
          <Button size="lg">
            <LayoutDashboard className="h-5 w-5 mr-2" />
            Dashboard
          </Button>
        </Link>
        <Link href="/wishlist">
          <Button size="lg" variant="outline">
            <Gift className="h-5 w-5 mr-2" />
            Wishlist
          </Button>
        </Link>
        <Link href="/analytics">
          <Button size="lg" variant="outline">
            <BarChart3 className="h-5 w-5 mr-2" />
            Analytics
          </Button>
        </Link>
        <Link href="/budget">
          <Button size="lg" variant="outline">
            <Wallet className="h-5 w-5 mr-2" />
            Budget
          </Button>
        </Link>
        <Link href="/history">
          <Button size="lg" variant="outline">
            <History className="h-5 w-5 mr-2" />
            History
          </Button>
        </Link>
      </div>
    </div>
  );
}
