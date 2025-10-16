
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
import { Search } from 'lucide-react';
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LoggedOutHeader = () => {
    const pathname = usePathname();
    const navItems = [
        { href: '/', label: 'HOME' },
        { href: '/about', label: 'ABOUT US' },
        { href: '/campaign', label: 'OUR CAMPAIGN' },
    ];
    
    return (
        <header className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-24 items-center justify-between">
            <Logo />
            <nav className="hidden items-center space-x-8 md:flex">
                {navItems.map(item => (
                     <Link 
                        key={item.href}
                        href={item.href} 
                        className={cn(
                            "text-sm font-medium text-gray-500 hover:text-primary",
                            pathname === item.href && "border-b-2 border-primary text-primary font-semibold"
                        )}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className="flex items-center gap-4">
                <Search className="h-6 w-6 text-gray-500" />
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost">Login</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                    <Link href="/login/student">Student Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                    <Link href="/login/teacher">Teacher Login</Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="default">Sign Up</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                    <Link href="/signup/student">Student Sign Up</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                    <Link href="/signup/teacher">Teacher Sign Up</Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
            </div>
      </header>
    );
}

export function HomePageHeader() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const pathname = usePathname();
    
    if(isLoading) return null;

    const isAppPage = user && pathname.startsWith(`/${user.role}`);

    if (isAuthenticated && isAppPage) {
        return <AppHeader />
    }

    return <LoggedOutHeader />;
}
