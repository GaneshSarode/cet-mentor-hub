/**
 * ExamSIDE MHT CET 2025 Question Scraper
 * 
 * Uses Puppeteer to scrape all 150 questions from ExamSIDE website.
 * Navigates through pages, clicks "Check Answer" to reveal solutions,
 * and extracts structured JSON data.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// All 150 question URLs extracted from the page listing
// Chemistry: Q1-Q50, Mathematics: Q51-Q100, Physics: Q101-Q150
const QUESTION_SLUGS = {
  // Chemistry (1-50)
  chemistry: [
    'mf3ic11u', 'mf3ics04', 'mf3icrb6', 'mf3icfor', 'mf3ibkyg',
    'mf3ibq93', 'mf3icrxm', 'mf3ibxxv', 'mf3ichvd', 'mf3iby05',
    'mf3ichxm', 'mf3icrnz', 'mf3ics8a', 'mf3ibg0z', 'mf3ibmhe',
    'mf3icgc6', 'mf3icqw4', 'mf3iby30', 'mf3ibu3r', 'mf3icgeg',
    'mf3iby5i', 'mf3icrdr', 'mf3ibe65', 'mf3ibu6e', 'mf3ic8fy',
    'mf3ibl0k', 'mf3ic8ik', 'mf3icggt', 'mf3ibe8a', 'mf3ibl2u',
    'mf3ic8kx', 'mf3ibmk4', 'mf3icqf4', 'mf3ibeb3', 'mf3icpg2',
    'mf3ibu95', 'mf3iclif', 'mf3ibgzy', 'mf3icgiw', 'mf3icglc',
    'mf3ic8ng', 'mf3iclkr', 'mf3ichzv', 'mf3icln8', 'mf3ibedg',
    'mf3icqhw', 'mf3ic14c', 'mf3ic16s', 'mf3icntk', 'mf3ics2v'
  ],
  // Mathematics (1-50)
  mathematics: [
    'mf3ibjqu', 'mf3iclpx', 'mf3icj6j', 'mf3ibmmj', 'mf3icr5f',
    'mf3ibegm', 'mf3ic8pv', 'mf3ibrho', 'mf3ic8si', 'mf3ibzpm',
    'mf3ibuc1', 'mf3icpiz', 'mf3ibrkc', 'mf3icgob', 'mf3icj9d',
    'mf3ibzs8', 'mf3icqyz', 'mf3icrgm', 'mf3ic198', 'mf3ibueq',
    'mf3ibvzk', 'mf3icnvq', 'mf3ic0u0', 'mf3ibw2d', 'mf3ibuha',
    'mf3icny8', 'mf3ic0wp', 'mf3ibejz', 'mf3ibujr', 'mf3ic8v1',
    'mf3ibw4o', 'mf3ibumd', 'mf3icjce', 'mf3ibemo', 'mf3ico0w',
    'mf3ibsl2', 'mf3ic1bu', 'mf3icplx', 'mf3ibsnm', 'mf3icrrk',
    'mf3icgri', 'mf3ibep4', 'mf3icpoe', 'mf3icguj', 'mf3ibmp7',
    'mf3ibl5i', 'mf3ibup3', 'mf3iclsq', 'mf3iclvb', 'mf3icdh4'
  ],
  // Physics (1-50)
  physics: [
    'mf3ico3c', 'mf3ibb4r', 'mf3ibjtc', 'mf3icjf4', 'mf3icjhm',
    'mf3icqq1', 'mf3icsej', 'mf3icjki', 'mf3ibo1x', 'mf3iburs',
    'mf3ibl8a', 'mf3iblau', 'mf3icp8s', 'mf3icrk3', 'mf3ic2jc',
    'mf3icr24', 'mf3ibjvl', 'mf3icqn8', 'mf3ic2lt', 'mf3icqkt',
    'mf3ibtu7', 'mf3ibw7d', 'mf3ic0zd', 'mf3ics5l', 'mf3iberk',
    'mf3ickop', 'mf3icpb4', 'mf3ibtwl', 'mf3icr8i', 'mf3ibety',
    'mf3ibkvz', 'mf3ic2o9', 'mf3ibwzx', 'mf3ickr0', 'mf3ibewl',
    'mf3ibmeq', 'mf3ibx2q', 'mf3ibo4i', 'mf3ibb7o', 'mf3icqck',
    'mf3icruy', 'mf3ibbac', 'mf3icqt5', 'mf3ibq6m', 'mf3icsb8',
    'mf3icnr1', 'mf3ibtyu', 'mf3icq9k', 'mf3ibu1e', 'mf3icpdm'
  ]
};

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2025-23rd-april-morning-shift/';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function extractQuestionFromPage(page, slug, subject, questionNum) {
  const url = BASE_URL + slug;
  console.log(`[${subject} Q${questionNum}] Navigating to ${url}`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000); // Wait for MathJax to render
    
    // Close any modals/popups if present
    try {
      const closeButtons = await page.$$('button[aria-label="Close"], .modal-close, [data-dismiss="modal"]');
      for (const btn of closeButtons) {
        await btn.click().catch(() => {});
      }
    } catch (e) {}
    
    // Click "Check Answer" button to reveal the answer
    try {
      await page.waitForSelector('button', { timeout: 5000 });
      const checkAnswerBtn = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const checkBtn = buttons.find(b => b.textContent.trim().includes('Check Answer'));
        if (checkBtn) {
          checkBtn.click();
          return true;
        }
        return false;
      });
      
      if (checkAnswerBtn) {
        await delay(2000); // Wait for answer reveal animation
      }
    } catch (e) {
      console.log(`  Warning: Could not click Check Answer for Q${questionNum}`);
    }
    
    // Extract question data from the DOM
    const questionData = await page.evaluate((subj, qNum) => {
      // Helper: extract text content from an element, handling MathJax
      function getTextContent(element) {
        if (!element) return '';
        
        // Clone the element to avoid modifying the DOM
        const clone = element.cloneNode(true);
        
        // Replace MathJax containers with their aria-label (LaTeX representation)
        const mathElements = clone.querySelectorAll('mjx-container');
        mathElements.forEach(mjx => {
          const ariaLabel = mjx.getAttribute('aria-label') || '';
          const textNode = document.createTextNode(ariaLabel);
          mjx.parentNode.replaceChild(textNode, mjx);
        });
        
        // Also handle img tags (for diagrams)
        const imgs = clone.querySelectorAll('img');
        imgs.forEach(img => {
          const alt = img.getAttribute('alt') || '[image]';
          const src = img.getAttribute('src') || '';
          const textNode = document.createTextNode(`[Image: ${alt}, src: ${src}]`);
          img.parentNode.replaceChild(textNode, img);
        });
        
        return clone.textContent.trim();
      }
      
      const result = {
        question: '',
        options: { A: '', B: '', C: '', D: '' },
        correct: '',
        solution: '',
        subject: subj,
        year: 2025,
        shift: '23 April Morning'
      };
      
      try {
        // Find all question blocks on the page
        // The first question on the page is the one we want (since each URL focuses on one question)
        
        // Strategy: Find the question text
        // The question area typically has the question number and text
        // Look for option containers (role="button" divs are option choices)
        const optionButtons = document.querySelectorAll('div[role="button"]');
        
        // Group options - typically first 4 are for Q1
        const options = [];
        let correctLetter = '';
        
        optionButtons.forEach((btn) => {
          // Check if this is an option (has A, B, C, D label)
          const labelDiv = btn.querySelector('div');
          if (labelDiv) {
            const label = labelDiv.textContent.trim();
            if (['A', 'B', 'C', 'D'].includes(label)) {
              // Get the option content (sibling of label)
              const contentDiv = labelDiv.nextElementSibling;
              const optionText = contentDiv ? getTextContent(contentDiv) : '';
              options.push({ letter: label, text: optionText });
              
              // Check if this is the correct answer (green border/highlight)
              const btnClasses = btn.className || '';
              const btnHTML = btn.outerHTML || '';
              if (btnClasses.includes('green') || btnClasses.includes('correct') || 
                  btnHTML.includes('Correct Answer') || btnHTML.includes('border-green')) {
                correctLetter = label;
              }
            }
          }
        });
        
        // Only take first 4 options (for the first question on page)
        const firstFourOptions = options.slice(0, 4);
        firstFourOptions.forEach(opt => {
          result.options[opt.letter] = opt.text;
        });
        
        if (!correctLetter && options.length > 0) {
          // Try alternate detection: look for "Correct Answer" text within option area
          const allElements = document.querySelectorAll('*');
          for (const el of allElements) {
            if (el.textContent.trim() === 'Correct Answer') {
              // Find the parent option button
              let parent = el.parentElement;
              while (parent && parent.getAttribute('role') !== 'button') {
                parent = parent.parentElement;
              }
              if (parent) {
                const labelDiv = parent.querySelector('div');
                if (labelDiv) {
                  const label = labelDiv.textContent.trim();
                  if (['A', 'B', 'C', 'D'].includes(label)) {
                    correctLetter = label;
                  }
                }
              }
              break;
            }
          }
        }
        
        result.correct = correctLetter;
        
        // Extract question text
        // The question text is in a div/p before the options
        // Find the first option button and look for preceding text
        if (optionButtons.length > 0) {
          const firstOption = optionButtons[0];
          let questionEl = firstOption.previousElementSibling;
          
          // Walk back to find the question text container
          while (questionEl) {
            const text = getTextContent(questionEl);
            if (text && text.length > 10 && !text.includes('MCQ') && !text.includes('MHT CET')) {
              result.question = text;
              break;
            }
            questionEl = questionEl.previousElementSibling;
          }
          
          // If still no question found, try parent's text content
          if (!result.question) {
            const parent = firstOption.parentElement;
            if (parent) {
              const children = parent.children;
              for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child.getAttribute('role') === 'button') break;
                const text = getTextContent(child);
                if (text && text.length > 10 && !text.includes('MCQ') && !text.includes('MHT CET') && !text.includes('Single Correct')) {
                  result.question = text;
                  break;
                }
              }
            }
          }
        }
        
        // Extract explanation/solution
        // Look for "Explanation" heading
        const allText = document.body.querySelectorAll('*');
        let foundExplanation = false;
        let explanationParts = [];
        
        for (const el of allText) {
          const text = el.textContent.trim();
          if (text === 'Explanation' && (el.tagName === 'DIV' || el.tagName === 'P' || el.tagName === 'SPAN' || el.tagName === 'H2' || el.tagName === 'H3')) {
            foundExplanation = true;
            // Get the parent or next sibling for explanation content
            let explanationContainer = el.nextElementSibling || el.parentElement;
            if (explanationContainer) {
              result.solution = getTextContent(explanationContainer);
            }
            break;
          }
        }
        
        // If explanation is too short, try getting a larger container
        if (result.solution.length < 20) {
          const explanationDivs = document.querySelectorAll('[class*="explanation"], [class*="solution"]');
          for (const div of explanationDivs) {
            const text = getTextContent(div);
            if (text.length > 20) {
              result.solution = text;
              break;
            }
          }
        }
        
      } catch (error) {
        result.error = error.message;
      }
      
      return result;
    }, subject, questionNum);
    
    return questionData;
    
  } catch (error) {
    console.error(`  Error scraping Q${questionNum}: ${error.message}`);
    return {
      question: `ERROR: ${error.message}`,
      options: { A: '', B: '', C: '', D: '' },
      correct: '',
      solution: '',
      subject: subject,
      year: 2025,
      shift: '23 April Morning',
      error: error.message
    };
  }
}

async function main() {
  console.log('=== ExamSIDE MHT CET 2025 Scraper ===');
  console.log('Starting Puppeteer...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  
  // Block images/fonts to speed up loading
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const resourceType = req.resourceType();
    if (['font'].includes(resourceType)) {
      req.abort();
    } else {
      req.continue();
    }
  });
  
  const allQuestions = [];
  let globalIndex = 1;
  
  // Scrape Chemistry (Q1-Q50)
  console.log('\n--- Scraping Chemistry Questions (1-50) ---');
  for (let i = 0; i < QUESTION_SLUGS.chemistry.length; i++) {
    const data = await extractQuestionFromPage(
      page, 
      QUESTION_SLUGS.chemistry[i], 
      'Chemistry', 
      i + 1
    );
    data._index = globalIndex++;
    data._subjectIndex = i + 1;
    allQuestions.push(data);
    console.log(`  ✓ Chemistry Q${i + 1}: ${data.question?.substring(0, 60)}... | Correct: ${data.correct}`);
  }
  
  // Scrape Mathematics (Q51-Q100)
  console.log('\n--- Scraping Mathematics Questions (1-50) ---');
  for (let i = 0; i < QUESTION_SLUGS.mathematics.length; i++) {
    const data = await extractQuestionFromPage(
      page, 
      QUESTION_SLUGS.mathematics[i], 
      'Mathematics', 
      i + 1
    );
    data._index = globalIndex++;
    data._subjectIndex = i + 1;
    allQuestions.push(data);
    console.log(`  ✓ Mathematics Q${i + 1}: ${data.question?.substring(0, 60)}... | Correct: ${data.correct}`);
  }
  
  // Scrape Physics (Q101-Q150)
  console.log('\n--- Scraping Physics Questions (1-50) ---');
  for (let i = 0; i < QUESTION_SLUGS.physics.length; i++) {
    const data = await extractQuestionFromPage(
      page, 
      QUESTION_SLUGS.physics[i], 
      'Physics', 
      i + 1
    );
    data._index = globalIndex++;
    data._subjectIndex = i + 1;
    allQuestions.push(data);
    console.log(`  ✓ Physics Q${i + 1}: ${data.question?.substring(0, 60)}... | Correct: ${data.correct}`);
  }
  
  await browser.close();
  
  // Save output
  const outputPath = path.join(__dirname, 'mht_cet_2025_23apr_morning.json');
  fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2), 'utf8');
  console.log(`\n✅ Saved ${allQuestions.length} questions to ${outputPath}`);
  
  // Print summary
  const chemCount = allQuestions.filter(q => q.subject === 'Chemistry' && q.correct).length;
  const mathCount = allQuestions.filter(q => q.subject === 'Mathematics' && q.correct).length;
  const physCount = allQuestions.filter(q => q.subject === 'Physics' && q.correct).length;
  console.log(`\n📊 Summary:`);
  console.log(`   Chemistry: ${chemCount}/50 with answers`);
  console.log(`   Mathematics: ${mathCount}/50 with answers`);
  console.log(`   Physics: ${physCount}/50 with answers`);
  console.log(`   Total: ${chemCount + mathCount + physCount}/150`);
}

main().catch(console.error);
