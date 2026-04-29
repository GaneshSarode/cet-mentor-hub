const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "mf67q5ut", "mf67pjz7", "mf67p04c", "mf67pk1r", "mf67q85b",
    "mf67rbey", "mf67rbhk", "mf67rhni", "mf67ptyq", "mf67qzq5",
    "mf67r79a", "mf67q5x6", "mf67rcvb", "mf67rgpp", "mf67pk4b",
    "mf67q5zo", "mf67rfoe", "mf67rfzd", "mf67qzst", "mf67qzuw",
    "mf67rcxn", "mf67q625", "mf67qzxo", "mf67q658", "mf67rfce",
    "mf67rd0k", "mf67p7xn", "mf67rgdh", "mf67p80e", "mf67rd33",
    "mf67q67r", "mf67r007", "mf67pr60", "mf67qfmn", "mf67pu1p",
    "mf67rg7s", "mf67q3zc", "mf67r4td", "mf67q6a8", "mf67pu4b",
    "mf67q6dj", "mf67pmg8", "mf67rd5j", "mf67r9ww", "mf67rgt5",
    "mf67r02s", "mf67rfij", "mf67pmin", "mf67r4we", "mf67rbk7"
  ],
  "Chemistry": [
    "mf67r9zb", "mf67ri43", "mf67q41f", "mf67rf45", "mf67p2d0",
    "mf67pml5", "mf67p2fe", "mf67qfp3", "mf67riei", "mf67rbmi",
    "mf67rfqx", "mf67q887", "mf67r05e", "mf67prfk", "mf67q8at",
    "mf67pmns", "mf67rbp1", "mf67prmi", "mf67rhwd", "mf67rhad",
    "mf67r5li", "mf67prvo", "mf67rbrt", "mf67pg3r", "mf67ps3y",
    "mf67r5ob", "mf67rihm", "mf67ri6t", "mf67p2io", "mf67ps9h",
    "mf67rikx", "mf67qb33", "mf67ra2n", "mf67rh54", "mf67qgts",
    "mf67rbua", "mf67rf6t", "mf67qgwk", "mf67psdo", "mf67q6g2",
    "mf67r5qs", "mf67q6ie", "mf67rg2i", "mf67p836", "mf67q6l4",
    "mf67p85q", "mf67pg60", "mf67pg8b", "mf67rioe", "mf67pgax"
  ],
  "Mathematics": [
    "mf67rb3j", "mf67rb6f", "mf67pju8", "mf67q5gw", "mf67ozw9",
    "mf67rga9", "mf67q20t", "mf67pdnf", "mf67q5jq", "mf67pouf",
    "mf67qx6n", "mf67rb96", "mf67qfef", "mf67rch1", "mf67q5mt",
    "mf67qx99", "mf67rcjq", "mf67pdqa", "mf67ozz3", "mf67qxca",
    "mf67rflp", "mf67pttj", "mf67rcme", "mf67q81j", "mf67ptw6",
    "mf67p7rh", "mf67poww", "mf67rcpr", "mf67p7uu", "mf67qjsh",
    "mf67qfh3", "mf67pjwt", "mf67pdsx", "mf67qjv6", "mf67qfjq",
    "mf67rcsd", "mf67rbc3", "mf67qxf2", "mf67qjya", "mf67q5ph",
    "mf67r4ql", "mf67q5rv", "mf67rh25", "mf67qk16", "mf67qk44",
    "mf67q33c", "mf67qxht", "mf67pozq", "mf67p01y", "mf67r76p"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-25th-april-morning-shift/';

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
      shift: '25 April Morning'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2025_25_morning.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
