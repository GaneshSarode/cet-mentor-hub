const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const QUESTION_SLUGS = {
  "Physics": [
    "mfggm8c2", "mfggl1pd", "mfggnafj", "mfggmqow", "mfggl5bg",
    "mfggl5e3", "mfggnkl2", "mfggnhtj", "mfggnhfn", "mfggl5go",
    "mfggmu2w", "mfggl1ry", "mfgglexl", "mfggngqv", "mfgglqtd",
    "mfggnai6", "mfggmu5o", "mfggnja7", "mfggm51q", "mfggl1uf",
    "mfggm8er", "mfggmu88", "mfggl1wy", "mfggm54a", "mfggmuaw",
    "mfggl5ja", "mfggm8hd", "mfggngeu", "mfggm56p", "mfggnjvs",
    "mfggn732", "mfggnghq", "mfggmudm", "mfgglvjc", "mfgglhih",
    "mfggl20a", "mfggm8jx", "mfggnjyn", "mfggnbrg", "mfgglhkx",
    "mfggkv1a", "mfggnk1p", "mfggmpb8", "mfggl2mn", "mfggmugc",
    "mfggl2wc", "mfggnbty", "mfgglkq3", "mfgglvm7", "mfgglqvv"
  ],
  "Chemistry": [
    "mfggl83g", "mfggnhlo", "mfggm1i3", "mfggnkdd", "mfggnjjp",
    "mfggmtt7", "mfggmtvg", "mfggkqqy", "mfggnj4h", "mfggn0xx",
    "mfggmtxk", "mfggm1kn", "mfggnitb", "mfggnaah", "mfggl861",
    "mfggmu02", "mfggl55m", "mfggl58h", "mfggkqtd", "mfgglki7",
    "mfggnj76", "mfggn116", "mfggnh9a", "mfgglkkr", "mfggkqwd",
    "mfggm1ng", "mfggngko", "mfggnjmt", "mfggngbw", "mfggmqme",
    "mfggnad1", "mfggnho7", "mfggm1q1", "mfggnik8", "mfggn5oq",
    "mfggles7", "mfggmcb0", "mfggm2vn", "mfggm2za", "mfggmci2",
    "mfggm31r", "mfggmktx", "mfggkqyy", "mfggngnh", "mfggnhqr",
    "mfggl1kn", "mfgglknc", "mfggleuw", "mfggkr1g", "mfggl1mz"
  ],
  "Mathematics": [
    "mfggmyr7", "mfggkqn5", "mfggl1b3", "mfggmkm8", "mfggl90q",
    "mfggnj1s", "mfggl3ii", "mfggm79j", "mfggmkoy", "mfggloi9",
    "mfggmtht", "mfgglir8", "mfgglsc8", "mfgglokp", "mfggm7cg",
    "mfggngwu", "mfggn8pm", "mfgglsfe", "mfgglonp", "mfggmzvk",
    "mfggmzy9", "mfggm1ff", "mfggmtkr", "mfggmtnn", "mfggn00r",
    "mfggmkrh", "mfggl3pc", "mfggl3wq", "mfgglitz", "mfggnimw",
    "mfggl506", "mfggl7yd", "mfggl938", "mfggl1e0", "mfggmtql",
    "mfgglsid", "mfggmqjc", "mfggl964", "mfggl998", "mfggniq3",
    "mfggl52v", "mfgglpp9", "mfggliwu", "mfggm7fe", "mfggl80x",
    "mfggl1hd", "mfgglpru", "mfggn8se", "mfggm7ij", "mfgglpug"
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-26th-april-evening-shift/';

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
      shift: '26 April Evening'
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

  const filePath = path.join(__dirname, 'pyq_mht_cet_2025_26_evening.json');
  fs.writeFileSync(filePath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`\n✅ Done! Extracted to ${filePath}`);
}

main().catch(console.error);
