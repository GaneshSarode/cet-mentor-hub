const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-23rd-april-morning-shift/mf3ico3c', { waitUntil: 'load' });
  
  // Wait a moment for rendering
  await new Promise(r => setTimeout(r, 2000));
  
  // Dump the entire body HTML to inspect it
  const html = await page.evaluate(() => {
     // Let's grab the content area, skipping headers
     const main = document.querySelector('main') || document.body;
     return main.innerHTML;
  });
  
  fs.writeFileSync('dom_dump.html', html);
  console.log('Saved dom_dump.html');
  await browser.close();
})();
