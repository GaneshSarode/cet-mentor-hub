const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "mew2wy50", "mew2xx5z", "mew2xfm3", "mew2xw1w", "mew2xfow",
    "mew2xbwt", "mew2xkzx", "mew2wnj6", "mew2wodv", "mew2wnm0",
    "mew2wnpt", "mew2wmuk", "mew2wina", "mew2wrnj", "mew2xah5",
    "mew2xwro", "mew2wiqn", "mew2xvwg", "mew2x30l", "mew2xwge",
    "mew2xvjt", "mew2x96q", "mew2wvg3", "mew2wqd9", "mew2xwzw",
    "mew2wvii", "mew2xqkj", "mew2x7ls", "mew2xhi2", "mew2wy77",
    "mew2xd60", "mew2witk", "mew2x333", "mew2wmxd", "mew2xx9g",
    "mew2wvlh", "mew2xajn", "mew2xd8i", "mew2x99g", "mew2xam8",
    "mew2x7o4", "mew2wiwb", "mew2x7ql", "mew2xw4p", "mew2xwab",
    "mew2xwmm", "mew2wvo6", "mew2xaoj", "mew2xn5i", "mew2wzlk"
  ],
  "Chemistry": [
    "mew2wvqn", "mew2wmzm", "mew2xvqn", "mew2xwp4", "mew2xdat",
    "mew2xa43", "mew2xbm4", "mew2wnsd", "mew2x5bu", "mew2wn20",
    "mew2wsbz", "mew2wvt1", "mew2wseb", "mew2x7t1", "mew2wqfw",
    "mew2xn80", "mew2wznz", "mew2wqhy", "mew2xdd7", "mew2xnaw",
    "mew2xxcc", "mew2wqlf", "mew2wxx4", "mew2x7ve", "mew2wzqp",
    "mew2wvvk", "mew2wsgp", "mew2wn4a", "mew2xhl0", "mew2xw7l",
    "mew2xvn8", "mew2xvtb", "mew2x5e8", "mew2wnuq", "mew2x1px",
    "mew2xa6h", "mew2xdft", "mew2wnx3", "mew2xvdx", "mew2wn6n",
    "mew2wrfp", "mew2xwu5", "mew2xxl8", "mew2x5gf", "mew2xwdj",
    "mew2wuhk", "mew2xx2x", "mew2wn96", "mew2xxf7", "mew2xvz3"
  ],
  "Mathematics": [
    "mew2xa8z", "mew2xboy", "mew2wri6", "mew2x6er", "mew2xbrk",
    "mew2x22p", "mew2wlrw", "mew2wnzw", "mew2wuk9", "mew2wun3",
    "mew2x7y0", "mew2xvgr", "mew2xabn", "mew2xaef", "mew2x6hi",
    "mew2x80g", "mew2x29f", "mew2wnbu", "mew2x83f", "mew2xxi3",
    "mew2wxzk", "mew2x2lk", "mew2wo2y", "mew2wo5i", "mew2x866",
    "mew2xqcc", "mew2wo8a", "mew2wrl3", "mew2wneh", "mew2xv85",
    "mew2x897", "mew2wmrl", "mew2xing", "mew2x2p0", "mew2xqeu",
    "mew2xqhv", "mew2xiqj", "mew2xbu9", "mew2xwwt", "mew2xwjh",
    "mew2wwnp", "mew2xvb5", "mew2x6kc", "mew2wy2a", "mew2wngs",
    "mew2x2tm", "mew2x2xw", "mew2wuqb", "mew2wob1", "mew2xitn"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-21st-april-morning-shift/';

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
      shift: '21 April Morning'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2025_21_morning.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
