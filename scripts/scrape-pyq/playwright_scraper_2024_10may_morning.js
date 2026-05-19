const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "m4jgskv2", "m4jgt7i3", "m4jgt895", "m4jgsg16", "m4jgsrp2",
    "m4jgsm5d", "m4jgsxio", "m4jgt7ji", "m4jgsg30", "m4jgt3iw",
    "m4jgsrso", "m4jgsxk7", "m4jgsxl7", "m4jgsrqj", "m4jgt813",
    "m4jgsmd2", "m4jgt0op", "m4jgt0pt", "m4jgt7ku", "m4jgsoqu",
    "m4jgt8k2", "m4jgsm6n", "m4jgt7pj", "m4jgt8fy", "m4jgsm7s",
    "m4jgt5fo", "m4jgstwc", "m4jgsjf2", "m4jgt7lx", "m4jgt8lm",
    "m4jgsos1", "m4jgstxi", "m4jgstym", "m4jgskw9", "m4jgsq2x",
    "m4jgszn9", "m4jgt7qy", "m4jgt8aa", "m4jgszob", "m4jgsmed",
    "m4jgszpe", "m4jgt7xo", "m4jgspzu", "m4jgt0r1", "m4jgt3k2",
    "m4jgstzr", "m4jgsu0x", "m4jgszqf", "m4jgszrd", "m4jgsq41"
  ],
  "Chemistry": [
    "m4jgt8cm", "m4jgsm8x", "m4jgsu1z", "m4jgsq0w", "m4jgszsd",
    "m4jgsxb3", "m4jgsm4b", "m4jgsm9v", "m4jgsjga", "m4jgt5gv",
    "m4jgt5hz", "m4jgt7rv", "m4jgt7ys", "m4jgt68i", "m4jgt87w",
    "m4jgt0s6", "m4jgt3l8", "m4jgskon", "m4jgskq2", "m4jgsztg",
    "m4jgt83d", "m4jgt7n3", "m4jgt8dy", "m4jgt7sy", "m4jgsmax",
    "m4jgsnva", "m4jgskrh", "m4jgsq1w", "m4jgt6a8", "m4jgt7ty",
    "m4jgt8ns", "m4jgt7od", "m4jgt84g", "m4jgsksm", "m4jgsnwd",
    "m4jgsktr", "m4jgsxc6", "m4jgt7zz", "m4jgsnxf", "m4jgt3ma",
    "m4jgt85l", "m4jgsuuq", "m4jgt86r", "m4jgt7eb", "m4jgsmbz",
    "m4jgsxdg", "m4jgt0t5", "m4jgt8bj", "m4jgsopn", "m4jgt7uw"
  ],
  "Mathematics": [
    "m4jgsxge", "m4jgt7fg", "m4jgsrrj", "m4jgt7gv", "m4jgt82c",
    "m4kw7rd1", "m4kw7jxv", "m4kw7r8w", "m4kw7jr9", "m4kw7mwf",
    "m4kw7mor", "m4kw7rg9", "m4kw7k7u", "m4kw7sz7", "m4kw7mxp",
    "m4kw7jsz", "m4kw7jyv", "m4kw7odl", "m4kw7oet", "m4kw7myw",
    "m4kw7klb", "m4kw7r5i", "m4kw7k01", "m4kw7k16", "m4kw7kda",
    "m4kw7r6m", "m4kw7kmg", "m4kw7kef", "m4kw7t0b", "m4kw7mpz",
    "m4kw7mr2", "m4kw7mt0", "m4kw7kfk", "m4kw7r9y", "m4kw7raz",
    "m4kw7jv1", "m4kw7jwl", "m4kw7knk", "m4kw7k8w", "m4kw7k5i",
    "m4kw7kgp", "m4kw7mu6", "m4kw7ki0", "m4kw7k28", "m4kw7n04",
    "m4kw7oh6", "m4kw7n1c", "m4kw7pyj", "m4kw7mvd", "m4kw7t1d"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2024-10th-may-morning-shift/';

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
      shift: '10 May Morning'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2024_10may_morning.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
