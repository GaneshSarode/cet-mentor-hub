const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "m44hbr2m", "m44hbr6c", "m44hbr9e", "m44hbrd4", "m44hbrgi",
    "m44hcsky", "m44hbte2", "m44hbth5", "m44hbtkl", "m44hbtnt",
    "m44hbtqv", "m44hbtui", "m44hbtxh", "m44hcrlu", "m44hcroz",
    "m44hbwe6", "m44hbwh9", "m44hbwkb", "m44hcsv5", "m44hbxrd",
    "m44hbxuh", "m44hbxxm", "m44hby0i", "m44hby3d", "m44hby65",
    "m44hby96", "m44hcrbt", "m44hbz7n", "m44hbzap", "m44hbzdv",
    "m44hbzgf", "m44hbzja", "m44hbzm8", "m44hbzpg", "m44hbzs9",
    "m44hbzv1", "m44hcseg", "m44hc0q7", "m44hc0t9", "m44hc0we",
    "m44hc0zf", "m44hc124", "m44hc148", "m44hc171", "m44hc1a7",
    "m44hcrs2", "m44hc28h", "m44hc2br", "m44hc2eu", "m44hc2rl"
  ],
  "Chemistry": [
    "m44hc2wt", "m44hc34i", "m44hc3a0", "m44hcsh6", "m44hcrv5",
    "m44hc5lv", "m44hc5p1", "m44hc5ro", "m44hc5uk", "m44hc5x3",
    "m44hc5zm", "m44hc62d", "m44hc64y", "m44hc67l", "m44hcso1",
    "m44hc7m2", "m44hc7p0", "m44hc7rv", "m44hc7uv", "m44hc7xp",
    "m44hcs7j", "m44hcae7", "m44hcsrh", "m44hcs0w", "m44hcg59",
    "m44hcg82", "m44hcgay", "m44hcsbc", "m44hchr1", "m44hchuj",
    "m44hchxs", "m44hci0h", "m44hci38", "m44hci7j", "m44hciag",
    "m44hcids", "m44hcril", "m44hcj9o", "m44hcjca", "m44hcry5",
    "m44hcrf3", "m44hcokf", "m44hconh", "m44hcs41", "m44hcqgt",
    "m44hcqk2", "m44hcqmj", "m44hcqp8", "m44hcqsh", "m44hcqvp"
  ],
  "Mathematics": [
    "m46k99xk", "m46k9a19", "m46k9a4q", "m46k9a83", "m46k9ab5",
    "m46k9p8s", "m46k9c63", "m46k9c8y", "m46k9ccz", "m46k9cg9",
    "m46k9cj6", "m46k9clz", "m46k9cp0", "m46k9crz", "m46k9cuw",
    "m46k9cxz", "m46k9d1c", "m46k9d4b", "m46k9pig", "m46k9eem",
    "m46k9ehf", "m46k9ekf", "m46k9enf", "m46k9eq8", "m46k9esv",
    "m46k9evn", "m46k9eyk", "m46k9f1m", "m46k9f4s", "m46k9f83",
    "m46k9fav", "m46k9fdn", "m46k9fgf", "m46k9pfh", "m46k9gx7",
    "m46k9h06", "m46k9h38", "m46k9h60", "m46k9h8z", "m46k9hcj",
    "m46k9hfx", "m46k9hix", "m46k9hlt", "m46k9hoh", "m46k9hr7",
    "m46k9hty", "m46k9pcc", "m46k9mdw", "m46k9mgz", "m46k9mjr"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2024-3rd-may-morning-shift/';

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
      shift: '3 May Morning'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2024_3may_morning.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
