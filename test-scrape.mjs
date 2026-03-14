import * as cheerio from 'cheerio';
import fs from 'fs';

async function test() {
    const html = fs.readFileSync('menicka.html', 'utf8');
    const $ = cheerio.load(html);
    
    const results = [];
    $('.menicka_detail').each((i, el) => {
        const name = $(el).find('.hlavicka .nazev').text().trim();
        if (!name) return;
        
        const items = [];
        $(el).find('.menicka > div').each((j, div) => {
            const className = $(div).attr('class') || '';
            if (className.includes('nabidka')) {
                const text = $(div).text().trim();
                const price = $(div).next('.cena').text().trim();
                
                // If it has a preceding 'poradi' div, it's usually a main dish
                const isSoup = $(div).prev('div[class^="poradi"]').length === 0;
                
                if (text && !text.includes('Nebylo zadáno')) {
                    items.push({ text: text.replace(/\s+/g, ' '), price, isSoup });
                }
            }
        });
        
        if (items.length > 0) {
            results.push({ name, items });
        }
    });
    console.log(JSON.stringify(results, null, 2));
}

test();
