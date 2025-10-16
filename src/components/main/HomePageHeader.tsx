
"use client";

import { useAuth } from "@/hooks/use-auth";
import AppHeader from "./Header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button";
import Link from "next/link";
import Logo from "../Logo";

const LoggedOutHeader = () => (
    <header className="container mx-auto flex items-center justify-between py-4">
      <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-foreground">
        <Logo />
      </Link>
      <nav className="hidden items-center gap-6 md:flex">
        <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Pricing</Link>
        <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">FAQ</Link>
        <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Contact us</Link>
      </nav>
      <div className="flex items-center gap-2">
          <Button variant="default" className="rounded-full" asChild>
              <Link href="/login/student">Sign in</Link>
          </Button>
      </div>
    </header>
  );

export function HomePageHeader() {
    const { isAuthenticated, isLoading } = useAuth();
    
    if(isLoading) return null;

    if (isAuthenticated) {
        return <AppHeader />
    }

    return <LoggedOutHeader />;
}
