const axios = require('axios');
const cheerio = require('cheerio');

async function getSlugs() {
  const url = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-23rd-april-evening-shift';
  console.log('Fetching', url);
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  
  const subjects = {
    Physics: [],
    Chemistry: [],
    Mathematics: []
  };

  let currentSubject = '';
  
  // The structure usually has <h3>Subject Name</h3> followed by .question-component or similar
  // Let's just find all links to questions. But wait, ExamSIDE pagination or lazy loading might be an issue?
  // Last time they were all on one page for a shift, grouped under subjects. Let's see all links containing the shift path.
  const shiftPath = '/past-years/year-wise/jee/mht-cet/mht-cet-2025-23rd-april-evening-shift/';
  
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.includes(shiftPath) && href !== shiftPath) {
       const slug = href.split('/').pop();
       // we don't know the subject just from the URL usually, so let's try to parse the page structure
    }
  });

  // A safer way if structured:
  $('.py-4').each((i, container) => {
      const heading = $(container).find('h2, h3').text().trim();
      let subj = '';
      if (heading.includes('Physics')) subj = 'Physics';
      else if (heading.includes('Chemistry')) subj = 'Chemistry';
      else if (heading.includes('Mathematics')) subj = 'Mathematics';
      
      if (subj) {
          $(container).find('.question-component-url, a[href*="mf3"]').each((j, el) => {
             const href = $(el).attr('href');
             if (href && href.length > 5) {
                const slug = href.split('/').pop();
                if(slug && !subjects[subj].includes(slug)) {
                   subjects[subj].push(slug);
                }
             }
          });
      }
  });

  console.log("Found physics:", subjects.Physics.length);
  console.log("Found chemistry:", subjects.Chemistry.length);
  console.log("Found maths:", subjects.Mathematics.length);
  
  if(subjects.Physics.length === 0 && subjects.Mathematics.length === 0) {
      // fallback if they aren't grouped perfectly in .py-4
      console.log('Fallback parsing...');
      const allLinks = $('a');
      let linksList = [];
      allLinks.each((i, el) => {
         const href = $(el).attr('href');
         if(href && href.includes('mht-cet-2025-23rd-april-evening-shift/')) {
            const slug = href.split('/').pop();
            if(slug && !linksList.includes(slug) && slug.length > 0) {
               linksList.push(slug);
            }
         }
      });
      console.log(`Fallback found ${linksList.length} links. But we need subjects categorized.`);
  }

  require('fs').writeFileSync('slugs_evening.json', JSON.stringify(subjects, null, 2));
  console.log('Wrote slugs_evening.json');
}

getSlugs();
