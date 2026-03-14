'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UtensilsCrossed } from 'lucide-react'
import { type RestaurantMenu, getLunchMenus } from '@/app/actions/lunch'

export function LunchMenu() {
    const [menus, setMenus] = useState<RestaurantMenu[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const data = await getLunchMenus()
                setMenus(data)
            } catch (error) {
                console.error("Failed to load menus", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMenus()
        const interval = setInterval(fetchMenus, 3600000) // 1 hr
        return () => clearInterval(interval)
    }, [])

    if (isLoading) {
        return (
            <Card className="glass-card border-none h-full shadow-sm flex flex-col opacity-50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4" /> Denní menu
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex justify-center items-center">
                    <div className="animate-pulse w-full space-y-4">
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (menus.length === 0) {
        return null;
    }

    return (
        <Card className="glass-card border-none h-full shadow-sm flex flex-col max-h-[600px] overflow-hidden">
            <CardHeader className="pb-2 bg-gradient-to-b from-white/80 dark:from-zinc-900/80 to-transparent z-10 relative backdrop-blur-sm">
                <CardTitle className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-200 tracking-widest flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-orange-500" /> Denní menu - Uherský Brod
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pt-0 pb-6 pr-2 -mr-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
                <div className="space-y-6 animate-in fade-in duration-1000">
                    {menus.map((menu, idx) => (
                        <div key={idx} className="space-y-2">
                            <h3 className="text-sm font-bold text-primary border-b border-primary/20 pb-1 sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm z-10 py-1">
                                {menu.restaurantName}
                            </h3>
                            <ul className="space-y-2">
                                {menu.items.map((item, i) => (
                                    <li key={i} className={`flex justify-between items-start text-xs ${item.isSoup ? 'text-zinc-500 italic' : 'text-zinc-700 dark:text-zinc-300'} gap-2`}>
                                        <span className="flex-1 leading-snug">{item.name}</span>
                                        <span className="font-bold whitespace-nowrap">{item.price}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
