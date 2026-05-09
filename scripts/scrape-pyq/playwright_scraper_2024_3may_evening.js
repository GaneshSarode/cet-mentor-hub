const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "m47xyrtr", "m47xyrww", "m47xyrzn", "m47xz88u", "m47xz85h",
    "m47xyv2v", "m47xyv5k", "m47xyv89", "m47xyvaw", "m47xyve7",
    "m47xyvh3", "m47xyvjq", "m47xyvme", "m47xyvoz", "m47xyvrh",
    "m47xyvu0", "m47xyvws", "m47xyvzd", "m47xyw1y", "m47xz7wl",
    "m47xyxa4", "m47xyxd3", "m47xyxfy", "m47xyxid", "m47xz8bt",
    "m47xyz3m", "m47xz7ze", "m47xz0ed", "m47xz0gz", "m47xz0jr",
    "m47xz0mm", "m47xz0pn", "m47xz0sf", "m47xz0v1", "m47xz0xp",
    "m47xz10b", "m47xz12x", "m47xz15m", "m47xz7tl", "m47xz28z",
    "m47xz2bp", "m47xz2ef", "m47xz2gr", "m47xz2j8", "m47xz82f",
    "m47xz4ys", "m47xz51e", "m47xz53w", "m47xz56g", "m47xz8ey"
  ],
  "Chemistry": [
    "m49oocm4", "m49oorhd", "m49op4ex", "m49ooek5", "m49oocn4",
    "m49ooj18", "m49oosqi", "m49op4cl", "m49ook37", "m49op4vr",
    "m49oofzr", "m49op494", "m49ooceo", "m49oocoo", "m49op4nt",
    "m49op3uw", "m49ooo8j", "m49op43o", "m49op4pg", "m49oog0v",
    "m49oo2og", "m49ooo9q", "m49oooar", "m49op4ke", "m49oo2pl",
    "m49oocpq", "m49oocfp", "m4a3nhrj", "m4a3nk48", "m4a3nhw7",
    "m4a3nk9n", "m4a3nafx", "m4a3n8wa", "m4a3njuq", "m4a3njw7",
    "m4a3n6fl", "m4a3nk16", "m4a3n67y", "m4a3nhsv", "m4a3njk4",
    "m4a3nk65", "m4a3njoq", "m4a3n8y5", "m4a3njxw", "m4a3n6p1",
    "m4a3njdq", "m4a3n6hr", "m4a3n6j9", "m4a3nbhy", "m4a3nbjk"
  ],
  "Mathematics": [
    "m4a3njq4", "m4a3njru", "m4a3n6qu", "m4a3nd7s", "m4a3nbl3",
    "m4a3njt9", "m4a3nhmn", "m4a3nbmo", "m4a3nhpx", "m4a3njf9",
    "m4a3nk2o", "m4a3n8zl", "m4a3n6b2", "m4a3nk7u", "m4a3n6e8",
    "m4a3njgq", "m4a3n6l1", "m4a3nbok", "m4a3nhob", "m4a3nhuq",
    "m4a3njlh", "m4a3njna", "m4a3n6n3", "m4a3njik", "m4atnm9f",
    "m4atnmzf", "m4atnlrl", "m4atnmmg", "m4atnmeb", "m4atnwoo",
    "m4atnmb1", "m4atnmup", "m4atnmo2", "m4atnwy9", "m4atnp1v",
    "m4atnwwm", "m4atnm7l", "m4atnmjc", "m4atnp3h", "m4atnltx",
    "m4atnwqd", "m4atnm60", "m4atnwrq", "m4atnmps", "m4atnm0k",
    "m4atnwtb", "m4atnmrc", "m4atnmcq", "m4atnm22", "m4atnp54"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2024-3rd-may-evening-shift/';

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
      shift: '3 May Evening'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2024_3may_evening.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
