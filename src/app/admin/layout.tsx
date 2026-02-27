import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { MobileNav } from '@/components/admin/mobile-nav'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/attendance')
    }

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <AdminSidebar profile={profile} />
            <div className="flex-1 flex flex-col min-h-screen relative">
                <header className="md:hidden sticky top-0 z-20 flex items-center justify-between border-b bg-white/80 p-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
                    <h1 className="text-lg font-bold text-primary">Admin Panel</h1>
                    <MobileNav profile={profile} />
                </header>
                {children}
            </div>
        </div>
    )
}
