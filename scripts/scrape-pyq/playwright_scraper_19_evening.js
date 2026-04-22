const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "merjmtkc", "merjn73u", "merjnbzf", "merjmnx1", "merjndow",
    "merjlu2j", "merjlg24", "merjnc0v", "merjmgn8", "merjndpu",
    "merjmnxw", "merjn3ti", "merjlg60", "merjnzfm", "merjmawc",
    "merjl8po", "merjnxc1", "merjmxxi", "merjnzts", "merjmxys",
    "merjlg7m", "merjmgo6", "merjmtv9", "merjlu3o", "merjnr0n",
    "merjmr3x", "merjlu4j", "merjl8qq", "merjmr4v", "merjnpn7",
    "merjl8rq", "merjl8su", "merjnc1m", "merjn3ud", "merjnc2f",
    "merjn74t", "merjmgp6", "merjnuz5", "merjnm92", "merjn75k",
    "merjnm9y", "merjmt7m", "merjnx11", "merjlh7b", "merjlh8f",
    "merjnc3g", "merjn605", "merjlyxs", "merjn0hl", "merjnmaq"
  ],
  "Chemistry": [
    "merjn27z", "merjmcxe", "merjmtl9", "merjlyz3", "merjmzjb",
    "merjlz0d", "merjmr5q", "merjmgqe", "merjn3v8", "merjmtmd",
    "merjn76h", "merjmgrc", "merjmt8u", "merjlz1g", "merjlz2l",
    "merjmtq8", "merjnmco", "merjnw5r", "merjmnz3", "merjnwbr",
    "merjnits", "merjnuv0", "merjndqp", "merjmt2v", "merjn3w3",
    "merjnwui", "merjl9lz", "merjmcyt", "merjmczt", "merjndri",
    "merjmzk6", "merjmo05", "merjlvmv", "merjmgsd", "merjl9n0",
    "merjmzky", "merjnxcx", "merjm3a3", "merjmd0p", "merjljgm",
    "merjmtnl", "merjnzxv", "merjmr6l", "merjmzlv", "merjnx1w",
    "merjnr1x", "merjn3wy", "merjnw6p", "merjlwkr", "merjm3b5"
  ],
  "Mathematics": [
    "merjmo15", "merjnw2e", "merjnxo7", "merjmzmz", "merjmo2d",
    "merjnivk", "merjl9o0", "merjnnco", "merjl9p5", "merjmu59",
    "merjmtxy", "merjmu67", "merjmu7a", "merjn3xx", "merjl9q4",
    "merjmu8d", "merjm3cj", "merjmuc5", "merjnndf", "merjndsu",
    "merjmtam", "merjm3dm", "merjn3yt", "merjn778", "merjmd1v",
    "merjlntv", "merjn782", "merjmt3u", "merjn3zt", "merjlwlw",
    "merjo02r", "merjlnus", "merjnw3b", "merjlal5", "merjmtr7",
    "merjn40o", "merjn41j", "merjm4k5", "merjnne8", "merjmd3t",
    "merjlamb", "merjn6qq", "merjm4lj", "merjnc4a", "merjmd4s",
    "merjn42u", "merjmtw6", "merjniwh", "merjmznv", "merjmzos"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-19th-april-evening-shift/';

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
      shift: '19 April Evening'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2025_19_evening.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
