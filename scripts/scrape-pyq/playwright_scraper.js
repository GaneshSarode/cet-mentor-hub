const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Extracted URLs for the 150 questions in the shift
const QUESTION_SLUGS = {
  Chemistry: [
    'mf3ic11u', 'mf3ics04', 'mf3icrb6', 'mf3icfor', 'mf3ibkyg', 'mf3ibq93', 'mf3icrxm', 'mf3ibxxv', 'mf3ichvd', 'mf3iby05',
    'mf3ichxm', 'mf3icrnz', 'mf3ics8a', 'mf3ibg0z', 'mf3ibmhe', 'mf3icgc6', 'mf3icqw4', 'mf3iby30', 'mf3ibu3r', 'mf3icgeg',
    'mf3iby5i', 'mf3icrdr', 'mf3ibe65', 'mf3ibu6e', 'mf3ic8fy', 'mf3ibl0k', 'mf3ic8ik', 'mf3icggt', 'mf3ibe8a', 'mf3ibl2u',
    'mf3ic8kx', 'mf3ibmk4', 'mf3icqf4', 'mf3ibeb3', 'mf3icpg2', 'mf3ibu95', 'mf3iclif', 'mf3ibgzy', 'mf3icgiw', 'mf3icglc',
    'mf3ic8ng', 'mf3iclkr', 'mf3ichzv', 'mf3icln8', 'mf3ibedg', 'mf3icqhw', 'mf3ic14c', 'mf3ic16s', 'mf3icntk', 'mf3ics2v'
  ],
  Mathematics: [
    'mf3ibjqu', 'mf3iclpx', 'mf3icj6j', 'mf3ibmmj', 'mf3icr5f', 'mf3ibegm', 'mf3ic8pv', 'mf3ibrho', 'mf3ic8si', 'mf3ibzpm',
    'mf3ibuc1', 'mf3icpiz', 'mf3ibrkc', 'mf3icgob', 'mf3icj9d', 'mf3ibzs8', 'mf3icqyz', 'mf3icrgm', 'mf3ic198', 'mf3ibueq',
    'mf3ibvzk', 'mf3icnvq', 'mf3ic0u0', 'mf3ibw2d', 'mf3ibuha', 'mf3icny8', 'mf3ic0wp', 'mf3ibejz', 'mf3ibujr', 'mf3ic8v1',
    'mf3ibw4o', 'mf3ibumd', 'mf3icjce', 'mf3ibemo', 'mf3ico0w', 'mf3ibsl2', 'mf3ic1bu', 'mf3icplx', 'mf3ibsnm', 'mf3icrrk',
    'mf3icgri', 'mf3ibep4', 'mf3icpoe', 'mf3icguj', 'mf3ibmp7', 'mf3ibl5i', 'mf3ibup3', 'mf3iclsq', 'mf3iclvb', 'mf3icdh4'
  ],
  Physics: [
    'mf3ico3c', 'mf3ibb4r', 'mf3ibjtc', 'mf3icjf4', 'mf3icjhm', 'mf3icqq1', 'mf3icsej', 'mf3icjki', 'mf3ibo1x', 'mf3iburs',
    'mf3ibl8a', 'mf3iblau', 'mf3icp8s', 'mf3icrk3', 'mf3ic2jc', 'mf3icr24', 'mf3ibjvl', 'mf3icqn8', 'mf3ic2lt', 'mf3icqkt',
    'mf3ibtu7', 'mf3ibw7d', 'mf3ic0zd', 'mf3ics5l', 'mf3iberk', 'mf3ickop', 'mf3icpb4', 'mf3ibtwl', 'mf3icr8i', 'mf3ibety',
    'mf3ibkvz', 'mf3ic2o9', 'mf3ibwzx', 'mf3ickr0', 'mf3ibewl', 'mf3ibmeq', 'mf3ibx2q', 'mf3ibo4i', 'mf3ibb7o', 'mf3icqck',
    'mf3icruy', 'mf3ibbac', 'mf3icqt5', 'mf3ibq6m', 'mf3icsb8', 'mf3icnr1', 'mf3ibtyu', 'mf3icq9k', 'mf3ibu1e', 'mf3icpdm'
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-23rd-april-morning-shift/';

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

  // Extract the data using browser-side evaluation
  const result = await page.evaluate((subject) => {
    // Helper to get text correctly replacing MathJax nodes with their aria-label (Latex)
    function cleanText(element) {
      if (!element) return '';
      const clone = element.cloneNode(true);
      const mathElements = clone.querySelectorAll('mjx-container');
      mathElements.forEach(mjx => {
        const ariaLabel = mjx.getAttribute('aria-label') || '';
        const textNode = document.createTextNode(ariaLabel);
        mjx.parentNode.replaceChild(textNode, mjx);
      });
      // Try resolving images if any
      const imgs = clone.querySelectorAll('img');
      imgs.forEach(img => {
        const textNode = document.createTextNode(`[Image: ${img.src}]`);
        img.parentNode.replaceChild(textNode, img);
      });
      return clone.textContent.trim().replace(/\s+/g, ' ');
    }

    let questionText = '';
    const options = { A: '', B: '', C: '', D: '' };
    let correctLetter = '';
    let solutionText = '';

    // Options extraction
    const optionNodes = document.querySelectorAll('div[role="button"]');
    optionNodes.forEach(node => {
      const labelDiv = node.querySelector('div');
      if (labelDiv) {
        const label = labelDiv.textContent.trim();
        if (['A', 'B', 'C', 'D'].includes(label)) {
          const contentDiv = labelDiv.nextElementSibling;
          options[label] = contentDiv ? cleanText(contentDiv) : '';
          
          // Determine if correct
          const nodeHTML = node.outerHTML;
          if (nodeHTML.includes('green') || nodeHTML.includes('Correct Answer') || node.className.includes('green')) {
            correctLetter = label;
          }
        }
      }
    });

    // Question extraction (Find the main text blocks above the options)
    if (optionNodes.length > 0) {
      let prev = optionNodes[0].previousElementSibling;
      while (prev) {
        let text = cleanText(prev);
        if (text.length > 15 && !text.includes('MCQ')) {
          questionText = text;
          break;
        }
        prev = prev.previousElementSibling;
      }
    }

    // Solution extraction
    const allEls = document.querySelectorAll('*');
    for (const el of allEls) {
      if (el.textContent.trim() === 'Explanation' || el.textContent.trim() === 'Solution') {
        const explanationContainer = el.nextElementSibling || el.parentElement;
        if (explanationContainer) {
          solutionText = cleanText(explanationContainer);
        }
        break;
      }
    }

    return {
      question: questionText,
      options,
      correct: correctLetter,
      solution: solutionText,
      subject: subject,
      year: 2025,
      shift: '23 April Morning'
    };
  }, subject);

  return result;
}

async function main() {
  console.log('Launching browser window... (keep it open so it works!)');
  
  // We launch visually (headless: false) so you can see it and it successfully bypasses bot-checks
  const browser = await chromium.launch({ headless: false });
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2025_morning.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
