const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/uniqlo", async (req, res) => {
  let browser;

  try {
    console.log("🚀 Lancio browser...");
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("🚀 Aperta pagina, inizio goto...");
    await page.goto("https://www.uniqlo.com/it/it/", {
      waitUntil: "networkidle2",
      timeout: 30000
    });
    console.log("✅ Pagina caricata, inizio evaluate...");

    const products = await page.evaluate(() => {
      const items = {};
      // prova a prendere solo le card dei prodotti
      document.querySelectorAll("a[href*='/it/it/product/']").forEach(el => {
        const name = el.innerText.split("\n")[0]; // primo testo come nome
        const price = el.innerText.match(/[\d,]+ €/)?.[0] || "";
        if (name && price) {
          items[name] = price;
        }
      });
      return items;
    });

    console.log("📦 Products estratti:", products);

    await browser.close();
    res.json(products);

  } catch (error) {
    console.error("Errore scraping:", error);
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
