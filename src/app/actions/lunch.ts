'use server'

import * as cheerio from 'cheerio'
import iconv from 'iconv-lite'

export interface MenuItem {
    name: string;
    price: string;
    isSoup: boolean;
}

export interface RestaurantMenu {
    restaurantName: string;
    phone?: string;
    items: MenuItem[];
}

export async function getLunchMenus(): Promise<RestaurantMenu[]> {
    try {
        const response = await fetch('https://www.menicka.cz/uhersky-brod.html', {
            // Revalidate every 30 minutes for fresher data
            next: { revalidate: 1800 }
        })
        
        if (!response.ok) {
            throw new Error('Failed to fetch lunch menus')
        }

        const buffer = await response.arrayBuffer()
        const html = iconv.decode(Buffer.from(buffer), 'win1250')
        const $ = cheerio.load(html)
        const menus: RestaurantMenu[] = []

        $('.menicka_detail').each((i, el) => {
            const restaurantName = $(el).find('.hlavicka .nazev').text().trim()
            if (!restaurantName) return

            let phone = ''
            
            // Try to find phone number in the description/info divs
            $(el).find('.menicka .gray .doplnujici_info').each((k, info) => {
                const text = $(info).text()
                const phoneMatch = text.match(/(?:tel\.|čísle:|tel:)\s*([\d\s]{9,15})/i)
                if (phoneMatch && !phone) {
                    phone = phoneMatch[1].trim()
                }
            })

            const items: MenuItem[] = []
            
            $(el).find('.menicka > div').each((j, div) => {
                const className = $(div).attr('class') || ''
                if (className.includes('nabidka')) {
                    const text = $(div).text().trim()
                    const price = $(div).next('.cena').text().trim()
                    
                    // If it has no preceding 'poradi' div, it's usually a soup
                    const isSoup = $(div).prev('div[class^="poradi"]').length === 0
                    
                    if (text && !text.includes('Nebylo zadáno') && !text.includes('Restaurace má tento den zavřeno')) {
                        items.push({
                            name: text.replace(/\s+/g, ' '),
                            price: price || '',
                            isSoup
                        })
                    }
                }
            })

            // Only add if there are items for today
            if (items.length > 0) {
                menus.push({ restaurantName, phone, items })
            }
        })

        return menus
    } catch (error) {
        console.error('Error fetching lunch menus:', error)
        return []
    }
}
