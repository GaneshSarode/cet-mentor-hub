const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "merjo9cu", "merjo3h1", "merjo6ul", "merjo6vc", "merjo9a9",
    "merjo56f", "merjo9i2", "merjo6rw", "merjo9ix", "merjo4jg",
    "merjo9b3", "merjo4kf", "merjo4n8", "merjo1iu", "merjo3c5",
    "merjo3d2", "merjo1fx", "merjo4lc", "merjo96t", "merjo6zu",
    "merjo9gb", "merjo70p", "merjo6xy", "merjo4mc", "merjo9js",
    "merjo6sr", "merjo71m", "merjo9ko", "merjo9dt", "merjo95k",
    "merjo05n", "merjo98h", "merjo6yv", "merjo3e2", "merjo1gw",
    "merjo998", "merjo6tn", "merjo9bz", "merjo3ff", "merjo3hk",
    "merjo9lp", "merjo6w8", "merjo1n0", "merjo1ez", "merjo9hb",
    "merjo7i2", "merjo6x4", "merjo9fh", "merjo3g2", "merjo1hv"
  ],
  "Chemistry": [
    "meujcla9", "meujcuao", "meujcm6g", "meujcb4t", "meujcmsa",
    "meujcali", "meujc0d3", "meujch6x", "meujcad4", "meujccte",
    "meujcafv", "meujc0sw", "meujcfea", "meujcrfo", "meujcc9f",
    "meujclcy", "meujcf5w", "meujcw4g", "meujcy86", "meujcai7",
    "meujcunm", "meujcf8f", "meujcm8w", "meujc0z2", "meujc3gh",
    "meujcu1r", "meujcqpz", "meujcown", "meujclax", "meujc3jn",
    "meujccc4", "meujccee", "meujcn6k", "meujcu48", "meujcqtz",
    "meujc3mc", "meujct7n", "meujcalh", "meujcaps", "meujc1az",
    "meujcgg7", "meujc8ow", "meujccw4", "meujcfaz", "meujc8rg",
    "meujcmbn", "meujcat2", "meujcen9", "meujccgr", "meujcb78"
  ],
  "Mathematics": [
    "meujctw4", "meujcb9p", "meujcapg", "meujcasl", "meujcuqk",
    "meujctz0", "meujcuti", "meujcw2x", "meujcl03", "meujcmen",
    "meujcl48", "meujcsat", "meujcmhi", "meujcyav", "meujcu7g",
    "meujcavr", "meujcwbu", "meujcsdv", "meujcox6", "meujca1u",
    "meujcsgk", "meujcayh", "meujccz6", "meujcuw1", "meujcfdf",
    "meujcb1k", "meujcmk3", "meujcepx", "meujcl7b", "meujcbce",
    "meujcmms", "meujcozz", "meujcw5l", "meujca4i", "meujcual",
    "meujcw8h", "meujcesk", "meujccq5", "meujcuds", "meujcwel",
    "meujcd20", "meujcugu", "meujceh5", "meujcmpg", "meujcsjd",
    "meujcuka", "meujca71", "meujc1ij", "meujcw1e", "meujca9v"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-19th-april-morning-shift/';

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
      shift: '19 April Morning'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2025_19_morning.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
