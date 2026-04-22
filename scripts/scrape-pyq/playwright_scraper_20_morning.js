const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "met14zwy", "met1513q", "met1531c", "met142jc", "met1492g",
    "met14c0x", "met1514s", "met14713", "met1533o", "met148vg",
    "met14r1i", "met1472b", "met142le", "met14t9r", "met1493k",
    "met14tb8", "met14zy7", "met14yjv", "met144eh", "met14zzl",
    "met142nt", "met142p4", "met144g0", "met152t3", "met14gq6",
    "met142qw", "met14ym4", "met14r2z", "met152uq", "met14grh",
    "met14w55", "met14zt4", "met15165", "met1494x", "met152e6",
    "met145uq", "met14ghl", "met14gsp", "met145vy", "met152ka",
    "met14w6b", "met14tch", "met14c2a", "met14c3n", "met14gtv",
    "met14cdw", "met142s2", "met146ut", "met1473j", "met14gv5"
  ],
  "Chemistry": [
    "met1500o", "met14c4m", "met148ws", "met1474y", "met152w9",
    "met14zgv", "met14tdi", "met14zu8", "met14cf2", "met1476a",
    "met14gwi", "met1534x", "met146w1", "met152mm", "met152fw",
    "met14r49", "met1538p", "met14tel", "met14w7e", "met14tfs",
    "met152zv", "met148xm", "met1539u", "met15360", "met146x9",
    "met14uix", "met14zi2", "met14dkv", "met1477i", "met14zja",
    "met14giq", "met152hf", "met14zkk", "met14dm7", "met14gjx",
    "met14c5q", "met1532o", "met1478r", "met14bqr", "met1479y",
    "met14gkz", "met14zm0", "met152nw", "met14c6y", "met144ad",
    "met1528r", "met14zo9", "met14bs2", "met14s2q", "met150xw"
  ],
  "Mathematics": [
    "met14c86", "met14c9j", "met144bt", "met147b7", "met15374",
    "met146yn", "met14gm7", "met14ukj", "met14btc", "met150z6",
    "met1510m", "met14bum", "met14w8n", "met14ulo", "met148yz",
    "met14cas", "met14bvv", "met14zvp", "met14zqb", "met1529z",
    "met152pv", "met14w9v", "met14orr", "met14901", "met152r8",
    "met148ow", "met14bxd", "met14gng", "met14t8i", "met14dnk",
    "met14byh", "met14zs2", "met14gop", "met148q5", "met14cc7",
    "met14un9", "met14ot7", "met14ouc", "met148rp", "met14bzq",
    "met144d7", "met14doq", "met146zu", "met148tz", "met14uog",
    "met152ij", "met14upn", "met14ur2", "met1512f", "met1491c"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-20th-april-morning-shift/';

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
      shift: '20 April Morning'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2025_20_morning.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
