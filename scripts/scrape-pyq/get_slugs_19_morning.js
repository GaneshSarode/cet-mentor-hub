const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function getSlugs() {
  const url = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-19th-april-morning-shift';
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  
  const subjects = {
    Physics: [],
    Chemistry: [],
    Mathematics: []
  };

  const shiftPath = '/past-years/year-wise/jee/mht-cet/mht-cet-2025-19th-april-morning-shift/';

  // Find subject headings
  $('h1, h2, h3, h4').each((i, el) => {
    const text = $(el).text().trim();
    let subj = '';
    if (text.includes('Physics')) subj = 'Physics';
    else if (text.includes('Chemistry')) subj = 'Chemistry';
    else if (text.includes('Mathematics')) subj = 'Mathematics';
    
    if (subj) {
      // Typically, questions are inside a container that is a sibling or parent sibling.
      let nextEl = $(el).next();
      while (nextEl.length > 0) {
        if (nextEl.is('h1, h2, h3, h4')) break; // Next subject heading
        
        nextEl.find('a').each((j, aEl) => {
          const href = $(aEl).attr('href');
          if (href && href.includes(shiftPath) && href !== shiftPath) {
             const slug = href.split('/').pop();
             if (slug && !subjects[subj].includes(slug)) {
               subjects[subj].push(slug);
             }
          }
        });
        
        nextEl = nextEl.next();
      }
    }
  });

  console.log("Found physics:", subjects.Physics.length);
  console.log("Found chemistry:", subjects.Chemistry.length);
  console.log("Found maths:", subjects.Mathematics.length);

  fs.writeFileSync('slugs_19_morning.json', JSON.stringify(subjects, null, 2));
}
getSlugs();
