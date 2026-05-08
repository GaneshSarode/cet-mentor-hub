const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "m3txgel1", "m3txg614", "m3txgucc", "m3txgozg", "m3txginx",
    "m3txgsc2", "m3txgsek", "m3txfp4p", "m3txgkge", "m3txg9qz",
    "m3txgkiu", "m3txguz4", "m3txfp7o", "m3txgsh5", "m3txfpad",
    "m3txggdu", "m3txg6u4", "m3txg6wk", "m3txgh34", "m3txgp24",
    "m3txgtv9", "m3txgvdg", "m3txg6z6", "m3txg71p", "m3txfxn2",
    "m3txgggg", "m3txgiqj", "m3txfpd4", "m3txgu6j", "m3txg63p",
    "m3txgit1", "m3txg74d", "m3txggjf", "m3txgglw", "m3txfsot",
    "m3txgivj", "m3txfpfd", "m3txgsjt", "m3txgvg3", "m3txgv7e",
    "m3txglrp", "m3txgu0t", "m3txg02h", "m3txgunz", "m3txg8i2",
    "m3txg66c", "m3txglu7", "m3txfw1t", "m3txg8kg", "m3txgq94"
  ],
  "Chemistry": [
    "m3txg04x", "m3txg68z", "m3txguqk", "m3txgh5j", "m3txgut3",
    "m3txgsmi", "m3txg2d9", "m3txg1wp", "m3txgviq", "m3txgu3o",
    "m3txg6b7", "m3txg6dk", "m3txgh7w", "m3txgtsm", "m3txfr54",
    "m3txgof7", "m3txg2fp", "m3txg1yz", "m3txgtxy", "m3txgha8",
    "m3txgsp5", "m3txggo9", "m3txggqg", "m3txg9dr", "m3txghco",
    "m3txftfr", "m3txghfh", "m3txg2i5", "m3txfti5", "m3txgv1n",
    "m3txgsrf", "m3txggsw", "m3txg9g4", "m3txgvo2", "m3txftko",
    "m3txgtka", "m3txguf3", "m3txgvlg", "m3txg3ns", "m3txguw1",
    "m3txg6gd", "m3txglwj", "m3txgibp", "m3txguhx", "m3txggv9",
    "m3txggxn", "m3txgiea", "m3txgoil", "m3txgv4i", "m3txglzc"
  ],
  "Mathematics": [
    "m3txg9io", "m3txfx44", "m3txfx6r", "m3txgtn2", "m3txftne",
    "m3txfx99", "m3txg9li", "m3txftq9", "m3txg22a", "m3txgs14",
    "m3txg24u", "m3txg27p", "m3txg6is", "m3txgos2", "m3txg6ll",
    "m3txgm1v", "m3txftt7", "m3txgeim", "m3txgih4", "m3txg4ao",
    "m3txgm4h", "m3txg4d8", "m3txgs3r", "m3txfr7y", "m3txg6ol",
    "m3txfxc5", "m3txfxez", "m3txg4g3", "m3txgiku", "m3txg4iy",
    "m3txg2ap", "m3txfrb3", "m3txfrek", "m3txgow2", "m3txfxhp",
    "m3txgtpy", "m3txgh07", "m3txgs6h", "m3txg6rf", "m3txgkdy",
    "m3txfrhn", "m3txg4lz", "m3txgu9o", "m3txgm71", "m3txfxkg",
    "m3txgukv", "m3txg9oa", "m3txfrkh", "m3txftw3", "m3txgs9a"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2024-2nd-may-morning-shift/';

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
      shift: '2 May Morning'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2024_2may_morning.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
