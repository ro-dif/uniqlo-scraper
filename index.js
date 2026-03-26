const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/uniqlo", async (req, res) => {
  let browser;

  try {
    console.log("🚀 Avvio browser...");
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true
    });

    const page = await browser.newPage();

    // Imposta user-agent realistico + viewport
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1280, height: 800 });
    await page.setExtraHTTPHeaders({ "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7" });

    console.log("🌐 Apro pagina Uniqlo...");
    await page.goto("https://www.uniqlo.com/it/it/", {
      waitUntil: "networkidle2",
      timeout: 30000
    });

    console.log("🔎 Inizio scraping prodotti...");

    // Selettori più realistici (da adattare al layout reale)
    const products = await page.evaluate(() => {
      const items = {};
      // Tentativo semplice: ogni div che contiene €
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

    console.log("✅ Prodotti trovati:", Object.keys(products).length);

    await browser.close();
    res.json(products);

  } catch (error) {
    console.error("❌ ERRORE SCRAPING:", error);
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
