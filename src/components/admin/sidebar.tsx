'use client'

import { Button } from '@/components/ui/button'
import { Users, Calendar, Clock, UserCircle, LogOut, History as HistoryIcon, Palmtree, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
    profile: any
}

export function AdminSidebar({ profile }: SidebarProps) {
    const pathname = usePathname()

    const navItems = [
        { href: '/admin', icon: Calendar, label: 'Přehled' },
        { href: '/admin/employees', icon: Users, label: 'Zaměstnanci' },
        { href: '/admin/records', icon: Clock, label: 'Všechny záznamy' },
        { href: '/admin/reports', icon: HistoryIcon, label: 'Měsíční přehled' },
        { href: '/admin/absences', icon: Palmtree, label: 'Absence' },
        { href: '/settings', icon: Settings, label: 'Nastavení' },
    ]

    return (
        <aside className="w-64 border-r bg-zinc-50/50 dark:bg-zinc-950/50 p-6 hidden md:block shrink-0 h-screen sticky top-0 backdrop-blur-md">
            <div className="flex flex-col h-full">
                <div className="mb-10 px-2">
                    <h2 className="text-xl font-black text-gradient uppercase tracking-tight">Admin Console</h2>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">Attendance Pro</p>
                </div>

                <nav className="space-y-2 flex-grow">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Button
                                key={item.href}
                                variant={isActive ? "secondary" : "ghost"}
                                className={`w-full justify-start rounded-xl font-bold transition-all ${isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-zinc-500 hover:bg-primary/10 hover:text-primary"}`}
                                asChild
                            >
                                <Link href={item.href}>
                                    <item.icon className={`mr-3 h-4 w-4 ${isActive ? "text-primary-foreground" : ""}`} />
                                    {item.label}
                                </Link>
                            </Button>
                        )
                    })}

                    <div className="pt-4 mt-4 border-t dark:border-zinc-800">
                        <Button variant="ghost" className="w-full justify-start text-primary hover:text-primary hover:bg-primary/5" asChild>
                            <Link href="/attendance">
                                <UserCircle className="mr-2 h-4 w-4" />
                                Moje docházka
                            </Link>
                        </Button>
                    </div>
                </nav>

                <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-sm font-black text-primary border border-primary/20 shadow-inner">
                            {profile?.full_name?.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="text-sm font-bold truncate text-zinc-900 dark:text-zinc-100">{profile?.full_name}</div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Super Admin</div>
                        </div>
                    </div>
                    <form action="/auth/signout" method="post">
                        <Button variant="outline" className="w-full justify-start border-red-500/20 text-red-600 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all rounded-xl shadow-sm" size="sm" type="submit">
                            <LogOut className="mr-3 h-4 w-4" />
                            Odhlásit se
                        </Button>
                    </form>
                </div>
            </div>
        </aside>
    )
}
