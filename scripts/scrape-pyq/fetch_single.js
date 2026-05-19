const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASE_URL = 'https://questions.examside.com/past-years/year-wise/jee/mht-cet/mht-cet-2024-9th-may-evening-shift/';
const slug = 'm4i0xrvm';
const filePath = path.join(__dirname, 'pyq_mht_cet_2024_9may_evening.json');

async function scrapeSingle() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Scraping URL... ${BASE_URL}${slug}`);
  await page.goto(`${BASE_URL}${slug}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('.question-solution', { timeout: 15000 }).catch(() => console.log('Solution timeout'));
  const html = await page.content();
  const $ = cheerio.load(html);

  const qHtml = $('.w-100.h-100.d-flex.flex-column.align-items-start.justify-content-start').html();
  const optionsHtml = $('.question-options').html();
  const solutionHtml = $('.question-solution').html();
  
  if (!qHtml || !optionsHtml) {
      console.error("Missing content!\nHTML snippet:", html.substring(0, 1000));
      await browser.close();
      return;
  }
  
  // Format options
  const formattedOptions = [];
  $('.question-options .row.mb-2').each((i, row) => {
    $(row).find('.col-sm-6').each((j, col) => {
      const optionContent = $(col).find('.mb-0').html();
      if (optionContent) {
        formattedOptions.push(optionContent.trim());
      }
    });
  });

  // Extract correct answer
  const correctText = $('.question-solution h6:contains("Correct Option")').next('div').find('.mb-0').text().trim();
  let correctOption = 1;
  if (correctText.startsWith('(A)') || correctText.startsWith('A')) correctOption = 1;
  else if (correctText.startsWith('(B)') || correctText.startsWith('B')) correctOption = 2;
  else if (correctText.startsWith('(C)') || correctText.startsWith('C')) correctOption = 3;
  else if (correctText.startsWith('(D)') || correctText.startsWith('D')) correctOption = 4;

  const solutionText = solutionHtml ? solutionHtml.replace(/<h6.*?<\/h6>/g, '').trim() : '';

  const qData = {
    questionText: qHtml.trim(),
    options: formattedOptions,
    correctOption: correctOption,
    solution: solutionText,
    subject: 'Physics',
    year: 2024,
    shift: '9 May Evening'
  };

  await browser.close();

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  data.unshift(qData);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log("Added Q1 successfully!");
}

scrapeSingle();
