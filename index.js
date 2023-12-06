const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const PORT = 5959;
const MONGODB_URI = "mongodb+srv://rshai10:<password>@cluster0.yxifel9.mongodb.net/?retryWrites=true&w=majority";

http.createServer(async (req, res) => {
    console.log(req.url);
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
            if (err) throw err;
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
    } else if (req.url === '/about') {
        fs.readFile(path.join(__dirname, 'public', 'about.html'), (err, content) => {
            if (err) throw err;
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
    } else if (req.url === '/api') {
        try {
            const data = await retrieveDataFromMongoDB();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end("<h1> 404 Nothing is here </h1>");
    }
}).listen(PORT, () => console.log(`Server is running on port ${PORT}`));

async function retrieveDataFromMongoDB() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const databaseName = "food";
        const collectionName = "nutrition";
        const cursor = client.db(databaseName).collection(collectionName).find({});
        const results = await cursor.toArray();
        const formattedResults = [];

        results.forEach(result => {
            result.Food.forEach(foodItem => {
                formattedResults.push({ _id: result._id, ...foodItem });
            });
        });

        return formattedResults;
    } catch (error) {
        console.error("Error during MongoDB operation:", error);
        throw error; // Rethrow the error to propagate it to the calling function
    } finally {
        await client.close();
    }
}
