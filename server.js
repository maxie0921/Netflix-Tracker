const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("database.db");

// Create table
db.run(`
CREATE TABLE IF NOT EXISTS shows (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 showName TEXT,
 episodeName TEXT,
 dateWatched TEXT
)
`);

// Function to import CSV (run once)
function importCSV() {
 fs.createReadStream("netflix_history.csv")
   .pipe(csv())
   .on("data", (row) => {
     const [showName, episodeName] = row.Title.split(":").map(s => s.trim());
     const dateWatched = row.Date;

     db.run(
       `INSERT INTO shows (showName, episodeName, dateWatched) VALUES (?,?,?)`,
       [showName, episodeName, dateWatched]
     );
   })
   .on("end", () => {
     console.log("CSV imported!");
   });
}

// Uncomment the next line to import CSV once
importCSV();

// Get all shows
app.get("/shows", (req, res) => {
 db.all("SELECT * FROM shows ORDER BY showName, dateWatched", (err, rows) => {
   res.json(rows);
 });
});

app.listen(3000, () => console.log("Running on http://localhost:3000"));