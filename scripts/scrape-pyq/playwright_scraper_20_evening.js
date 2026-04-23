const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "meujd8hj", "meujdy95", "meujd7we", "meuje4ar", "meujcypy",
    "meujd1e0", "meuje4u0", "meujdi8g", "meuje27k", "meujd9d8",
    "meuje4d6", "meujdeca", "meuje57w", "meuje3zi", "meujd1o8",
    "meujdt6w", "meujdx2a", "meujd9fl", "meujdl0q", "meujdhma",
    "meujcyt0", "meujdx53", "meujdt9h", "meujcyvz", "meujdtbt",
    "meujdi0y", "meujd14e", "meujdbo8", "meuje5d6", "meuje4fv",
    "meujd8kc", "meujdagj", "meujdiba", "meujd1qp", "meujdted",
    "meujdbrx", "meujdwcx", "meujduva", "meuje6y0", "meuje5am",
    "meujd1tc", "meujddx1", "meujde57", "meuje4rc", "meujdl36",
    "meuje4zf", "meujdy65", "meujd6wb", "meujd170", "meujd7yt"
  ],
  "Chemistry": [
    "meujdx7k", "meuje4wv", "meujd810", "meuje4i5", "meujd1gj",
    "meujdbvc", "meujcydq", "meujdx9w", "meujdbyl", "meujd83f",
    "meujdaps", "meujd5hw", "meujd922", "meujdaud", "meujdxcv",
    "meujcygu", "meujde84", "meujd5l3", "meujdvwh", "meujcyyq",
    "meujdat3", "meujdayy", "meujdeam", "meuje42q", "meujdhp0",
    "meujdhrq", "meujd862", "meujdb3y", "meujdup8", "meujddzx",
    "meujd8qi", "meujduse", "meuje527", "meujde21", "meujdvz7",
    "meujdbci", "meujdxfn", "meujdkpp", "meuje45g", "meujd1k8",
    "meujdzkq", "meujcztv", "meujdl5l", "meujdym3", "meujde4i",
    "meujdecx", "meujd3j1", "meujddtw", "meuje1cy", "meujdl89"
  ],
  "Mathematics": [
    "meujdt48", "meujdhub", "meujdlb7", "meuje01t", "meuje3q6",
    "meujd1nb", "meujd1q9", "meujdhx7", "meujdhzr", "meujdsyu",
    "meuje480", "meujdefc", "meujd8w6", "meujdt1b", "meujde72",
    "meujd7qe", "meujdksf", "meujd8ta", "meujdkv9", "meujd19u",
    "meujdky0", "meujd18n", "meujd1c5", "meujd1ep", "meujde2g",
    "meujd0vp", "meujd3m2", "meuje54w", "meujdi2p", "meujd94q",
    "meujd7tf", "meujdc2j", "meujd1bb", "meujd1hl", "meujd0yn",
    "meujd88m", "meuje4kh", "meujd8z4", "meujd1l5", "meujdi5o",
    "meujde9x", "meujd97j", "meuje6uz", "meuje4np", "meujdbh5",
    "meujd9ah", "meujd8bx", "meujd8eu", "meujdeig", "meujd11j"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-20th-april-evening-shift/';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeQuestion(page, url, subject) {
  await page.goto(url, { waitUntil: 'load' });
  await delay(1000); // Give MathJax a moment to load
  
  // Click "Check Answer" to reveal correct option and explanation
  try {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('Check Answer')) {
        await btn.click();
        await delay(1000); // Wait for explanation animation
        break;
      }
    }
  } catch (e) {
    console.log('Skipped Check Answer button click');
  }

    const result = await page.evaluate((subject) => {
    // We must extract innerHTML to preserve SVG MathJax formulas and image tags!
    function getHTML(element) {
      if (!element) return '';
      const clone = element.cloneNode(true);
      const mmls = clone.querySelectorAll('mjx-assistive-mml');
      mmls.forEach(m => m.remove());
      return clone.innerHTML.trim();
    }

    // 1. Question Extraction
    // ExamSIDE puts the actual question in the very first .question div on the page.
    const mainComponent = document.querySelector('.question-component') || document.body;
    const questionNodes = mainComponent.querySelectorAll('.question');
    const questionText = questionNodes.length > 0 ? getHTML(questionNodes[0]) : '';

    // 2. Options Extraction
    const options = { A: '', B: '', C: '', D: '' };
    let correctLetter = '';
    
    // ExamSIDE options are inside div[role="button"] WITHIN the main component
    const optionNodes = mainComponent.querySelectorAll('div[role="button"]');
    optionNodes.forEach(node => {
      const labelDiv = node.querySelector('div'); // This is the A/B/C/D circle
      if (labelDiv) {
        const label = labelDiv.textContent.trim();
        if (['A', 'B', 'C', 'D'].includes(label)) {
          // The option's actual formula/text is the .grow container, or the last child
          const children = Array.from(node.children);
          const contentDiv = children.find(child => (child.className || '').includes('grow')) || children[children.length - 1];

          options[label] = contentDiv ? getHTML(contentDiv) : '';
          
          // Detect if it's correct (usually highlighted in green after clicking "Check Answer")
          const nodeHTML = node.outerHTML || '';
          const nodeClass = node.className || '';
          if (nodeHTML.includes('green') || nodeClass.includes('green') || nodeHTML.includes('Correct Answer') || node.textContent.includes('Correct Answer')) {
            correctLetter = label;
          }
        }
      }
    });

    // 3. Solution extraction
    let solutionText = '';
    const allEls = mainComponent.querySelectorAll('h1, h2, h3, h4, h5, h6, div, p, span, strong, b');
    for (const el of allEls) {
      const text = el.textContent.trim();
      if (text === 'Explanation' || text === 'Solution') {
        const explanationContainer = el.nextElementSibling || el.parentElement?.nextElementSibling;
        if (explanationContainer) {
          solutionText = getHTML(explanationContainer);
        }
        break;
      }
    }

    return {
      question: questionText,
      options,
      correct: correctLetter || 'A', // Fallback to A if undefined
      solution: solutionText,
      subject: subject,
      year: 2025,
      shift: '20 April Evening'
    };
  }, subject);

  return result;
}

async function main() {
  console.log('Launching browser window... (headless for background execution)');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allQuestions = [];
  
  for (const [subject, slugs] of Object.entries(QUESTION_SLUGS)) {
    console.log(`\n=== Starting Subject: ${subject} ===`);
    let qNum = 1;
    for (const slug of slugs) {
      const url = BASE_URL + slug;
      console.log(`[${subject} Q${qNum}] Scraping URL...`);
      try {
        const data = await scrapeQuestion(page, url, subject);
        allQuestions.push(data);
      } catch (err) {
        console.error(`Error scraping ${url}: ${err.message}`);
      }
      qNum++;
    }
  }

  await browser.close();

  const filePath = path.join(__dirname, 'pyq_mht_cet_2025_20_evening.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
