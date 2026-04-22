const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-20th-april-morning-shift/';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeQuestion(page, url, subject) {
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await delay(2000); 
  
  try {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('Check Answer')) {
        await btn.click();
        await delay(1000);
        break;
      }
    }
  } catch (e) {
    console.log('Skipped Check Answer button click');
  }

    const result = await page.evaluate((subject) => {
    function getHTML(element) {
      if (!element) return '';
      const clone = element.cloneNode(true);
      const mmls = clone.querySelectorAll('mjx-assistive-mml');
      mmls.forEach(m => m.remove());
      return clone.innerHTML.trim();
    }

    const mainComponent = document.querySelector('.question-component') || document.body;
    const questionNodes = mainComponent.querySelectorAll('.question');
    const questionText = questionNodes.length > 0 ? getHTML(questionNodes[0]) : '';

    const options = { A: '', B: '', C: '', D: '' };
    let correctLetter = '';
    
    const optionNodes = mainComponent.querySelectorAll('div[role="button"]');
    optionNodes.forEach(node => {
      const labelDiv = node.querySelector('div'); 
      if (labelDiv) {
        const label = labelDiv.textContent.trim();
        if (['A', 'B', 'C', 'D'].includes(label)) {
          const children = Array.from(node.children);
          const contentDiv = children.find(child => (child.className || '').includes('grow')) || children[children.length - 1];

          options[label] = contentDiv ? getHTML(contentDiv) : '';
          
          const nodeHTML = node.outerHTML || '';
          const nodeClass = node.className || '';
          if (nodeHTML.includes('green') || nodeClass.includes('green') || nodeHTML.includes('Correct Answer') || node.textContent.includes('Correct Answer')) {
            correctLetter = label;
          }
        }
      }
    });

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
      correct: correctLetter || 'A', 
      solution: solutionText,
      subject: subject,
      year: 2025,
      shift: '20 April Morning'
    };
  }, subject);

  return result;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const targetSlug = 'met14tfs';
  const url = BASE_URL + targetSlug;
  const subject = 'Chemistry';

  console.log(`Scraping ${url}...`);
  const data = await scrapeQuestion(page, url, subject);
  
  await browser.close();

  // Read existing json and inject it
  const filePath = path.join(__dirname, 'pyq_mht_cet_2025_20_morning.json');
  if (fs.existsSync(filePath)) {
     const raw = fs.readFileSync(filePath, 'utf-8');
     const questions = JSON.parse(raw);
     questions.push(data);
     fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf-8');
     console.log('Successfully injected the missing question. Total:', questions.length);
  } else {
     fs.writeFileSync(path.join(__dirname, 'missing.json'), JSON.stringify([data], null, 2), 'utf-8');
     console.log('Saved to missing.json');
  }
}

main().catch(console.error);
