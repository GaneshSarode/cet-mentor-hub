const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "m4i0xrvm", "m4i0wy6b", "m4i0xobf", "m4i0xtu6", "m4i0xh87",
    "m4i0wrpb", "m4i0xsf7", "m4i0xsin", "m4i0xodx", "m4i0x5w7",
    "m4i0xry9", "m4i0xgmp", "m4i0x9qx", "m4i0xsv3", "m4i0x5yw",
    "m4i0xogs", "m4i0x9tj", "m4i0xikt", "m4i0x98h", "m4i0xtbx",
    "m4i0xgp9", "m4i0wrrs", "m4i0xb9x", "m4i0xbcv", "m4i0xnqf",
    "m4i0xf5n", "m4i0x621", "m4i0xf8b", "m4i0xnt3", "m4i0xslk",
    "m4i0xs1e", "m4i0x64p", "m4i0xq6i", "m4i0xt92", "m4i0wt2f",
    "m4i0x67l", "m4i0x475", "m4i0xgrk", "m4i0xtkg", "m4i0xj1m",
    "m4i0xtey", "m4i0x49p", "m4i0xchp", "m4i0xcx7", "m4i0xd05",
    "m4i0xnw1", "m4i0x4ci", "m4i0x0ez", "m4i0wtox", "m4i0xck9"
  ],
  "Chemistry": [
    "m4i0x6ag", "m4i0xtmx", "m4i0x6cy", "m4i0xhyw", "m4i0x9az",
    "m4i0wrum", "m4i0xi1g", "m4i0xd32", "m4i0xint", "m4i0xd5j",
    "m4i0xfbn", "m4i0xi4e", "m4i0x0ha", "m4i0xthu", "m4i0xjy2",
    "m4i0xgtw", "m4i0x6fw", "m4i0xsyc", "m4i0xt14", "m4i0xnya",
    "m4i0x4f1", "m4i0xcmx", "m4i0xo1k", "m4i0xcpb", "m4i0xgxg",
    "m4i0x6id", "m4i0xo4z", "m4i0xh0m", "m4i0xi79", "m4i0wp9p",
    "m4i0xd8b", "m4i0xrb7", "m4i0xdat", "m4i0xs8j", "m4i0wrx4",
    "m4i0x4hk", "m4i0x9d9", "m4i0wpcd", "m4i0x1km", "m4i0xt3y",
    "m4i0x2rp", "m4i0xt6f", "m4i0xscq", "m4i0x9fv", "m4i0xfe6",
    "m4i0xdd2", "m4i0xdfi", "m4i0x3vh", "m4i0xir3", "m4i0xfgx"
  ],
  "Mathematics": [
    "m4fmpa5r", "m4i0xky5", "m4i0xitv", "m4i0wxv3", "m4i0x4kj",
    "m4i0xl0z", "m4i0wqge", "m4i0xl3q", "m4i0xdi9", "m4i0xsp1",
    "m4i0x3y5", "m4i0xh35", "m4i0xo8b", "m4i0wqjb", "m4i0x6lf",
    "m4i0wxxw", "m4i0xeu8", "m4i0xh5s", "m4i0x414", "m4i0xfjh",
    "m4i0xewv", "m4i0xia1", "m4i0xtqm", "m4i0xiwg", "m4i0x4nh",
    "m4i0xezm", "m4i0x4q8", "m4i0wrzo", "m4i0xsrw", "m4i0wqmg",
    "m4i0x5ti", "m4i0x9io", "m4i0xicw", "m4i0xf2m", "m4i0wqpi",
    "m4i0xs4p", "m4i0xiyv", "m4i0wy0r", "m4i0wy3r", "m4i0xifk",
    "m4i0xiif", "m4i0xcry", "m4i0x9lq", "m4i0xfo1", "m4i0xmiu",
    "m4i0x84r", "m4i0x9of", "m4i0xcur", "m4i0x87j", "m4i0x44c"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2024-9th-may-evening-shift/';

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
      year: 2024,
      shift: '9 May Evening'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2024_9may_evening.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
