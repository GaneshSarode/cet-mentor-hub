const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "mezezd0e", "mezezm3m", "mezezwte", "mezeztmi", "mezf09sc",
    "mezezsy2", "mezezm6a", "mezezvpe", "mezf0hiv", "mezezgwt",
    "mezezy4h", "mezezd35", "mezezpyw", "mezf04as", "mezezm8r",
    "mezf09ux", "mezf0epz", "mezezq17", "mezf0hm3", "mezezled",
    "mezf09xl", "mezf0a0c", "mezezvry", "mf18enbe", "mf18enep",
    "mf18enhh", "mf18enk8", "mf18enmz", "mf18fgly", "mf18eqj5",
    "mf18eqlo", "mf18eqoj", "mf18eqr5", "mf18eqto", "mf18eqw8",
    "mf18eqyn", "mf18er1d", "mf18er3z", "mf18er6j", "mf18er8u",
    "mf18erbb", "mf18erdu", "mf18ergg", "mf18erj9", "mf18erlq",
    "mf18ernx", "mf18erqf", "mf18ert4", "mf18ervi", "mf18ery0"
  ],
  "Chemistry": [
    "mf18ffeh", "mf18esuy", "mf18ffng", "mf18etuj", "mf18etx5",
    "mf18etzo", "mf18eu2a", "mf18fg0y", "mf18evbp", "mf18eve7",
    "mf18evgr", "mf18fgoh", "mf18ewfw", "mf18ewil", "mf18ewl6",
    "mf18ewnk", "mf18ewpw", "mf18ews5", "mf18ewue", "mf18ewwr",
    "mf18ewz6", "mf18fg5y", "mf18ffh4", "mf18fft0", "mf18f05k",
    "mf18f081", "mf18f0ag", "mf18f0cr", "mf18f0fd", "mf18f0i0",
    "mf18f0kf", "mf18fgjh", "mf18f1v7", "mf18f1xf", "mf18f1zw",
    "mf18fg3h", "mf18f2ud", "mf18f2wm", "mf18f2yy", "mf18f31b",
    "mf18fgec", "mf18ffyd", "mf18f525", "mf18f54k", "mf18f56z",
    "mf18fg8k", "mf18f5ve", "mf18f5xw", "mf18f60e", "mf18fgh2"
  ],
  "Mathematics": [
    "mf18f62z", "mf18f65p", "mf18f68j", "mf18f6bf", "mf18f6dz",
    "mf18f6gk", "mf18f6j4", "mf18f6ls", "mf18f6om", "mf18f6r9",
    "mf18f6tu", "mf18f6wf", "mf18f6zc", "mf18f724", "mf18f74p",
    "mf18f77m", "mf18f7a4", "mf18f7d0", "mf18f7fo", "mf18f7i9",
    "mf18f7ku", "mf18f7nl", "mf18f7qs", "mf18f7to", "mf18f7wb",
    "mf18ffk7", "mf18f91x", "mf18f94s", "mf18ffvo", "mf18fgbh",
    "mf18fbdu", "mf18fbgs", "mf18fbjo", "mf18fbmm", "mf18fbp4",
    "mf18ffq7", "mf18fcuk", "mf18fcx5", "mf18fczy", "mf18fd2t",
    "mf18fd5g", "mf18fd85", "mf18fdaw", "mf18fddp", "mf18fdgf",
    "mf18fdiz", "mf18fdm6", "mf18fdp0", "mf18fdrt", "mf18fduz"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-22nd-april-evening-shift/';

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
      shift: '22 April Evening'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2025_22_evening.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
