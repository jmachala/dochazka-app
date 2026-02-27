'use server'

import { createClient } from '@/lib/supabase/server'

export async function getTeamStats() {
    const supabase = await createClient()

    // 1. Get all profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name')

    // 2. Get attendance for current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: attendance } = await supabase
        .from('attendance')
        .select('user_id, check_in, check_out')
        .gte('check_in', startOfMonth.toISOString())

    // 3. Get active approved absences for today
    const todayStr = new Date().toISOString().split('T')[0]
    const { data: activeAbsences } = await supabase
        .from('absences')
        .select('user_id, type')
        .eq('status', 'approved')
        .lte('start_date', todayStr)
        .gte('end_date', todayStr)

    // 4. Aggregate
    const stats = profiles?.map(profile => {
        const userRecords = attendance?.filter(r => r.user_id === profile.id) || []
        const isNowIn = userRecords.some(r => !r.check_out)
        const currentAbsence = activeAbsences?.find(a => a.user_id === profile.id)

        let totalMs = 0
        userRecords.forEach(r => {
            if (r.check_in && r.check_out) {
                totalMs += new Date(r.check_out).getTime() - new Date(r.check_in).getTime()
            }
        })

        const hours = Math.floor(totalMs / (1000 * 60 * 60))
        const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60))

        return {
            id: profile.id,
            name: profile.full_name,
            isNowIn,
            currentAbsence: currentAbsence?.type || null,
            hours,
            minutes
        }
    })

    return stats || []
}
