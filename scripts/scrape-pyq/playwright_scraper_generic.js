const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [,, slugsFile, outputFile, baseUrl] = process.argv;
if (!slugsFile || !outputFile || !baseUrl) {
  console.error("Usage: node playwright_scraper_generic.js <slugsFile> <outputFile> <baseUrl>");
  process.exit(1);
}

const subjectsSlugs = JSON.parse(fs.readFileSync(slugsFile, 'utf-8'));

async function getHTML(page, selector) {
  try {
    await page.waitForSelector(selector, { timeout: 3000 });
    return await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      // MUST NOT STRIP MML
      return el.innerHTML;
    }, selector);
  } catch (e) {
    return null;
  }
}

async function extractQuestions(page, slugs, subject) {
  const data = [];
  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const url = baseUrl + slug;
    console.log(`[${subject}] ${i + 1}/${slugs.length}: ${url}`);

    let success = false;
    for (let attempts = 0; attempts < 3 && !success; attempts++) {
      try {
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        await page.waitForTimeout(2000);
        success = true;
      } catch (e) {
        console.log(`Failed (attempt ${attempts+1}): ${e.message}`);
        await page.waitForTimeout(5000);
      }
    }
    
    if (!success) {
      console.log(`Failed completely: ${url}`);
      continue;
    }

    const questionHtml = await page.evaluate(() => {
      const el = document.querySelector('.question-component .question') || document.querySelector('.question');
      return el ? el.innerHTML : null;
    });

    const optionsObj = { A: '', B: '', C: '', D: '' };
    let correct = 'A';

    await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const b of btns) {
        if (b.textContent.includes('Check Answer')) b.click();
      }
    });
    await page.waitForTimeout(1000);

    const { opts, corr } = await page.evaluate(() => {
      const options = { A: '', B: '', C: '', D: '' };
      let correctLetter = 'A';
      const nodes = document.querySelectorAll('.question-component div[role="button"]');
      nodes.forEach(node => {
        const badge = node.querySelector('.option-badge') || node.querySelector('div');
        if (badge) {
          const label = badge.textContent.trim();
          if (['A', 'B', 'C', 'D'].includes(label)) {
            const contentDiv = node.querySelector('.option-content') || node.children[node.children.length - 1];
            options[label] = contentDiv ? contentDiv.innerHTML : '';
            if (node.innerHTML.includes('tag-correct') || node.innerHTML.includes('Correct Answer') || node.innerHTML.includes('green')) {
              correctLetter = label;
            }
          }
        }
      });
      return { opts: options, corr: correctLetter };
    });

    const solutionHtml = await getHTML(page, '.solution') || await getHTML(page, '.explanation');

    data.push({
      slug,
      subject,
      question: questionHtml,
      options: opts,
      correct: corr,
      solution: solutionHtml
    });
  }
  return data;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  const allData = {};
  
  for (const subject of ['Physics', 'Chemistry', 'Mathematics']) {
    const slugs = subjectsSlugs[subject];
    if (slugs && slugs.length > 0) {
      console.log(`\nStarting ${subject}... (${slugs.length} questions)`);
      const page = await context.newPage();
      await page.route('**/*', (route) => {
        const type = route.request().resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
          route.abort();
        } else {
          route.continue();
        }
      });
      const subjectData = await extractQuestions(page, slugs, subject);
      allData[subject] = subjectData;
      await page.close();
    }
  }

  await browser.close();

  fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
  console.log(`\nDone! Saved to ${outputFile}`);
})();
