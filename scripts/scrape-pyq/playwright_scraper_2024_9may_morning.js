const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "m4f5iw31", "m4f5j36g", "m4f5jaa1", "m4f5j9vj", "m4f5jqil",
    "m4f5irh1", "m4f5jdsr", "m4f5j3ch", "m4f5jdbi", "m4f5irv5",
    "m4f5jqw4", "m4f5jbf8", "m4f5isvh", "m4f5jcu1", "m4f5jqlj",
    "m4f5jcwf", "m4f5j4cm", "m4f5j7sk", "m4f5jddo", "m4f5jq22",
    "m4f5irk8", "m4f5j7v3", "m4f5irmy", "m4f5jcyo", "m4f5jqyw",
    "m4f5jj61", "m4f5jbi9", "m4f5jj8i", "m4f5jdgf", "m4f5jjb6",
    "m4f5jjdt", "m4f5jl7o", "m4f5isxv", "m4f5jacx", "m4f5jdiv",
    "m4f5jroa", "m4f5jrab", "m4f5jrd1", "m4f5j04f", "m4f5jl09",
    "m4f5j9yi", "m4f5jl2w", "m4f5ja1o", "m4f5jq7c", "m4f5ire7",
    "m4f5ja4k", "m4f5jces", "m4f5jr1w", "m4f5jche", "m4f5jckl"
  ],
  "Chemistry": [
    "m4f5j074", "m4f5jd15", "m4f5jr4i", "m4f5j7id", "m4f5jq4w",
    "m4f5jla6", "m4f5jduw", "m4f5iw5t", "m4f5jlca", "m4f5irpo",
    "m4f5jd3p", "m4f5islm", "m4f5jcmz", "m4f5j7l6", "m4f5iso4",
    "m4f5jdxh", "m4f5isqp", "m4f5jbcu", "m4f5jl5c", "m4f5jqob",
    "m4f5jrrs", "m4f5jdlc", "m4f5ist7", "m4f5ja7c", "m4f5jdns",
    "m4f5jcp3", "m4f5jqdd", "m4f5jqqu", "m4f5ixd0", "m4f5jndm",
    "m4f5jdzw", "m4f5jcrb", "m4f5j26q", "m4f5jrv4", "m4f5jrxi",
    "m4f5irse", "m4f5j7xg", "m4f5jdqc", "m4f5j7nl", "m4f5jrgr",
    "m4f5jqaa", "m4f5jd6i", "m4f5jr7b", "m4f5jrks", "m4f5jj3e",
    "m4f5jqfr", "m4f5jqtj", "m4f5iydq", "m4f5j7q4", "m4f5jd9b"
  ],
  "Mathematics": [
    "m4fmp0u4", "m4fmp0ye", "m4fmp125", "m4fmp16f", "m4fmp19r",
    "m4fmpa8w", "m4fmp38f", "m4fmp3c1", "m4fmp3fl", "m4fmp3io",
    "m4fmp3lp", "m4fmp3oj", "m4fmp3rl", "m4fmp3ux", "m4fmp3xt",
    "m4fmp40y", "m4fmp44c", "m4fmp47i", "m4fmp4aj", "m4fmp4df",
    "m4fmp4gm", "m4fmp4js", "m4fmp4mm", "m4fmp4pi", "m4fmp4sn",
    "m4fmpa2e", "m4fmp6e9", "m4fmp6hs", "m4fmp6kg", "m4fmp6nj",
    "m4fmp6qp", "m4fmp6tj", "m4fmp6wp", "m4fmp6zp", "m4fmp72s",
    "m4fmp76m", "m4fmp7a6", "m4fmp7d9", "m4fmp7fy", "m4fmp7j5",
    "m4fmp7mc", "m4fmp7pd", "m4fmp7se", "m4fmp7v9", "m4fmp7yc",
    "m4fmp81d", "m4fmp84o", "m4fmp87r", "m4fmp8c4", "m4fmp8ge"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2024-9th-may-morning-shift/';

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
      shift: '9 May Morning'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2024_9may_morning.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
