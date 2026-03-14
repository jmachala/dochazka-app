'use server'

import { createClient } from '@/lib/supabase/server'

export async function getTeamStats() {
    const supabase = await createClient()

    // 1. Get all employees
    const { data: employees } = await supabase
        .from('employees')
        .select('id, full_name')
        .order('full_name')

    // 2. Get attendance for current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: attendance } = await supabase
        .from('attendance')
        .select('employee_id, check_in, check_out')
        .gte('check_in', startOfMonth.toISOString())

    // 3. Aggregate
    const stats = employees?.map(emp => {
        const userRecords = attendance?.filter(r => r.employee_id === emp.id) || []
        const isNowIn = userRecords.some(r => !r.check_out)

        let totalMs = 0
        userRecords.forEach(r => {
            if (r.check_in && r.check_out) {
                totalMs += new Date(r.check_out).getTime() - new Date(r.check_in).getTime()
            }
        })

        const hours = Math.floor(totalMs / (1000 * 60 * 60))
        const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60))

        return {
            id: emp.id,
            name: emp.full_name,
            isNowIn,
            hours,
            minutes
        }
    })

    return stats || []
}

export async function getEmployeeDetails(employeeId: string) {
    const supabase = await createClient()

    // 1. Employee Basic Info
    const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single()

    // 2. Recent Attendance (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: records } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('check_in', thirtyDaysAgo.toISOString())
        .order('check_in', { ascending: false })

    return {
        employee,
        records: records || []
    }
}


