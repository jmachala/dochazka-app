import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface PrintReportProps {
    employee: any
    records: any[]
}

export function PrintReport({ employee, records }: PrintReportProps) {
    const totalMs = records.reduce((acc, r) => {
        if (r.check_in && r.check_out) {
            return acc + (new Date(r.check_out).getTime() - new Date(r.check_in).getTime())
        }
        return acc
    }, 0)

    const h = Math.floor(totalMs / (1000 * 60 * 60))
    const m = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60))

    return (
        <div className="hidden print:block p-8 bg-white text-black min-h-screen">
            <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
                <div>
                    <h1 className="text-2xl font-bold">Měsíční výkaz docházky</h1>
                    <p className="text-lg">{employee.full_name}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold">Období: {format(new Date(), 'MMMM yyyy', { locale: cs })}</p>
                    <p>Datum tisku: {format(new Date(), 'd. M. yyyy')}</p>
                </div>
            </div>

            <table className="w-full border-collapse border border-black mb-8">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-2 text-left">Datum</th>
                        <th className="border border-black p-2 text-left">Příchod</th>
                        <th className="border border-black p-2 text-left">Odchod</th>
                        <th className="border border-black p-2 text-right">Odpracováno</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((r, i) => (
                        <tr key={i}>
                            <td className="border border-black p-2">{format(new Date(r.check_in), 'dd. MM. yyyy')}</td>
                            <td className="border border-black p-2">{format(new Date(r.check_in), 'HH:mm')}</td>
                            <td className="border border-black p-2">{r.check_out ? format(new Date(r.check_out), 'HH:mm') : '-'}</td>
                            <td className="border border-black p-2 text-right">
                                {r.check_out ? (() => {
                                    const d = new Date(r.check_out).getTime() - new Date(r.check_in).getTime()
                                    const hh = Math.floor(d / (1000 * 60 * 60))
                                    const mm = Math.floor((d % (1000 * 60 * 60)) / (1000 * 60))
                                    return `${hh}h ${mm}m`
                                })() : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="font-bold bg-gray-100">
                        <td colSpan={3} className="border border-black p-2 text-right uppercase">Celkem</td>
                        <td className="border border-black p-2 text-right">{h}h {m}m</td>
                    </tr>
                </tfoot>
            </table>

            <div className="flex justify-between mt-16 mt-32">
                <div className="w-48 border-t border-black pt-2 text-center text-sm">
                    Podpis zaměstnance
                </div>
                <div className="w-48 border-t border-black pt-2 text-center text-sm">
                    Podpis nadřízeného
                </div>
            </div>
        </div>
    )
}
