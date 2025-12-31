import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutGrid, 
    QrCode, 
    Users, 
    Building2, 
    ClipboardList, 
    History, 
    FileSpreadsheet,
    ScanLine 
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // Helper to check if user has a specific role
    const hasRole = (roleName: string) => {
        return user.roles?.some((role: any) => role.name === roleName) ?? false;
    };

    // Menu berdasarkan role - combine menus if user has multiple roles
    const getMenuItems = (): NavItem[] => {
        const menuItems: NavItem[] = [];

        // Admin menu
        if (hasRole('admin')) {
            menuItems.push(
                {
                    title: 'Dashboard',
                    href: route('admin.dashboard'),
                    icon: LayoutGrid,
                },
                {
                    title: 'Users',
                    href: route('admin.users.index'),
                    icon: Users,
                },
                {
                    title: 'Departments',
                    href: route('admin.departments.index'),
                    icon: Building2,
                },
                {
                    title: 'QR Display',
                    href: route('admin.qr-display'),
                    icon: QrCode,
                },
                {
                    title: 'Attendance',
                    href: route('admin.attendance.index'),
                    icon: ClipboardList,
                }
            );
        }

        // HR menu
        if (hasRole('hr')) {
            if (menuItems.length === 0) {
                menuItems.push({
                    title: 'Dashboard',
                    href: route('hr.dashboard'),
                    icon: LayoutGrid,
                });
            }
            menuItems.push(
                {
                    title: 'HR Attendance',
                    href: route('hr.attendance.index'),
                    icon: ClipboardList,
                },
                {
                    title: 'Recap',
                    href: route('hr.recap'),
                    icon: FileSpreadsheet,
                }
            );
        }

        // Employee menu
        if (hasRole('user')) {
            if (menuItems.length === 0) {
                menuItems.push({
                    title: 'Dashboard',
                    href: route('employee.dashboard'),
                    icon: LayoutGrid,
                });
            }
            menuItems.push(
                {
                    title: 'Scan QR',
                    href: route('employee.scan'),
                    icon: ScanLine,
                },
                {
                    title: 'History',
                    href: route('employee.history'),
                    icon: History,
                }
            );
        }

        return menuItems;
    };

    const mainNavItems = getMenuItems();
    
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('home')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
