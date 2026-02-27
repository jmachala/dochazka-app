'use client'

import { Button } from '@/components/ui/button'
import { Calendar, Users, Clock, UserCircle, LogOut, Menu, History as HistoryIcon, Palmtree, Settings } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface MobileNavProps {
    profile: any
}

export function MobileNav({ profile }: MobileNavProps) {
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
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 border-r dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex flex-col h-full p-6">
                        <SheetHeader className="mb-10 text-left">
                            <SheetTitle className="text-xl font-bold text-primary">Admin Panel</SheetTitle>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Docházkový Systém</p>
                        </SheetHeader>

                        <nav className="space-y-4 flex-grow">
                            {navItems.map((item) => (
                                <Button
                                    key={item.href}
                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                    className={`w-full justify-start ${pathname === item.href ? "bg-primary/10 text-primary" : "text-zinc-600 dark:text-zinc-400"}`}
                                    asChild
                                >
                                    <Link href={item.href}>
                                        <item.icon className="mr-3 h-5 w-5" />
                                        {item.label}
                                    </Link>
                                </Button>
                            ))}
                            <div className="pt-4 mt-4 border-t dark:border-zinc-800">
                                <Button variant="ghost" className="w-full justify-start text-primary hover:text-primary hover:bg-primary/5" asChild>
                                    <Link href="/attendance">
                                        <UserCircle className="mr-3 h-5 w-5" />
                                        Moje docházka
                                    </Link>
                                </Button>
                            </div>
                        </nav>

                        <div className="mt-auto pt-6 border-t dark:border-zinc-800">
                            <div className="flex items-center gap-3 mb-4 px-2">
                                <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-700">
                                    {profile?.full_name?.charAt(0)}
                                </div>
                                <div className="text-sm font-medium truncate">{profile?.full_name}</div>
                            </div>
                            <form action="/auth/signout" method="post">
                                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" size="sm">
                                    <LogOut className="mr-3 h-5 w-5" />
                                    Odhlásit se
                                </Button>
                            </form>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
