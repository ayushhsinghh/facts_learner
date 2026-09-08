import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  
  await page.waitForSelector('button');
  
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Browse previous discoveries')) {
      await btn.click();
      break;
    }
  }
  
  await page.waitForSelector('li h3');
  const items = await page.$$('li');
  if (items.length > 0) {
    await items[0].click();
  }
  
  await page.waitForSelector('#overview');
  const dom = await page.evaluate(() => {
    const p = document.querySelector('#overview p');
    if (!p) return null;
    return {
      outerHTML: p.outerHTML,
      textContent: p.textContent,
      childNodes: Array.from(p.childNodes).map(n => ({ type: n.nodeType, text: n.textContent }))
    };
  });
  console.log(JSON.stringify(dom, null, 2));
  
  await browser.close();
})();
