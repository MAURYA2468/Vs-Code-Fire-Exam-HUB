"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, User as UserIcon, LayoutDashboard, FileText, BarChart, BookCopy } from "lucide-react";
import Logo from "../Logo";
import Link from "next/link";
import { ThemeToggle } from "../ThemeToggle";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const teacherNavItems = [
  { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher/tests', label: 'All Tests', icon: FileText },
  { href: '/teacher/reports', label: 'Reports', icon: BookCopy },
];

const studentNavItems = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/results', label: 'My Results', icon: BarChart },
];


export default function AppHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const navItems = user?.role === 'teacher' ? teacherNavItems : studentNavItems;

  const isLinkActive = (href: string) => {
    if (href === '/teacher/tests') {
      return pathname.startsWith('/teacher/tests');
    }
     if (href === '/teacher/reports') {
      return pathname.startsWith('/teacher/reports');
    }
    return pathname === href;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
            <Logo />
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => (
              <Button 
                key={item.href}
                asChild 
                variant="ghost"
                className={cn("text-muted-foreground hover:text-foreground", isLinkActive(item.href) && "text-foreground")}
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://picsum.photos/seed/${user?.id}/150/150`} alt={user?.name || "User Avatar"} />
                <AvatarFallback>{user?.name ? getInitials(user.name) : <UserIcon />}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                {user?.role === 'student' && user.registerNumber && (
                  <p className="text-xs leading-none text-muted-foreground pt-1">
                    Reg No: {user.registerNumber}
                  </p>
                )}
                 {user?.role === 'teacher' && user.teacherId && (
                  <p className="text-xs leading-none text-muted-foreground pt-1">
                    ID: {user.teacherId}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Mobile Nav */}
            <div className="md:hidden">
              {navItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
              ))}
               <DropdownMenuSeparator />
            </div>
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}