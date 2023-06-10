const express = require('express')
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());



// const verifyJWT = (req, res, next) => {
//     const authorization = req.headers.authorization;
//     console.log('authorization', authorization)
//     if (!authorization) {
//         return res.status(401).send({ error: true, message: 'unauthorized access 1' });
//     }
//     // bearer token
//     const token = authorization.split(' ')[1];
//     // console.log('token', token)
//     jwt.verify(token, process.env.JWT_ACCESS_TOCKEN, (err, decoded) => {
//         if (err) {
//             return res.status(401).send({ error: true, message: 'unauthorized access 2' })
//         }
//         req.decoded = decoded;
//         next();
//     })
// }


const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@summer-school.9wyvcpv.mongodb.net/?retryWrites=true&w=majority`;

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

        const userscollection = client.db("summer_school").collection("users");
        const Instructorscollection = client.db("summer_school").collection("Instructors");
        const ClasssCollection = client.db("summer_school").collection("classes");
        const SelectedCoursecollection = client.db("summer_school").collection("SelectedCourse");


        // const verifyAdmin = async (req, res, next) => {
        //     const email = req.decoded.email;
        //     console.log('decoded email from verify admin', email)
        //     const query = { email: email }
        //     const user = await userscollection.findOne(query);
        //     if (user?.role !== 'admin') {
        //         console.log('se admin na')
        //         return res.status(403).send({ error: true, message: 'forbidden message' });
        //     }
        //     next();
        // }


        app.post('/jwt', (req, res) => {
            const user = req.body;
            console.log('from user /jwt', user)
            console.log(process.env.JWT_ACCESS_TOCKEN)
            const token = jwt.sign(user, process.env.JWT_ACCESS_TOCKEN, { expiresIn: '20h' })
            res.send({ token })
        })

        app.post('/users', async (req, res) => {
            const users = req.body;
            const query = { email: users.email }
            const existingUser = await userscollection.findOne(query);
            // console.log("existing", existingUser)
            if (existingUser) {
                console.log('ai user ase')
                return res.send({ mssage: 'user Is already exists' })
            }
            const result = await userscollection.insertOne(users);
            res.send(result)
        })

        app.get('/users', async (req, res) => {
            const result = await userscollection.find().toArray()
            res.send(result)
        })

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const filter = { _id: new ObjectId(id) };

            const updateDoc = { $set: { role: "admin" } };
            const result = await userscollection.updateOne(filter, updateDoc)
            // console.log('result', result)
            res.send(result)
        })

        app.patch('/users/instructor/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const filter = { _id: new ObjectId(id) };

            const updateDoc = { $set: { role: "instructor" } };
            const result = await userscollection.updateOne(filter, updateDoc)
            // console.log('result', result)
            res.send(result)
        })


        app.post('/newClass', async (req, res) => {
            const NewClass = req.body;
            console.log(NewClass)
            const result = await ClasssCollection.insertOne(NewClass)
            res.send(result)
        })



        app.get('/myClass/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(email)
            const query = { instructors_email: email };
            const result = await ClasssCollection.find(query).toArray();
            // console.log(result)
            res.send(result)
        })

        app.delete('/class/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await ClasssCollection.deleteOne(query);
            console.log(result)
            res.send(result)
        })


        app.get('/instructors', async (req, res) => {
            const result = await Instructorscollection.find().toArray()
            res.send(result)
        })
        app.get('/instructors/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await Instructorscollection.findOne(query)
            res.send(result)
        })


        app.get('/SelectedCourse/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(email)
            const query = { email: email };
            const result = await SelectedCoursecollection.find(query).toArray();
            res.send(result)
        })

        app.post('/SelectCourse', async (req, res) => {
            const course = req.body;
            console.log('course', course)
            const result = await SelectedCoursecollection.insertOne(course);
            res.send(result)
        })

        app.delete('/SelectCourse/:id', async (req, res) => {
            const id = req.params.id;
            console.log('hit delete', id)
            const query = { _id: new ObjectId(id) };
            const result = await SelectedCoursecollection.deleteOne(query);
            res.send(result)
        })

        app.get('/courseFeePayment/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(email)
            const query = { _id: new ObjectId(id) };
            const result = await SelectedCoursecollection.findOne(query)
            res.send(result)
        })


        // app.post('/create-payment-intent', verifyJWT, async (req, res) => {
        //     const { price } = req.body;
        //     const amount = parseInt(price * 100);
        //     console.log(price, amount)
        //     const paymentIntent = await stripe.paymentIntents.create({
        //         amount: amount,
        //         currency: 'usd',
        //         payment_method_types: ['card']
        //     });

        //     res.send({
        //         clientSecret: paymentIntent.client_secret
        //     })
        // })

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Summer School Data')
})






app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})