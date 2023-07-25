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

  // const createInsertQuery = `
  // INSERT INTO Contact(phoneNumber, email ) VALUES ('${phoneNumberD}', '${emailD}')`;
  // connection.query(createInsertQuery, (err, results) => {
  //   if (err) {
  //     console.error("Error inserting: ", err);
  //   } else {
  //     console.log("Inserted successfully.");
  //   }
  // });

  // Check if email already exists in the db
  connection.query(
    `SELECT * FROM Contact WHERE email='${emailD}'`,
    [emailD],
    (err, results) => {
      if (err) {
        console.log("Error occured: ", err);
      }
      if (results.length === 0) {
        // Email doesn't exist, create a new user
        connection.query(
          `INSERT INTO Contact(email,  phoneNumber, linkedPrecedence, linkedId) VALUES('${emailD}','${phoneNumberD}', NULL, NULL)`,
          [emailD, phoneNumberD],
          (err, result) => {
            if (err) {
              console.log("Error inserting new user: ", err);
            } else console.log("Email doesn't exist, new user created.");
            // res
            //   .status(200)
            //   .json({ message: "Email doesn't exist, new user created." });
          }
        );
      } else {
        // Email already exists
        const existingUser = results[0];
        const oldUserId = existingUser.id;
        connection.query(
          `UPDATE Contact SET linkedPrecedence = "Primary" WHERE id = '${oldUserId}'`,
          [oldUserId],
          (err, result) => {
            if (err) {
              console.log("Error updating user: ", err);
            } else console.log("Email already exists, old user updated.");
            connection.query(
              `INSERT INTO Contact (email, phoneNumber, linkedPrecedence, linkedId) VALUES('${emailD}','${phoneNumberD}',"Secondary", '${oldUserId}')`,
              [emailD, phoneNumberD, oldUserId],
              (err, result) => {
                if (err) {
                  console.log("Error insrting: ", err);
                } else console.log("Email already exists, new user created.");
              }
            );
          }
        );
      }
    }
  );

  // Check if phoneNumber already exists in the database
  connection.query(
    `SELECT * FROM Contact WHERE phoneNumber='${phoneNumberD}'`,
    [phoneNumberD],
    (err, results) => {
      if (err) {
        console.log("Error occured: ", err);
      }
      if (results.length === 0) {
        // Phone Number doesn't exist, create a new user
        connection.query(
          `INSERT INTO Contact(email,  phoneNumber, linkedPrecedence, linkedId) VALUES('${emailD}','${phoneNumberD}', NULL, NULL)`,
          [emailD, phoneNumberD],
          (err, result) => {
            if (err) {
              console.log("Error inserting new user: ", err);
            } else console.log("Phone Number doesn't exist, new user created.");
          }
        );
      } else {
        // phone Number already exists
        const existingUser = results[0];
        const oldUserId = existingUser.id;
        connection.query(
          `UPDATE Contact SET linkedPrecedence = "Primary" WHERE id = '${oldUserId}'`,
          [oldUserId],
          (err, result) => {
            if (err) {
              console.log("Error updating user: ", err);
            } else
              console.log("Phone Number already exists, old user updated.");
            connection.query(
              `INSERT INTO Contact (email, phoneNumber, linkedPrecedence, linkedId) VALUES('${emailD}','${phoneNumberD}',"Secondary", '${oldUserId}')`,
              [emailD, phoneNumberD, oldUserId],
              (err, result) => {
                if (err) {
                  console.log("Error insrting: ", err);
                } else
                  console.log("Phone Number already exists, new user created.");
              }
            );
          }
        );
      }
    }
  );

  console.log("Received POST request:", requestData);
  res.json({ message: "POST request received successfully." });

  // const response = {
  //   "contact":{
  //     "primaryContactId": ,
  //     "emails": [],
  //     "phoneNumbers": [],
  //     "secondaryContactIds": []
  //   }
  // }
  // res.json(response);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
