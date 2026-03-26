const express = require("express");
const puppeteer = require("puppeteer-core");

const app = express();
const PORT = process.env.PORT || 3000;

// URL base Uniqlo da cui estrarre i prodotti
const UNIQLO_URL = "https://www.uniqlo.com/it/it/men/shirts-and-polos/polo-shirts";

app.get("/uniqlo", async (req, res) => {
  let browser;

  try {
    // Avvio browser headless con Chromium
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: "/usr/bin/chromium-browser", // Render / Linux
      headless: true
    });

    const page = await browser.newPage();

    // User-Agent realistico
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("🚀 Browser aperto, navigo su Uniqlo...");

    // Vai alla pagina, attendendo network idle
    await page.goto(UNIQLO_URL, { waitUntil: "networkidle2", timeout: 30000 });

    console.log("🛍️ Pagina caricata, estraggo prodotti...");

    // Aspetta che il contenitore dei prodotti sia presente (modifica selector se cambia il DOM)
    await page.waitForSelector("div[data-testid='product-tile']", { timeout: 10000 });

    // Estrazione dei prodotti
    const products = await page.evaluate(() => {
      const items = {};
      document.querySelectorAll("div[data-testid='product-tile']").forEach(el => {
        const nameEl = el.querySelector("h3, span"); // nome prodotto
        const priceEl = el.querySelector("span[data-testid='product-price']"); // prezzo
        if (nameEl && priceEl) {
          const name = nameEl.innerText.trim();
          const price = priceEl.innerText.trim();
          items[name] = price;
        }
      });
      return items;
    });

    await browser.close();

    // Risposta JSON pulita
    res.json(products);

  } catch (error) {
    console.error("❌ ERRORE scraping:", error);
    if (browser) await browser.close();
    res.status(500).send("Errore scraping");
  }
});

app.get("/", (req, res) => {
  res.send("Uniqlo scraper attivo ✅");
});

app.listen(PORT, () => {
  console.log(`Server attivo su porta ${PORT}`);
});
