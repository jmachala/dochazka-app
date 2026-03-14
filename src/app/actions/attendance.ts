'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function checkIn(note?: string, employeeId?: string) {
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) throw new Error('Not authenticated')

    if (!employeeId) throw new Error('Employee ID is required')

    // Validation: Check if employee is already checked in
    const { data: activeRecord } = await supabase
        .from('attendance')
        .select('id')
        .eq('employee_id', employeeId)
        .is('check_out', null)
        .single()

    if (activeRecord) {
        throw new Error('Již je přihlášen(a).')
    }

    const { error } = await supabase.from('attendance').insert({
        employee_id: employeeId,
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
        .select('id, check_in, check_out, notes')
        .eq('id', id)
        .single()

    if (!record) throw new Error('Záznam nenalezen.')
    if (record.check_out) throw new Error('Již je odhlášen(a).')

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

export async function toggleAttendance(employeeId: string) {
    const supabase = await createClient()

    // Check for active record
    const { data: activeRecord } = await supabase
        .from('attendance')
        .select('id')
        .eq('employee_id', employeeId)
        .is('check_out', null)
        .single()

    if (activeRecord) {
        await checkOut(activeRecord.id)
    } else {
        await checkIn(undefined, employeeId)
    }
}


