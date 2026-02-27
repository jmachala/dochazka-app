'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateProfileRole(id: string, role: 'admin' | 'employee') {
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

    const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id)

    if (error) {
        console.error('Error updating role:', error)
        throw new Error('Failed to update role')
    }

    revalidatePath('/admin/employees')
}

export async function deleteProfile(id: string) {
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

    // Delete profile (cascades to attendance and absences)
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting profile:', error)
        throw new Error('Failed to delete profile')
    }

    revalidatePath('/admin/employees')
}

export async function createEmployee(email: string, fullName: string, role: 'admin' | 'employee' = 'employee') {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Auth check (Admins only)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: adminCheck } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (adminCheck?.role !== 'admin') throw new Error('Unauthorized')

    // 1. Create user in Supabase Auth
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password: 'Password123!', // Temporary password
        email_confirm: true,
        user_metadata: { full_name: fullName }
    })

    if (authError) {
        console.error('Error creating auth user:', authError)
        throw new Error(authError.message)
    }

    // 2. Update profile (profile is created by trigger, but we ensure role and name)
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            role: role
        })
        .eq('id', authUser.user.id)

    if (profileError) {
        console.error('Error updating profile:', profileError)
        // Profile might not be created yet by trigger, so we try insert if update fails to find row
        await supabase.from('profiles').insert({
            id: authUser.user.id,
            full_name: fullName,
            role: role
        })
    }

    revalidatePath('/admin/employees')
    return { success: true }
}
