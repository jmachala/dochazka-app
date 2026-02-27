'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePassword(newPassword: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
        password: newPassword
    })

    if (error) {
        console.error('Error updating password:', error)
        throw new Error(error.message)
    }

    return { success: true }
}

export async function updateProfileName(fullName: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile name:', error)
        throw new Error(error.message)
    }

    revalidatePath('/attendance')
    revalidatePath('/admin')

    return { success: true }
}
