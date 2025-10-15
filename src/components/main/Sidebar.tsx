"use client";

import React from 'react';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '../ui/sidebar';
import Logo from '../Logo';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, BarChart, LogOut, FileText } from 'lucide-react';
import { Button } from '../ui/button';

const teacherNavItems = [
  { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher/tests', label: 'Tests', icon: FileText },
];

const studentNavItems = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/results', label: 'My Results', icon: BarChart },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const navItems = user?.role === 'teacher' ? teacherNavItems : studentNavItems;

  const isLinkActive = (href: string) => {
    if (href === '/teacher/tests') {
      return pathname.startsWith('/teacher/tests');
    }
    return pathname === href;
  }

  return (
    <>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isLinkActive(item.href)}
                className="w-full"
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="ghost" onClick={logout} className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
        </Button>
      </SidebarFooter>
    </>
  );
}
