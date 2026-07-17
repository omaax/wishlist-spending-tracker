"use client";

import Link from "next/link";
import { Gift, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { Sidebar } from "./sidebar";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <Sheet>
          <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-lg hover:bg-muted size-8 [&_svg]:size-4">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Gift className="h-5 w-5 text-primary" />
          <span>Wishlist Tracker</span>
        </Link>
        <div className="flex-1" />
        <ThemeToggle />
      </div>
    </header>
  );
}
