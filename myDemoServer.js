//import { MongoClient } from "mongodb";
const { MongoClient } = require("mongodb");
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 6543;
const dbName = "myDemoDb"
const colName = "myDemoCollection"

app.use(bodyParser.urlencoded({ extended: true }));

app.post("/submit", async(req, res) => {
  console.log(`${req.body.name}`);
  myname = `${req.body.name}`;
  run(myname).catch(console.dir)
  res.redirect('/');
});

app.post("/display", async(req,res) => {
  try {
    await client.connect();
    const mydatabase = client.db(dbName);
    const mycollection = mydatabase.collection(colName);
    const data = await mycollection.find().toArray();  // Fetch all data from collection

    res.write('<h1> Display Database </h1>')
    res.write('<ul>');
    data.forEach(item => {
        if(item.name)
          res.write(`<li>${item.name}</li>`);
        if(item.EnteredName)
          res.write(`<li>${item.EnteredName}</li>`);
    });
    res.write('</ul>');
    res.end();  
  } finally {
    await client.close();
  }

});

// Replace the uri string with your MongoDB deployment's connection string.
const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri);

async function run(myname) {
  try {
    await client.connect();
    const mydatabase = client.db(dbName);
    const mycollection = mydatabase.collection(colName);
    // create a document to insert
    const doc = {
      EnteredName: myname,
    }
    const result = await mycollection.insertOne(doc);

    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } finally {
    await client.close();
  }
}
//run().catch(console.dir);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/myDemoWebpage.html');
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});