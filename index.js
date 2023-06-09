const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());



const uri = "mongodb+srv://meherafkabir:7rMQPpezvXEmrGGX@summer-school.9wyvcpv.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const usercollection = client.db("summer_school").collection("user");
        const Instructorscollection = client.db("summer_school").collection("Instructors");



        app.get('/user', async (req, res) => {
            const result = await usercollection.find().toArray()
            res.send(result)
        })
        app.get('/instructors', async (req, res) => {
            const result = await Instructorscollection.find().toArray()
            res.send(result)
        })
        app.get('/instructors/:id', async (req, res) => {
            const id=req.params.id;
            const query={_id : new ObjectId(id)}
            const result = await Instructorscollection.findOne(query)
            res.send(result)
        })


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Summer School Data')
})

// meherafkabir  7rMQPpezvXEmrGGX





app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})