const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "m4mbyunw", "m4mbyvta", "m4mbyvir", "m4mbyvjv", "m4npinxn",
    "m4npi9df", "m4npie0f", "m4npie3a", "m4npipny", "m4npix7p",
    "m4npi9y7", "m4npiwrt", "m4npilb9", "m4npifrf", "m4npileo",
    "m4npicf8", "m4npix1g", "m4npi9h0", "m4npiizy", "m4npio5s",
    "m4npicih", "m4npij32", "m4npibxz", "m4npipqn", "m4npifaa",
    "m4npilvq", "m4npili7", "m4npifu6", "m4npij6n", "m4npie6u",
    "m4npilye", "m4npiwdg", "m4npixha", "m4npifd8", "m4npiwuz",
    "m4npiclp", "m4npiptk", "m4npifww", "m4npipwe", "m4npic1s",
    "m4npifzp", "m4npig2d", "m4npicpi", "m4npipe3", "m4npillc",
    "m4npixdt", "m4npipzj", "m4npiwoh", "m4npig56", "m4npiffy"
  ],
  "Chemistry": [
    "m4lgbm67", "m4lgbm7e", "m4lgbm8v", "m4lgbm9y", "m4lgbmbl",
    "m4lgbmdr", "m4lgbmeu", "m4lgbmg6", "m4lgbmhd", "m4lgbmip",
    "m4lgbtr1", "m4lgbts3", "m4lgbpsq", "m4lgbpu4", "m4lgbpv5",
    "m4lgbpwc", "m4lgbpxc", "m4lgbpyd", "m4lgbtt7", "m4lgbr1e",
    "m4lgbr2p", "m4lgbtop", "m4lgbskj", "m4lgbtng", "m4lgbtiq",
    "m4lgbtju", "m4lgbtkv", "m4mbyvuh", "m4mbyl3e", "m4mbyvnq",
    "m4mbylt6", "m4mbyvmj", "m4mbyvor", "m4mbyopz", "m4mbyork",
    "m4mbyost", "m4mbyou0", "m4mbyov5", "m4mbyow5", "m4mbyox1",
    "m4mbyoy4", "m4mbyoz6", "m4mbyp0e", "m4mbyvvc", "m4mbyvq5",
    "m4mbytqp", "m4mbytrq", "m4mbytst", "m4mbytu0", "m4mbyvs0"
  ],
  "Mathematics": [
    "m4kw7k3c", "m4kw7oim", "m4kw7kj1", "m4kw7ofz", "m4kw7r4h",
    "m4kw7rc0", "m4kw7k9y", "m4kw7r7p", "m4kw7kb1", "m4kw7kc9",
    "m4kw7re9", "m4kw7k6r", "m4kw7kk5", "m4kw7swq", "m4kw7st4",
    "m4kw7koj", "m4kw7k4e", "m4kw7sua", "m4kw7kpp", "m4kw7ojq",
    "m4kw7rf8", "m4kw7sy7", "m4lgbjil", "m4lgbjkj", "m4lgbjms",
    "m4lgbjnu", "m4lgbjp8", "m4lgbjqe", "m4lgbjrq", "m4lgbjt7",
    "m4lgbjue", "m4lgbjvn", "m4lgbjwr", "m4lgbjxz", "m4lgbjz8",
    "m4lgbk0e", "m4lgbk1n", "m4lgbk2n", "m4lgbk3t", "m4lgbk4v",
    "m4lgbk5z", "m4lgbk79", "m4lgbk8c", "m4lgbk9k", "m4lgbkap",
    "m4lgbkbt", "m4lgbkd0", "m4lgbtpu", "m4lgbm3n", "m4lgbm4y"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2024-10th-may-evening-shift/';

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
      shift: '10 May Evening'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2024_10may_evening.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
