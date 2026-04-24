const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "mezf0igx", "mezezt0k", "mezez7nz", "mezezt2w", "mezezvu9",
    "mezf0imw", "mezf04dh", "mezezlh5", "mezezt5k", "mezezvx0",
    "mezezlk4", "mezezoim", "mezezn4v", "mezezol3", "mezf0a2x",
    "mezf04g1", "mezf04ib", "mezez7qu", "mezezk15", "mezezww3",
    "mezezn7j", "mezezk3t", "mezf0is7", "mezf0jgh", "mezezd5t",
    "mezezvzj", "mezf05sq", "mezf0iv5", "mezezt8b", "mezez7ts",
    "mezezr1c", "mezezlmv", "mezez7wr", "mezf0jpc", "mezf0bxa",
    "mezeztb3", "mezf05v9", "mezeztpt", "mezezd8d", "mezezyvm",
    "mezezdb0", "mezezw23", "mezezy78", "mezez7ze", "mezezwyr",
    "mezezyyl", "mezf0c08", "mezezr3s", "mezezw4h", "mezf05xv"
  ],
  "Chemistry": [
    "mezf0jz7", "mezf0jjn", "mezf0jsk", "mezf0cwp", "mezezk6h",
    "mezf0fsg", "mezf0fv2", "mezez81y", "mezezr74", "mezf0fy2",
    "mezezw6w", "mezezy9t", "mezezlpm", "mezf0iy5", "mezf0k1q",
    "mezezk91", "mezf07vj", "mezf0h0n", "mezezz1w", "mezezx19",
    "mezf0h3i", "mezezyc6", "mezeztsh", "mezf0cz2", "mezf0ipe",
    "mezezkbe", "mezezw9k", "mezf07xt", "mezezwc0", "mezf0i4p",
    "mezf0ik6", "mezf0ial", "mezf0ja1", "mezf0d18", "mezf0j6t",
    "mezf0j15", "mezezwf3", "mezf0jdk", "mezf0801", "mezezsna",
    "mezezo7k", "mezezlrz", "mezf0jmc", "mezf0j3u", "mezf09kg",
    "mezezppa", "mezf0idp", "mezf09mn", "mezezwi1", "mezf0h5y"
  ],
  "Mathematics": [
    "mezezyf8", "mezf0d3q", "mezezoag", "mezf0h8o", "mezezgfb",
    "mezeztdv", "mezezwku", "mezezsq5", "mezezodk", "mezezyht",
    "mezezwo4", "mezezlup", "mezf0d6x", "mezezwr3", "mezf0485",
    "mezezlxj", "mezezssr", "mezezbl5", "mezezl8v", "mezezsvc",
    "mezezpsh", "mezezog9", "mezezlbs", "mezf0dan", "mezezgif",
    "mezezxwa", "mezezgl5", "mezezykn", "mezeztgl", "mezezbvp",
    "mezf0hb9", "mezezvmo", "mezezgo4", "mezf09q1", "mezezyn7",
    "mezezxz1", "mezezypv", "mezf0hdn", "mezezgrd", "mezezgtx",
    "mezf0hg6", "mezeztjo", "mezezm0m", "mezf0dd4", "mezf0jw5",
    "mezezysv", "mezf0en8", "mezf0i7h", "mezezy1s", "mezezpw6"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-22nd-april-morning-shift/';

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
      shift: '22 April Morning'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2025_22_morning.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
