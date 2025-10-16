
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
import { GraduationCap } from "lucide-react";

const LoggedOutHeader = () => (
    <header className="container mx-auto flex items-center justify-between py-4">
      <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-foreground">
        <div className="rounded-lg bg-primary p-2">
          <GraduationCap className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="font-headline">Exam Hub</span>
      </Link>
      <nav className="hidden items-center gap-6 md:flex">
        <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Home</Link>
        <Link href="/student/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Student Dashboard</Link>
        <Link href="/teacher/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Teacher Dashboard</Link>
      </nav>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">Sign In</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href="/login/student">Student</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/login/teacher">Teacher</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Sign Up</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href="/signup/student">Student</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/signup/teacher">Teacher</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
