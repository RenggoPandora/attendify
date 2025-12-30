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

    // Menu berdasarkan role
    const getMenuItems = (): NavItem[] => {
        if (user.role?.name === 'admin') {
            return [
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
                    title: 'QR Sessions',
                    href: route('admin.qr-sessions.index'),
                    icon: QrCode,
                },
                {
                    title: 'Attendance',
                    href: route('hr.dashboard'),
                    icon: ClipboardList,
                },
            ];
        } else if (user.role?.name === 'hr') {
            return [
                {
                    title: 'Dashboard',
                    href: route('hr.dashboard'),
                    icon: LayoutGrid,
                },
                {
                    title: 'Attendance',
                    href: route('hr.attendance.index'),
                    icon: ClipboardList,
                },
                {
                    title: 'Recap',
                    href: route('hr.recap'),
                    icon: FileSpreadsheet,
                },
            ];
        } else {
            // Employee menu
            return [
                {
                    title: 'Dashboard',
                    href: route('employee.dashboard'),
                    icon: LayoutGrid,
                },
                {
                    title: 'Scan QR',
                    href: route('employee.scan'),
                    icon: ScanLine,
                },
                {
                    title: 'History',
                    href: route('employee.history'),
                    icon: History,
                },
            ];
        }
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
