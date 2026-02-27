'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function requestAbsence(type: string, startDate: string, endDate: string, note?: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('absences')
        .insert({
            user_id: user.id,
            type,
            start_date: startDate,
            end_date: endDate,
            note,
            status: 'pending'
        })

    if (error) {
        console.error('Error requesting absence:', error)
        throw new Error(`Chyba databáze: ${error.message}`)
    }

    revalidatePath('/attendance')
}

export async function updateAbsenceStatus(id: string, status: 'approved' | 'rejected') {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Role check is handled by RLS, but we can be explicit
    const { error } = await supabase
        .from('absences')
        .update({ status })
        .eq('id', id)

    if (error) {
        console.error('Error updating absence status:', error)
        throw new Error('Failed to update absence status')
    }

    revalidatePath('/admin')
}

export async function deleteAbsence(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('absences')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting absence:', error)
        throw new Error('Failed to delete absence')
    }

    revalidatePath('/admin')
    revalidatePath('/attendance')
}
