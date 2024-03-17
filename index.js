const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();

// middleware area
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./dua_main.sqlite");

// Route to get all data
app.get("/category", (req, res) => {
  const sql = "SELECT * FROM category"; // Replace 'your_table_name' with your actual table name

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

//get sub-category of a single category
app.get("/specific-sub-category/:categoryId", (req, res) => {
  const categoryId = req.params.categoryId;

  const sql = `
    SELECT sc.subcat_id, sc.subcat_name_bn, sc.subcat_name_en, sc.no_of_dua,
           d.dua_id, d.dua_name_bn, d.dua_name_en, d.top_bn, d.top_en,
           d.dua_arabic, d.dua_indopak, d.clean_arabic, d.transliteration_bn,
           d.transliteration_en, d.translation_bn, d.translation_en,
           d.bottom_bn, d.bottom_en, d.refference_bn, d.refference_en, d.audio
    FROM sub_category sc
    LEFT JOIN dua d ON sc.subcat_id = d.subcat_id
    WHERE sc.cat_id = ?
  `;

  db.all(sql, [categoryId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Grouping data by subcategories
    const subcategories = {};
    rows.forEach((row) => {
      if (!subcategories[row.subcat_id]) {
        subcategories[row.subcat_id] = {
          subcat_id: row.subcat_id,
          subcat_name_bn: row.subcat_name_bn,
          subcat_name_en: row.subcat_name_en,
          no_of_dua: row.no_of_dua,
          duas: [],
        };
      }
      if (row.dua_id) {
        subcategories[row.subcat_id].duas.push({
          dua_id: row.dua_id,
          dua_name_bn: row.dua_name_bn,
          dua_name_en: row.dua_name_en,
          top_bn: row.top_bn,
          top_en: row.top_en,
          dua_arabic: row.dua_arabic,
          dua_indopak: row.dua_indopak,
          clean_arabic: row.clean_arabic,
          transliteration_bn: row.transliteration_bn,
          transliteration_en: row.transliteration_en,
          translation_bn: row.translation_bn,
          translation_en: row.translation_en,
          bottom_bn: row.bottom_bn,
          bottom_en: row.bottom_en,
          refference_bn: row.refference_bn,
          refference_en: row.refference_en,
          audio: row.audio,
        });
      }
    });

    res.json(Object.values(subcategories));
  });
});

//get duas of a single category
// Route to get duas for a specific category and subcategory
app.get("/duas/:categoryId", (req, res) => {
  const categoryId = req.params.categoryId;
  const sql = `
    SELECT *
    FROM dua
    WHERE cat_id = ?
  `;

  db.all(sql, [categoryId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

// Route to get all data
app.get("/duas", (req, res) => {
  const sql = "SELECT * FROM dua"; // Replace 'your_table_name' with your actual table name

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
