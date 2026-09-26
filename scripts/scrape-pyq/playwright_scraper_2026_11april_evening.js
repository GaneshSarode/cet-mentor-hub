const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "jt-mr4ovhba", "jt-mr4ovhbb", "jt-mr4ovhbc", "jt-mr4ovhbd", "jt-mr4ovhbe",
    "jt-mr4ovhbf", "jt-mr4ovhbg", "jt-mr4ovhbh", "jt-mr4ovhbi", "jt-mr4ovhbj",
    "jt-mr4ovhbk", "jt-mr4ovhbl", "jt-mr4ovhbm", "jt-mr4ovhbn", "jt-mr4ovhbo",
    "jt-mr4ovhbp", "jt-mr4ovhbq", "jt-mr4ovhbr", "jt-mr4ovhbs", "jt-mr4ovhbt",
    "jt-mr4ovhbu", "jt-mr4ovhbv", "jt-mr4ovhbw", "jt-mr4ovhbx", "jt-mr4ovhby",
    "jt-mr4ovhbz", "jt-mr4ovhc0", "jt-mr4ovhc1", "jt-mr4ovhc2", "jt-mr4ovhc3",
    "jt-mr4ovhc4", "jt-mr4ovhc5", "jt-mr4ovhc6", "jt-mr4ovhc7", "jt-mr4ovhc8",
    "jt-mr4ovhc9", "jt-mr4ovhca", "jt-mr4ovhcb", "jt-mr4ovhcc", "jt-mr4ovhcd",
    "jt-mr4ovhce", "jt-mr4ovhcf", "jt-mr4ovhcg", "jt-mr4ovhch", "jt-mr4ovhci",
    "jt-mr4ovhcj", "jt-mr4ovhck", "jt-mr4ovhcl", "jt-mr4ovhcm", "jt-mr4ovhcn"
  ],
  "Chemistry": [
    "jt-mr4ovinn", "jt-mr4ovino", "jt-mr4ovinp", "jt-mr4ovinq", "jt-mr4ovinr",
    "jt-mr4ovins", "jt-mr4ovint", "jt-mr4ovinu", "jt-mr4ovinv", "jt-mr4ovinw",
    "jt-mr4ovinx", "jt-mr4oviny", "jt-mr4ovinz", "jt-mr4ovio0", "jt-mr4ovio1",
    "jt-mr4ovio2", "jt-mr4ovio3", "jt-mr4ovio4", "jt-mr4ovio5", "jt-mr4ovio6",
    "jt-mr4ovio7", "jt-mr4ovio8", "jt-mr4ovio9", "jt-mr4ovioa", "jt-mr4oviob",
    "jt-mr4ovioc", "jt-mr4oviod", "jt-mr4ovioe", "jt-mr4oviof", "jt-mr4oviog",
    "jt-mr4ovioh", "jt-mr4ovioi", "jt-mr4ovioj", "jt-mr4oviok", "jt-mr4oviol",
    "jt-mr4oviom", "jt-mr4ovion", "jt-mr4ovioo", "jt-mr4oviop", "jt-mr4ovioq",
    "jt-mr4ovior", "jt-mr4ovios", "jt-mr4oviot", "jt-mr4oviou", "jt-mr4oviov",
    "jt-mr4oviow", "jt-mr4oviox", "jt-mr4ovioy", "jt-mr4ovioz", "jt-mr4ovip0"
  ],
  "Mathematics": [
    "jt-mr4ovkll", "jt-mr4ovklm", "jt-mr4ovkln", "jt-mr4ovklo", "jt-mr4ovklp",
    "jt-mr4ovklq", "jt-mr4ovklr", "jt-mr4ovkls", "jt-mr4ovklt", "jt-mr4ovklu",
    "jt-mr4ovklv", "jt-mr4ovklw", "jt-mr4ovklx", "jt-mr4ovkly", "jt-mr4ovklz",
    "jt-mr4ovkm0", "jt-mr4ovkm1", "jt-mr4ovkm2", "jt-mr4ovkm3", "jt-mr4ovkm4",
    "jt-mr4ovkm5", "jt-mr4ovkm6", "jt-mr4ovkm7", "jt-mr4ovkm8", "jt-mr4ovkm9",
    "jt-mr4ovkma", "jt-mr4ovkmb", "jt-mr4ovkmc", "jt-mr4ovkmd", "jt-mr4ovkme",
    "jt-mr4ovkmf", "jt-mr4ovkmg", "jt-mr4ovkmh", "jt-mr4ovkmi", "jt-mr4ovkmj",
    "jt-mr4ovkmk", "jt-mr4ovkml", "jt-mr4ovkmm", "jt-mr4ovkmn", "jt-mr4ovkmo",
    "jt-mr4ovkmp", "jt-mr4ovkmq", "jt-mr4ovkmr", "jt-mr4ovkms", "jt-mr4ovkmt",
    "jt-mr4ovkmu", "jt-mr4ovkmv", "jt-mr4ovkmw", "jt-mr4ovkmx", "jt-mr4ovkmy"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2026-11th-april-evening-shift/';

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
          const contentDiv = node.querySelector('.option-content') || node.children[node.children.length - 1];

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
      year: 2026,
      shift: '11 April Evening'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2026_11april_evening.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
