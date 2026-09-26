const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "jt-mr4ops0b", "jt-mr4ops0c", "jt-mr4ops0d", "jt-mr4ops0e", "jt-mr4ops0f",
    "jt-mr4ops0g", "jt-mr4ops0h", "jt-mr4ops0i", "jt-mr4ops0j", "jt-mr4ops0k",
    "jt-mr4ops0l", "jt-mr4ops0m", "jt-mr4ops0n", "jt-mr4ops0o", "jt-mr4ops0p",
    "jt-mr4ops0q", "jt-mr4ops0r", "jt-mr4ops0s", "jt-mr4ops0t", "jt-mr4ops0u",
    "jt-mr4ops0v", "jt-mr4ops0w", "jt-mr4ops0x", "jt-mr4ops0y", "jt-mr4ops0z",
    "jt-mr4ops10", "jt-mr4ops11", "jt-mr4ops12", "jt-mr4ops13", "jt-mr4ops14",
    "jt-mr4ops15", "jt-mr4ops16", "jt-mr4ops17", "jt-mr4ops18", "jt-mr4ops19",
    "jt-mr4ops1a", "jt-mr4ops1b", "jt-mr4ops1c", "jt-mr4ops1d", "jt-mr4ops1e",
    "jt-mr4ops1f", "jt-mr4ops1g", "jt-mr4ops1h", "jt-mr4ops1i", "jt-mr4ops1j",
    "jt-mr4ops1k", "jt-mr4ops1l", "jt-mr4ops1m", "jt-mr4ops1n", "jt-mr4ops1o"
  ],
  "Chemistry": [
    "jt-mr4optgn", "jt-mr4optgo", "jt-mr4optgp", "jt-mr4optgq", "jt-mr4optgr",
    "jt-mr4optgs", "jt-mr4optgt", "jt-mr4optgu", "jt-mr4optgv", "jt-mr4optgw",
    "jt-mr4optgx", "jt-mr4optgy", "jt-mr4optgz", "jt-mr4opth0", "jt-mr4opth1",
    "jt-mr4opth2", "jt-mr4opth3", "jt-mr4opth4", "jt-mr4opth5", "jt-mr4opth6",
    "jt-mr4opth7", "jt-mr4opth8", "jt-mr4opth9", "jt-mr4optha", "jt-mr4opthb",
    "jt-mr4opthc", "jt-mr4opthd", "jt-mr4opthe", "jt-mr4opthf", "jt-mr4opthg",
    "jt-mr4opthh", "jt-mr4opthi", "jt-mr4opthj", "jt-mr4opthk", "jt-mr4opthl",
    "jt-mr4opthm", "jt-mr4opthn", "jt-mr4optho", "jt-mr4opthp", "jt-mr4opthq",
    "jt-mr4opthr", "jt-mr4opths", "jt-mr4optht", "jt-mr4opthu", "jt-mr4opthv",
    "jt-mr4opthw", "jt-mr4opthx", "jt-mr4opthy", "jt-mr4opthz", "jt-mr4opti0"
  ],
  "Mathematics": [
    "jt-mr4opvf2", "jt-mr4opvf3", "jt-mr4opvf4", "jt-mr4opvf5", "jt-mr4opvf6",
    "jt-mr4opvf7", "jt-mr4opvf8", "jt-mr4opvf9", "jt-mr4opvfa", "jt-mr4opvfb",
    "jt-mr4opvfc", "jt-mr4opvfd", "jt-mr4opvfe", "jt-mr4opvff", "jt-mr4opvfg",
    "jt-mr4opvfh", "jt-mr4opvfi", "jt-mr4opvfj", "jt-mr4opvfk", "jt-mr4opvfl",
    "jt-mr4opvfm", "jt-mr4opvfn", "jt-mr4opvfo", "jt-mr4opvfp", "jt-mr4opvfq",
    "jt-mr4opvfr", "jt-mr4opvfs", "jt-mr4opvft", "jt-mr4opvfu", "jt-mr4opvfv",
    "jt-mr4opvfw", "jt-mr4opvfx", "jt-mr4opvfy", "jt-mr4opvfz", "jt-mr4opvg0",
    "jt-mr4opvg1", "jt-mr4opvg2", "jt-mr4opvg3", "jt-mr4opvg4", "jt-mr4opvg5",
    "jt-mr4opvg6", "jt-mr4opvg7", "jt-mr4opvg8", "jt-mr4opvg9", "jt-mr4opvga",
    "jt-mr4opvgb", "jt-mr4opvgc", "jt-mr4opvgd", "jt-mr4opvge", "jt-mr4opvgf"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2026-13th-april-morning-shift/';

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
          const contentDiv = node.querySelector('.option-content') || node.children[node.children.length - 1];

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
      year: 2026,
      shift: '13 April Morning'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2026_13april_morning.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
