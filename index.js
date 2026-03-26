const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/uniqlo", async (req, res) => {
  let browser;

  try {
    console.log("🚀 Launching browser...");
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("🌐 Opening Uniqlo homepage...");
    await page.goto("https://www.uniqlo.com/it/it/", {
      waitUntil: "networkidle2",
      timeout: 30000
    });

    console.log("🔎 Scraping products...");
    // Estrarre prodotti e prezzi
    const products = await page.evaluate(() => {
      const items = {};
      // Qui puoi affinare il selettore reale dei prodotti
      document.querySelectorAll("div").forEach(el => {
        const text = el.innerText;
        if (text && text.includes("€")) {
          const priceMatch = text.match(/[\d,.]+ €/);
          if (priceMatch) {
            items[text.slice(0, 50)] = priceMatch[0];
          }
        }
      });
      return items;
    });

    await browser.close();
    console.log("✅ Scraping completato, restituisco JSON");
    res.json(products);

  } catch (error) {
    console.error("❌ ERRORE scraping:", error);
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
