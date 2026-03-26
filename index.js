const express = require("express");
const puppeteer = require("puppeteer-core");

const app = express();
const PORT = process.env.PORT || 10000;

// Funzione di scraping Uniqlo
async function scrapeUniqlo() {
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium-browser", // Chromium già presente su Render
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // User agent realistico
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("🚀 Apertura pagina Uniqlo...");

    await page.goto("https://www.uniqlo.com/it/it/", {
      waitUntil: "networkidle2",
      timeout: 30000
    });

    console.log("✅ Pagina caricata, inizio scraping prodotti...");

    // Selettore più generico per prodotti
    const products = await page.evaluate(() => {
      const items = {};
      // Controlla elementi che contengono prezzi
      document.querySelectorAll("div, span, a").forEach(el => {
        const text = el.innerText.trim();
        if (text && text.includes("€")) {
          const priceMatch = text.match(/[\d,.]+ €/);
          if (priceMatch) {
            const name = text.replace(priceMatch[0], "").trim().slice(0, 50);
            items[name || "prodotto"] = priceMatch[0];
          }
        }
      });
      return items;
    });

    await browser.close();

    if (!products || Object.keys(products).length === 0) {
      throw new Error("Nessun prodotto trovato!");
    }

    console.log(`✅ Trovati ${Object.keys(products).length} prodotti`);
    return products;

  } catch (error) {
    console.error("❌ ERRORE scraping:", error.message);
    if (browser) await browser.close();
    throw error;
  }
}

// Route /uniqlo
app.get("/uniqlo", async (req, res) => {
  try {
    const data = await scrapeUniqlo();
    res.json(data);
  } catch (error) {
    res.status(500).send("Errore scraping: " + error.message);
  }
});

// Route principale
app.get("/", (req, res) => {
  res.send("Uniqlo scraper attivo 🚀");
});

app.listen(PORT, () => {
  console.log(`Server attivo su porta ${PORT}`);
});
