const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

// Define the route for id + productBrand URLs
app.get("/:id([0-9]+):productBrand", (req, res) => {
  res.sendFile("product-detail.html", { root: path.join(__dirname, "public") });
});

//api calls

// Define the route to fetch the stock price by SKU
app.get("/api/stockprice/:sku", (req, res) => {
  const sku = req.params.sku;
  const stockPricePath = path.join(__dirname, "public", "stock-price.json");

  // Read the stock price file
  fs.readFile(stockPricePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error reading stock price" });
      return;
    }

    try {
      const stockPrices = JSON.parse(data);
      const stockPrice = stockPrices[sku];

      if (stockPrice) {
        res.json(stockPrice);
      } else {
        res.status(404).json({ error: "Stock price not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error parsing stock price" });
    }
  });
});

// Define the route to fetch all products
app.get("/api/products", (req, res) => {
  const productsPath = path.join(__dirname, "public", "products.json");

  // Read the products file
  fs.readFile(productsPath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error reading products" });
      return;
    }

    try {
      const products = JSON.parse(data);
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error parsing products" });
    }
  });
});
app.get("/api/products/:id", (req, res) => {
  const productId = req.params.id;
  const skuCode = req.query.sku;
  console.log(skuCode);
  const productsPath = path.join(__dirname, "public", "products.json");
  const stockPricePath = path.join(__dirname, "public", "stock-price.json");

  // Read the products file
  fs.readFile(productsPath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error reading products" });
      return;
    }

    try {
      const products = JSON.parse(data);
      const product = products.filter((product) => product.id == productId);

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      // Read the stock price file
      fs.readFile(stockPricePath, "utf8", (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Error reading stock price" });
          return;
        }

        try {
          const stockPrices = JSON.parse(data);

          const sku = skuCode || product[0].skus[0].code; // Use provided skuCode if available, otherwise use the first sku from the product
          const stockPrice = stockPrices[sku];

          if (stockPrice) {
            product[0].price = stockPrice.price;
            product[0].stock = stockPrice.stock;
          }
          res.json(product);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Error parsing stock price" });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error parsing products" });
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
