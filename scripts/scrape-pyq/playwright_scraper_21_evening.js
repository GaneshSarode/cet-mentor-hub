const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "mexfk8nu", "mexfl8sh", "mexfjxcf", "mexfkie1", "mexfl5s2",
    "mexfjyd8", "mexfjxx0", "mexfl3bq", "mexfkz67", "mexfjyfm",
    "mexfl5v0", "mexfkigm", "mexfkf3d", "mexfk5ib", "mexfk8q4",
    "mexfl5xq", "mexfknr7", "mexfkntt", "mexfknwj", "mexfkcym",
    "mexfjyib", "mexfk8sr", "mexfkd1b", "mexfjxzq", "mexfkrnh",
    "mexfkvin", "mexfl8wb", "mexfl89v", "mexfl3e6", "mexfjxff",
    "mexfkz8r", "mexfke21", "mexfkzbq", "mexfkij7", "mexfl873",
    "mexfkvky", "mexfl8d1", "mexfkl38", "mexfl3gs", "mexfkzek",
    "mexfjyky", "mexfkl96", "mexfk5kr", "mexfklc1", "mexfk7pk",
    "mexfklex", "mexfl608", "mexfkph9", "mexfk5n5", "mexfkf6a"
  ],
  "Chemistry": [
    "mexfl9ge", "mexfl8gf", "mexfktgd", "mexfl9at", "mexfkll0",
    "mexfkqlf", "mexfk8ve", "mexfk5pu", "mexfl95b", "mexfl9xn",
    "mexfktj1", "mexfkrb6", "mexfjynk", "mexfl8yy", "mexfklr7",
    "mexfl62z", "mexfl980", "mexfl7xu", "mexfjyq3", "mexfl66p",
    "mexfkvn9", "mexfl9r0", "mexfk8g8", "mexfk8iq", "mexfkrdx",
    "mexfk5s6", "mexfl8mw", "mexfkzh3", "mexfjy2a", "mexfkvpn",
    "mexfki8r", "mexfl922", "mexfkgkz", "mexfjxi5", "mexfl9dq",
    "mexfktle", "mexfjy4z", "mexfkrg3", "mexfkndg", "mexfl8ju",
    "mexfla0h", "mexfkngm", "mexfl4cs", "mexfjy7j", "mexfl9iy",
    "mexfl4fb", "mexfl80i", "mexfk7ec", "mexfkzjl", "mexfk4pw"
  ],
  "Mathematics": [
    "mexfk7hf", "mexfl768", "mexfjxlm", "mexfk4sk", "mexfk8le",
    "mexfkrie", "mexfjxos", "mexfkepv", "mexfkbno", "mexfl4i0",
    "mexfkbqi", "mexfkbsy", "mexfjxrp", "mexfk7kc", "mexfkib9",
    "mexfkgnq", "mexfl799", "mexfl8pk", "mexfl4kr", "mexfl0hk",
    "mexfkesh", "mexfl4ng", "mexfl4qa", "mexfkevb", "mexfkey5",
    "mexfjxue", "mexfknjg", "mexfkz3k", "mexfk4v9", "mexfkgqh",
    "mexfknlv", "mexfk4y5", "mexfk7mw", "mexfl9mz", "mexfkf0m",
    "mexfl360", "mexfk511", "mexfl38z", "mexfk53v", "mexfl837",
    "mexfk56q", "mexfk59m", "mexfk5cp", "mexfjyaf", "mexfknoi",
    "mexfl7bx", "mexfkrkw", "mexfl9uc", "mexfkcvs", "mexfk5fj"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-21st-april-evening-shift/';

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
      shift: '21 April Evening'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2025_21_evening.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
