const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-23rd-april-morning-shift/mf3ic11u', { waitUntil: 'load' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const logs = await page.evaluate(async () => {
     const btns = Array.from(document.querySelectorAll('button'));
     const texts = btns.map(b => b.textContent.trim());
     
     let clicked = false;
     for(const btn of btns) {
         if(btn.textContent.includes('Check Answer') || btn.textContent.includes('View Solution') || btn.textContent.includes('Show Solution')) {
             btn.click();
             clicked = true;
         }
     }
     if (clicked) {
         await new Promise(r => setTimeout(r, 3000));
     }
     
     return texts;
  });
  console.log("Found buttons:", logs);
  
  const html = await page.evaluate(() => {
     const main = document.querySelector('main') || document.body;
     return main.innerHTML;
  });
  
  fs.writeFileSync('dom_dump.html', html);
  console.log('Saved dom_dump.html');
  await browser.close();
})();
