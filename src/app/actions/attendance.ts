'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function checkIn(note?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Validation: Check if user is already checked in
    const { data: activeRecord } = await supabase
        .from('attendance')
        .select('id')
        .eq('user_id', user.id)
        .is('check_out', null)
        .single()

    if (activeRecord) {
        throw new Error('Již jste přihlášeni v práci.')
    }

    const { error } = await supabase.from('attendance').insert({
        user_id: user.id,
        check_in: new Date().toISOString(),
        status: 'present',
        notes: note || null
    })

    if (error) throw error

    revalidatePath('/attendance')
}

export async function checkOut(id: string, note?: string) {
    const supabase = await createClient()

    // Validation: Ensure the record exists and isn't already checked out
    const { data: record } = await supabase
        .from('attendance')
        .select('check_in, check_out, notes')
        .eq('id', id)
        .single()

    if (!record) throw new Error('Záznam nenalezen.')
    if (record.check_out) throw new Error('Již jste se odhlásili.')

    const { error } = await supabase
        .from('attendance')
        .update({
            check_out: new Date().toISOString(),
            notes: note || record.notes // Preserve check-in note if no new note
        })
        .eq('id', id)

    if (error) throw error

    revalidatePath('/attendance')
}
