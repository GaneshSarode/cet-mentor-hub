const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "jt-mr4oxpe0", "jt-mr4oxpe1", "jt-mr4oxpe2", "jt-mr4oxpe3", "jt-mr4oxpe4",
    "jt-mr4oxpe5", "jt-mr4oxpe6", "jt-mr4oxpe7", "jt-mr4oxpe8", "jt-mr4oxpe9",
    "jt-mr4oxpea", "jt-mr4oxpeb", "jt-mr4oxpec", "jt-mr4oxped", "jt-mr4oxpee",
    "jt-mr4oxpef", "jt-mr4oxpeg", "jt-mr4oxpeh", "jt-mr4oxpei", "jt-mr4oxpej",
    "jt-mr4oxpek", "jt-mr4oxpel", "jt-mr4oxpem", "jt-mr4oxpen", "jt-mr4oxpeo",
    "jt-mr4oxpep", "jt-mr4oxpeq", "jt-mr4oxper", "jt-mr4oxpes", "jt-mr4oxpet",
    "jt-mr4oxpeu", "jt-mr4oxpev", "jt-mr4oxpew", "jt-mr4oxpex", "jt-mr4oxpey",
    "jt-mr4oxpez", "jt-mr4oxpf0", "jt-mr4oxpf1", "jt-mr4oxpf2", "jt-mr4oxpf3",
    "jt-mr4oxpf4", "jt-mr4oxpf5", "jt-mr4oxpf6", "jt-mr4oxpf7", "jt-mr4oxpf8",
    "jt-mr4oxpf9", "jt-mr4oxpfa", "jt-mr4oxpfb", "jt-mr4oxpfc", "jt-mr4oxpfd"
  ],
  "Chemistry": [
    "jt-mr4oxrwk", "jt-mr4oxrwl", "jt-mr4oxrwm", "jt-mr4oxrwn", "jt-mr4oxrwo",
    "jt-mr4oxrwp", "jt-mr4oxrwq", "jt-mr4oxrwr", "jt-mr4oxrws", "jt-mr4oxrwt",
    "jt-mr4oxrwu", "jt-mr4oxrwv", "jt-mr4oxrww", "jt-mr4oxrwx", "jt-mr4oxrwy",
    "jt-mr4oxrwz", "jt-mr4oxrx0", "jt-mr4oxrx1", "jt-mr4oxrx2", "jt-mr4oxrx3",
    "jt-mr4oxrx4", "jt-mr4oxrx5", "jt-mr4oxrx6", "jt-mr4oxrx7", "jt-mr4oxrx8",
    "jt-mr4oxrx9", "jt-mr4oxrxa", "jt-mr4oxrxb", "jt-mr4oxrxc", "jt-mr4oxrxd",
    "jt-mr4oxrxe", "jt-mr4oxrxf", "jt-mr4oxrxg", "jt-mr4oxrxh", "jt-mr4oxrxi",
    "jt-mr4oxrxj", "jt-mr4oxrxk", "jt-mr4oxrxl", "jt-mr4oxrxm", "jt-mr4oxrxn",
    "jt-mr4oxrxo", "jt-mr4oxrxp", "jt-mr4oxrxq", "jt-mr4oxrxr", "jt-mr4oxrxs",
    "jt-mr4oxrxt", "jt-mr4oxrxu", "jt-mr4oxrxv", "jt-mr4oxrxw", "jt-mr4oxrxx"
  ],
  "Mathematics": [
    "jt-mr4oxtfq", "jt-mr4oxtfr", "jt-mr4oxtfs", "jt-mr4oxtft", "jt-mr4oxtfu",
    "jt-mr4oxtfv", "jt-mr4oxtfw", "jt-mr4oxtfx", "jt-mr4oxtfy", "jt-mr4oxtfz",
    "jt-mr4oxtg0", "jt-mr4oxtg1", "jt-mr4oxtg2", "jt-mr4oxtg3", "jt-mr4oxtg4",
    "jt-mr4oxtg5", "jt-mr4oxtg6", "jt-mr4oxtg7", "jt-mr4oxtg8", "jt-mr4oxtg9",
    "jt-mr4oxtga", "jt-mr4oxtgb", "jt-mr4oxtgc", "jt-mr4oxtgd", "jt-mr4oxtge",
    "jt-mr4oxtgf", "jt-mr4oxtgg", "jt-mr4oxtgh", "jt-mr4oxtgi", "jt-mr4oxtgj",
    "jt-mr4oxtgk", "jt-mr4oxtgl", "jt-mr4oxtgm", "jt-mr4oxtgn", "jt-mr4oxtgo",
    "jt-mr4oxtgp", "jt-mr4oxtgq", "jt-mr4oxtgr", "jt-mr4oxtgs", "jt-mr4oxtgt",
    "jt-mr4oxtgu", "jt-mr4oxtgv", "jt-mr4oxtgw", "jt-mr4oxtgx", "jt-mr4oxtgy",
    "jt-mr4oxtgz", "jt-mr4oxth0", "jt-mr4oxth1", "jt-mr4oxth2", "jt-mr4oxth3"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2026-11th-april-morning-shift/';

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
      year: 2026,
      shift: '11 April Morning'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2026_11april_morning.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
