const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eiraya6.mongodb.net/?retryWrites=true&w=majority`;

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

        const collegesCollection = client.db('bookingCollege').collection('colleges');
        const usersCollection = client.db('bookingCollege').collection('users');
        const applicationCollection = client.db('bookingCollege').collection('application');
        const reviewCollection = client.db('bookingCollege').collection('review');


        // colleges relevent apis
        app.get('/colleges', async (req, res) => {
            const query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await collegesCollection.find(query).toArray();
            res.send(result)
        })

        // colleges details id
        app.get('/colleges/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await collegesCollection.findOne(query);
            res.send(result)
        })

        // users relevant api
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            try {
                const user = req.body;
                const query = { email: user.email };
                const existingUser = await usersCollection.findOne(query);
                if (existingUser) {
                    return res.send({ message: 'User already exists' });
                }
                const saveUser = { name: user.name, email: user.email, img: user.img };

                const result = await usersCollection.insertOne(saveUser);
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to create user' });
            }
        });


        // student application submit form
        app.post('/application', async (req, res) => {
            const applicationForm = req.body;
            const result = await applicationCollection.insertOne(applicationForm)
            res.send(result)
        })

        // student submit form and show my college page specific user info

        app.get('/application', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await applicationCollection.find(query).toArray();
            res.send(result)
        });

        // review submit form
        app.post('/review', async (req, res) => {
            const reviewForm = req.body;
            const result = await reviewCollection.insertOne(reviewForm)
            res.send(result)
        })

        // ui review show
        app.get('/review', async (req, res) => {
            const result = await reviewCollection.find().toArray()
            res.send(result)
        })














        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Booking Colleges Service Project is Running')
})

app.listen(port, () => {
    console.log(`Booking Colleges Service Project is Running on port ${port}`);
})