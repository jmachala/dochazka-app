'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function deleteEmployee(id: string) {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: adminCheck } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (adminCheck?.role !== 'admin') throw new Error('Unauthorized')

    // Delete employee (cascades to attendance)
    const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting employee:', error)
        throw new Error('Failed to delete employee')
    }

    revalidatePath('/admin/employees')
}

export async function createEmployee(fullName: string) {
    const supabase = await createClient()

    // Auth check (Admins only)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: adminCheck } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (adminCheck?.role !== 'admin') throw new Error('Unauthorized')

    // Create simple employee record
    const { error } = await supabase
        .from('employees')
        .insert({
            full_name: fullName
        })

    if (error) {
        console.error('Error creating employee:', error)
        throw new Error(error.message)
    }

    revalidatePath('/admin/employees')
    return { success: true }
}

