const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "m49ootki", "m49ootqw", "m49ootsq", "m49oo9kb", "m49ooela",
    "m49op4su", "m49op41i", "m49ooobv", "m49oo3lc", "m49oo9ll",
    "m49ooeme", "m49oood4", "m49ooeqw", "m49oocqr", "m49op4a4",
    "m49ooes6", "m49oo9ml", "m49oo3me", "m49op3xj", "m49oo5j0",
    "m49op4bi", "m49oocgt", "m49oochs", "m49oociu", "m49op4ql",
    "m49op4lc", "m49ook02", "m49ootlj", "m49oodrf", "m49ook18",
    "m49ooth7", "m49oo5k3", "m49ootmx", "m49oo5l6", "m49oog1y",
    "m49ooozt", "m49oosmc", "m49ooaun", "m49ooups", "m49oo4m0",
    "m49oo5m8", "m49ook48", "m49ooeu2", "m49op3z8", "m49oop12",
    "m49ooeni", "m49oosni", "m49op4rk", "m49onz4h", "m49oosoh"
  ],
  "Chemistry": [
    "m49oopu6", "m49ootif", "m49op42e", "m49ool5s", "m49oocjw",
    "m49onz65", "m49op4ur", "m49oo4ni", "m49ooeor", "m49ooev5",
    "m49ootoj", "m49ooc8i", "m49ooca7", "m49onz87", "m49oodso",
    "m49oouqv", "m49onz97", "m49ooewr", "m49ooexs", "m49oohwj",
    "m49op4fy", "m49op4dn", "m49ootjh", "m49op4i2", "m49op44v",
    "m49oohxl", "m49oohyl", "m49oodtq", "m49op4j8", "m49oo5gl",
    "m49oospk", "m49op45z", "m49ooept", "m49op4mc", "m49oo5ht",
    "m49ooqlv", "m49oocbc", "m49oocce", "m49oo8gh", "m49ooqmv",
    "m49oo8hz", "m49oomvp", "m49op480", "m49ook26", "m49ootpg",
    "m49oocdg", "m49ooeyu", "m49op470", "m49oorge", "m49oockz"
  ],
  "Mathematics": [
    "m4atnm3w", "m4atnlwt", "m4atnmw9", "m4atnwl4", "m4atnmxz",
    "m4atnmkw", "m4atnmfu", "m4atnmhm", "m4atnlyb", "m4atnp6t",
    "m4atnwmr", "m4atnmsx", "m4cbm25x", "m4cbm9xo", "m4cbm5wb",
    "m4cbm28x", "m4cblzxc", "m4cbmbrx", "m4cbm6cg", "m4cbm00c",
    "m4cbm6f7", "m4cbm02z", "m4cbm6hw", "m4cbma0n", "m4cbm1uh",
    "m4cbm6la", "m4cbm1x2", "m4cbm6oj", "m4cbm1zx", "m4cblxdn",
    "m4cbm4na", "m4cbm5iq", "m4cbm05p", "m4cblxh4", "m4cbm5lq",
    "m4cbm4u7", "m4cbm2bh", "m4cbm509", "m4cbm5p7", "m4cbmc0k",
    "m4cbm5zr", "m4cbm2ec", "m4cbm9p8", "m4cbma3k", "m4cbm1rj",
    "m4cbm22z", "m4cbm62h", "m4cbm2h9", "m4cbm1j6", "m4cbm1lw"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2024-4th-may-morning-shift/';

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
      shift: '4 May Morning'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2024_4may_morning.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
