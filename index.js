const express = require("express");
const puppeteer = require("puppeteer-core");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/uniqlo", async (req, res) => {
  let browser;

  try {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true
    });

    const page = await browser.newPage();

    await page.goto("https://www.uniqlo.com/it/it/", {
      waitUntil: "networkidle2",
      timeout: 15000
    });

    const products = await page.evaluate(() => {
      const items = {};

      document.querySelectorAll("div").forEach(el => {
        const text = el.innerText;

        if (text && text.includes("€")) {
          const priceMatch = text.match(/[\d,]+ €/);
          if (priceMatch) {
            items[text.slice(0, 50)] = priceMatch[0];
          }
        }
      });

      return items;
    });

    await browser.close();

    res.json(products);

  } catch (error) {
    console.error("ERRORE:", error); // 👈 fondamentale per debug
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
