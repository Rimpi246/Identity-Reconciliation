require("dotenv").config();
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const express = require("express");
const app = express();
const port = 3000;

// Body parsing middleware to handle JSON data in the request body
app.use(express.json());

// DB Connection
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: "records",
  connectionLimit: 10, // The maximum number of connections in the pool
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database!");
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS Contact (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phoneNumber INT NOT NULL,email VARCHAR(255) NOT NULL, 
    linkedId INT DEFAULT NULL, linkedPrecedence VARCHAR(255), createdAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP, deletedAt DATETIME(3) DEFAULT NULL,
    FOREIGN KEY (linkedId) REFERENCES Contact(id)
  )
`;

connection.query(createTableQuery, (err, results) => {
  if (err) {
    console.error("Error creating table: ", err);
  } else {
    console.log('Table "Contact" created successfully.');
  }
});
// Routes

app.post("/identify", (req, res) => {
  const requestData = req.body;
  const emailD = requestData.email;
  const phoneNumberD = requestData.phoneNumber;

  const createInsertQuery = `
  INSERT INTO Contact(phoneNumber, email ) VALUES ('${phoneNumberD}', '${emailD}')`;
  connection.query(createInsertQuery, (err, results) => {
    if (err) {
      console.error("Error inserting: ", err);
    } else {
      console.log("Inserted successfully.");
    }
  });

  console.log("Received POST request:", requestData);
  res.json({ message: "POST request received successfully." });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
