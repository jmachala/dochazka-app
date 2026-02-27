'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function ensureAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') throw new Error('Unauthorized')
}

export async function adminCreateRecord(data: {
    user_id: string
    check_in: string
    check_out?: string
    notes?: string
}) {
    await ensureAdmin()
    const supabase = await createClient()

    const { error } = await supabase.from('attendance').insert({
        ...data,
        status: 'present'
    })

    if (error) throw error
    revalidatePath('/admin')
    revalidatePath('/admin/records')
}

export async function adminUpdateRecord(id: string, data: {
    check_in?: string
    check_out?: string
    notes?: string
}) {
    await ensureAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('attendance')
        .update(data)
        .eq('id', id)

    if (error) throw error
    revalidatePath('/admin')
    revalidatePath('/admin/records')
}

export async function adminDeleteRecord(id: string) {
    await ensureAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id)

    if (error) throw error
    revalidatePath('/admin')
    revalidatePath('/admin/records')
}
