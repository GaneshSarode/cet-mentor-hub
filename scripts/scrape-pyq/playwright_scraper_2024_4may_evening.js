const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "m4drcdn8", "m4drc655", "m4drc8g8", "m4drbune", "m4drbuc3",
    "m4drce9o", "m4drbtst", "m4drc9rd", "m4drc685", "m4drcdvn",
    "m4drbr7l", "m4drcdkl", "m4drcaf3", "m4drbtvh", "m4drc8ix",
    "m4drbtyi", "m4drbxj4", "m4drbrah", "m4drcai2", "m4drc8lj",
    "m4drc3ao", "m4drc0of", "m4drcdq0", "m4drc9wr", "m4drbrd6",
    "m4drca1k", "m4drcakm", "m4drc3dh", "m4drce3y", "m4drbupu",
    "m4drcecn", "m4drca58", "m4drc0r6", "m4drcd0m", "m4drc3g0",
    "m4drc83g", "m4drc0c4", "m4drbuf1", "m4drc8o8", "m4drbuhp",
    "m4drc3i7", "m4drcanh", "m4drc56e", "m4drbxlu", "m4drbu1a",
    "m4drcdby", "m4drc86d", "m4drc3ki", "m4drbu44", "m4drc0em"
  ],
  "Chemistry": [
    "m4cwcygr", "m4cwd0e8", "m4cwd0gy", "m4cwcxwp", "m4cwcr4u",
    "m4cwcr7k", "m4cwcuse", "m4cwcra1", "m4cwcrcs", "m4cwcrfg",
    "m4cwcuxd", "m4cwcybc", "m4cwcuzy", "m4cwcwvs", "m4cwcy2m",
    "m4cwd0jr", "m4cwcqzi", "m4cwcrhv", "m4cwcr26", "m4cwd0mm",
    "m4cwcst7", "m4cwd0bc", "m4cwcuuq", "m4drce10", "m4drc88y",
    "m4drbus9", "m4drcdso", "m4drbuuq", "m4drbu6l", "m4drbr23",
    "m4drc3mx", "m4drce6x", "m4drbukj", "m4drc8bc", "m4drc8dk",
    "m4drc3ph", "m4drcapy", "m4drc27u", "m4drcdhl", "m4drbu9i",
    "m4drc0h2", "m4drcdeq", "m4drbxok", "m4drbvka", "m4drc0jd",
    "m4drcaa8", "m4drcdyl", "m4drc0ls", "m4drbr50", "m4drbtpu"
  ],
  "Mathematics": [
    "m4cbm9gs", "m4cblxw8", "m4cblxk8", "m4cbmc3j", "m4cbm65n",
    "m4cbm45k", "m4cbm08a", "m4cbm9jx", "m4cbmc6r", "m4cblxz2",
    "m4cbm7xw", "m4cbma6e", "m4cbm80y", "m4cbmbxn", "m4cbm1op",
    "m4cbm4g7", "m4cbm9rz", "m4cbm2kp", "m4cbm571", "m4cbm699",
    "m4cbm5ss", "m4cbm84e", "m4cblxn8", "m4cbm5bk", "m4cblxq7",
    "m4cbma98", "m4cblxt8", "m4cbm9mi", "m4cbmaca", "m4cbmafl",
    "m4cbm5f8", "m4cbm9uu", "m4cbmbus", "m4cjoktx", "m4cjokx0",
    "m4cjon9p", "m4cjomwr", "m4cjomzz", "m4cjon2k", "m4cjon58",
    "m4cwcspt", "m4cwcy5j", "m4cwcy8k", "m4cwcupv", "m4cwcv2n",
    "m4cwcxzz", "m4cwcv5c", "m4cwcqwe", "m4cwcyeb", "m4cwcv86"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2024-4th-may-evening-shift/';

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
      shift: '4 May Evening'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2024_4may_evening.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
