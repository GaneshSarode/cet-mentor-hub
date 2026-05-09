const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "m3wpj9om", "m3wpiohe", "m3wpius8", "m3wpie50", "m3wpiuu0",
    "m3wpioil", "m3wpiguh", "m3wpjau8", "m3wpie6j", "m3wpijzb",
    "m3wpigvr", "m3wpiuvp", "m3wpie86", "m3wpiuxz", "m3wpjavj",
    "m3wpjdas", "m3wpj9q5", "m3wpjdjh", "m3wpik0c", "m3wpihnw",
    "m3wpik1t", "m3wpjawh", "m3wpioju", "m3wpie9d", "m3wpjdlw",
    "m3wpim50", "m3wpj9ri", "m3wpiolj", "m3wpiuz7", "m3wpjdyv",
    "m3wpieam", "m3wpihp2", "m3wpjal9", "m3wpjdmz", "m3wpihq7",
    "m3wpjdc9", "m3wpjdkp", "m3wpiv09", "m3wpijqx", "m3wpiv1u",
    "m3wpiebv", "m3wpjaxp", "m3wpjayv", "m3wpjb06", "m3wpijs3",
    "m3wpjamy", "m3wpiomn", "m3wpionq", "m3wpingl", "m3wpiooy"
  ],
  "Chemistry": [
    "m3wpjao2", "m3wpiv3i", "m3wpje05", "m3wpje1e", "m3wpiv4u",
    "m3wpinho", "m3wpjdpu", "m3wpied6", "m3wpjdtt", "m3wpijtj",
    "m3wpibdx", "m3wpijuo", "m3wpjdg3", "m3wpifg6", "m3wpjd3p",
    "m3wpiq4f", "m3wpinis", "m3wpjdv5", "m3wpj1tl", "m3wpifhc",
    "m3wpjapf", "m3wpijvt", "m3wpijwz", "m3wpjdri", "m3wpis6d",
    "m3wpjd53", "m3wpjdss", "m3wpjaqg", "m3wpiu5n", "m3wpjdwd",
    "m3wpiuep", "m3wpjarr", "m3wpibfq", "m3wpjd6j", "m3wpjdo2",
    "m3wpiuhs", "m3wpiuny", "m3wpjdxj", "m3wpjasx", "m3wpibhr",
    "m3wpijy3", "m3wpjd7v", "m3wpjddr", "m3wpjdh8", "m3wpjd9c",
    "m3wpjdib", "m3wpiuqp", "m3wpjdf3", "m3wpj9n6", "m3wpiog9"
  ],
  "Mathematics": [
    "m3txgvad", "m3v3nghu", "m3v3nku8", "m3v3nkvf", "m3v3nmx6",
    "m3v3nl61", "m3v3nox3", "m3v3nh6f", "m3v3nh84", "m3v3nhep",
    "m3v3np5e", "m3v3nmyc", "m3v3nl75", "m3v3nl8a", "m3v3nhl5",
    "m3v3nht2", "m3v3nhyp", "m3v3nqsq", "m3v3np6f", "m3v3np7k",
    "m3v3nkwk", "m3v3nqv5", "m3v3nmol", "m3v3noyi", "m3v3nkxs",
    "m3v3nmpp", "m3v3nqmd", "m3v3nozu", "m3v3nl04", "m3v3nl18",
    "m3v3nmrw", "m3v3nqq1", "m3v3np0z", "m3v3nl2d", "m3v3np23",
    "m3v3nmsz", "m3v3nkyu", "m3v3njqr", "m3v3np34", "m3v3nl4w",
    "m3v3nmug", "m3v3njs2", "m3v3nqnm", "m3v3nqrh", "m3v3nmvh",
    "m3v3nl3l", "m3v3nqoo", "m3v3nmzk", "m3v3np47", "m3v3nqu0"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2024-2nd-may-evening-shift/';

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
      shift: '2 May Evening'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2024_2may_evening.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
