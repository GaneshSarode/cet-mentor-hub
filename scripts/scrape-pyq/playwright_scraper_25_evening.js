const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "mfajjpzv", "mfajk474", "mfajjq2m", "mfajly0n", "mfajjq54",
    "mfajlz9u", "mfajldps", "mfajklx4", "mfajlzz7", "mfajk49h",
    "mfajkxbs", "mfajlk8z", "mfajlkbr", "mfajjj0y", "mfajk91z",
    "mfajldsc", "mfajkylc", "mfajl5bx", "mfajjj4k", "mfajjq7r",
    "mfajlrv4", "mfajk94n", "mfajlduw", "mfajk979", "mfajlypw",
    "mfajlhh2", "mfajlvch", "mfajlhjg", "mfajlrxk", "mfajkyob",
    "mfajkyqz", "mfajlw6j", "mfajjqac", "mfajk1ta", "mfajk4c6",
    "mfajldxz", "mfajlanw", "mfajlrzt", "mfajjj76", "mfajlhlw",
    "mfajlho5", "mfajkytu", "mfajkywj", "mfajknms", "mfajk4ex",
    "mfajm02j", "mfajle0p", "mfajk9a2", "mfajkxe9", "mfajjqco"
  ],
  "Chemistry": [
    "mfajlmry", "mfajlysp", "mfajknp9", "mfajjja3", "mfajkyz9",
    "mfajl5eb", "mfajleqa", "mfajlxbg", "mfajkooy", "mfajlvf3",
    "mfajk4hv", "mfajlaq6", "mfajlmuy", "mfajkgno", "mfajly3a",
    "mfajjvyo", "mfajk1w7", "mfajkz1i", "mfajm056", "mfajkgq2",
    "mfajm07n", "mfajkz49", "mfajm0ci", "mfajlzca", "mfajkpmt",
    "mfajl7v6", "mfajm0a4", "mfajl7xe", "mfajlxgu", "mfajlyij",
    "mfajk2uk", "mfajk4kh", "mfajlig0", "mfajlztf", "mfajlxs2",
    "mfajlesr", "mfajk2wz", "mfajlvmi", "mfajkxh1", "mfajlasl",
    "mfajk2zk", "mfajjwum", "mfajjwwx", "mfajjwza", "mfajk58i",
    "mfajlaux", "mfajkhfr", "mfajkt2r", "mfajl1nu", "mfajlyv4"
  ],
  "Mathematics": [
    "mfajlxvd", "mfajl1qv", "mfajly64", "mfajls28", "mfajlaxt",
    "mfajlmyd", "mfajln11", "mfajkxjp", "mfajjqf2", "mfajl92t",
    "mfajk32j", "mfajliiq", "mfajlb0m", "mfajkhij", "mfajls4p",
    "mfajk5aw", "mfajjx1s", "mfajlyya", "mfajkxmb", "mfajk5df",
    "mfajkxpd", "mfajkhld", "mfajm0f4", "mfajlb3d", "mfajls7g",
    "mfajlsac", "mfajlb68", "mfajk35b", "mfajlwd6", "mfajl3o4",
    "mfajk386", "mfajjmhk", "mfajjydl", "mfajk5fy", "mfajln3p",
    "mfajjygo", "mfajkho1", "mfajl3r1", "mfajjrl1", "mfajk5im",
    "mfajl95m", "mfajkt58", "mfajkxsd", "mfajkhqw", "mfajk5kw",
    "mfajk3av", "mfajjyjc", "mfajjrnt", "mfajkt80", "mfajjml1"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-25th-april-evening-shift/';

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
      shift: '25 April Evening'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2025_25_evening.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
