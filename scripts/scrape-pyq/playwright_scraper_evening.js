const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Extracted URLs for the 150 questions in the shift
const QUESTION_SLUGS = {
  "Physics": [
    "mf67qgz6", "mf67qb61", "mf67qpc0", "mf67r5tf", "mf67p88i",
    "mf67psgj", "mf67q6nk", "mf67rf9j", "mf67r1xv", "mf67q6r0",
    "mf67pgdb", "mf67rhqg", "mf67p8bf", "mf67ri99", "mf67p53w",
    "mf67qi7v", "mf67q43v", "mf67pwzi", "mf67qiam", "mf67rftm",
    "mf67q6tk", "mf67rbwy", "mf67rh7x", "mf67px20", "mf67ra5e",
    "mf67rggr", "mf67p8ef", "mf67qper", "mf67qb8x", "mf67reyh",
    "mf67r24s", "mf67rbzm", "mf67po5r", "mf67qjd9", "mf67rhtl",
    "mf67qphe", "mf67psj8", "mf67pi98", "mf67qpk2", "mf67p8h0",
    "mf67rc1q", "mf67q46n", "mf67ow5c", "mf67q49g", "mf67rc42",
    "mf67qbbm", "mf67qjfu", "mf67ra7v", "mf67q6wq", "mf67ribs"
  ],
  "Chemistry": [
    "mf67rhyy", "mf67oxde", "mf67py4m", "mf67p6hl", "mf67q52m",
    "mf67oxg4", "mf67pslt", "mf67py73", "mf67po8b", "mf67raaf",
    "mf67p6kc", "mf67racq", "mf67rhd8", "mf67rgwa", "mf67rhfp",
    "mf67q6zk", "mf67raf6", "mf67qjia", "mf67rffo", "mf67poas",
    "mf67ptg3", "mf67rc6l", "mf67qw6l", "mf67pod7", "mf67rahq",
    "mf67qbe7", "mf67rg54", "mf67pic6", "mf67rfwa", "mf67qjkr",
    "mf67rc8v", "mf67rhi4", "mf67qjn5", "mf67qw8w", "mf67qbgp",
    "mf67r3d7", "mf67qbja", "mf67p9q8", "mf67rirc", "mf67riuh",
    "mf67rgjk", "mf67r3fr", "mf67ptim", "mf67q55m", "mf67rf17",
    "mf67pbgh", "mf67pog1", "mf67p6n6", "mf67ri1h", "mf67rakt"
  ],
  "Mathematics": [
    "mf67q7w5", "mf67rang", "mf67qf8j", "mf67raqj", "mf67pbj8",
    "mf67r3ih", "mf67r3l7", "mf67qfbp", "mf67poix", "mf67rasv",
    "mf67r6t6", "mf67r3oc", "mf67q58b", "mf67pbm9", "mf67ozt6",
    "mf67pzv7", "mf67rcbd", "mf67r3r7", "mf67pieu", "mf67rce3",
    "mf67r6vt", "mf67ravj", "mf67rayb", "mf67r6yn", "mf67pzxt",
    "mf67ptlg", "mf67rgzc", "mf67polh", "mf67pto6", "mf67ptqy",
    "mf67pii4", "mf67rgmr", "mf67q5b1", "mf67r71i", "mf67p7gf",
    "mf67r747", "mf67pooj", "mf67p7iz", "mf67p7lg", "mf67q7yw",
    "mf67p7o1", "mf67rb0x", "mf67pdkj", "mf67qjpu", "mf67qx43",
    "mf67rhkn", "mf67pjof", "mf67pjrf", "mf67q5dq", "mf67porj"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-23rd-april-evening-shift/';

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
      shift: '23 April Evening'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2025_evening.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
