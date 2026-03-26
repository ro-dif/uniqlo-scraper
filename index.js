const express = require("express");
const puppeteer = require("puppeteer-core");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/uniqlo", async (req, res) => {
  let browser;

  try {
   browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium-browser",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  headless: true
});

    const page = await browser.newPage();

    await page.goto("https://www.uniqlo.com/it/it/", {
      waitUntil: "networkidle2",
      timeout: 15000
    });

    // ⬇️ QUI dovremo affinare il selettore dopo
    const products = await page.evaluate(() => {
      const items = {};
      
      document.querySelectorAll("div").forEach(el => {
        const text = el.innerText;

        if (text && text.includes("€")) {
          items[text.slice(0, 50)] = text.match(/[\d,]+ €/)?.[0] || "";
        }
      });

      return items;
    });

    await browser.close();

    res.json(products);

  } catch (error) {
    if (browser) await browser.close();
    res.status(500).send("Errore scraping");
  }
});

app.get("/", (req, res) => {
  res.send("Uniqlo scraper attivo");
});

app.listen(PORT, () => {
  console.log(`Server attivo su porta ${PORT}`);
});
