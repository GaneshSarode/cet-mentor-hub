const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "mfajjmnz", "mfajk5nj", "mfajlscm", "mfajlb8r", "mfajjmqo",
    "mfajl3tg", "mfajktau", "mfajkxvt", "mfajjmte", "mfajk3dg",
    "mfajk9ck", "mfajlzil", "mfajl98c", "mfajlseo", "mfajkhto",
    "mfajk5qa", "mfajjrqc", "mfajlsgv", "mfajlevj", "mfajkxyt",
    "mfajky1h", "mfajlwie", "mfajjmw6", "mfajly9m", "mfajk3g4",
    "mfajley5", "mfajktdi", "mfajjmz6", "mfajlwp6", "mfajlcbr",
    "mfajktg8", "mfajky46", "mfajl9b5", "mfajjn25", "mfajkb5d",
    "mfajkhwh", "mfajljpp", "mfajjylu", "mfajloca", "mfajl4to",
    "mfajl9do", "mfajjyoj", "mfajlsjj", "mfajl9gi", "mfajk3j0",
    "mfajl4vx", "mfajlsly", "mfajktiq", "mfajkhyw", "mfajl9jc"
  ],
  "Chemistry": [
    "mfajjyr1", "mfajlwx7", "mfajk3lx", "mfajlof0", "mfajk5t7",
    "mfajk5vk", "mfajlvp9", "mfajjov5", "mfajlvha", "mfajlpv3",
    "mfajktlc", "mfajlcdz", "mfajjytp", "mfajlxyb", "mfajky6x",
    "mfajky9f", "mfajkto6", "mfajlzfu", "mfajm0hr", "mfajkb7w",
    "mfajlsod", "mfajl4yn", "mfajlsqs", "mfajk3og", "mfajlz14",
    "mfajlxln", "mfajjoxi", "mfajlst4", "mfajlh6i", "mfajktr3",
    "mfajk5xn", "mfajl515", "mfajlh9a", "mfajlsvk", "mfajljs3",
    "mfajlzla", "mfajlz3s", "mfajk3qz", "mfajkyc3", "mfajlz6u",
    "mfajlzw6", "mfajjzpb", "mfajlvju", "mfajktti", "mfajk7pz",
    "mfajkyff", "mfajk7t6", "mfajljur", "mfajk3ts", "mfajlsxz"
  ],
  "Mathematics": [
    "mfajlhbt", "mfajlag6", "mfajljxc", "mfajlzny", "mfajlrn8",
    "mfajlxom", "mfajljzp", "mfajkksb", "mfajlrpx", "mfajl53t",
    "mfajk3wb", "mfajlk2x", "mfajlt0j", "mfajlcgy", "mfajlvz0",
    "mfajkyin", "mfajlhel", "mfajlrsn", "mfajlylu", "mfajk3yw",
    "mfajjuut", "mfajk41p", "mfajkcyy", "mfajk0ua", "mfajldka",
    "mfajlzqt", "mfajk0x2", "mfajlx1k", "mfajlv9g", "mfajlty4",
    "mfajlu0t", "mfajlycn", "mfajjuxk", "mfajkusr", "mfajkd1x",
    "mfajkuvd", "mfajlair", "mfajlu39", "mfajk44j", "mfajk0zu",
    "mfajlk5p", "mfajjv0v", "mfajjv3w", "mfajkd4t", "mfajlyfp",
    "mfajlu5v", "mfajl56p", "mfajlald", "mfajl59g", "mfajldna"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-26th-april-morning-shift/';

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
      shift: '26 April Morning'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2025_26_morning.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
