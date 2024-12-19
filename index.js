const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ewhtdrn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   }
});

async function run() {
   try {

      const carsCollection = client.db('carsHireDB').collection('cars')
      const usersCollection = client.db('carsHireDB').collection('users')
      const bookingsCollection = client.db('carsHireDB').collection('bookings')


      // users related api.

      app.get('/users', async (req, res) => {
         const result = await usersCollection.find().toArray();
         res.send(result)
      })

      app.get('/user/:email', async (req, res) => {
         const email = req.params.email;
         const query = { email: email }
         const result = await usersCollection.findOne(query);
         res.send(result)

      })

      app.post('/user', async (req, res) => {
         const user = req.body;
         const email = req.body.email;
         const existingUser = await usersCollection.findOne({email : email})
         if(existingUser){
           return
         }
         const result = await usersCollection.insertOne(user);
         res.send(result)
      })

      app.delete('/user/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) }
         const result = await usersCollection.deleteOne(query);
         res.send(result)
      })

      app.patch('/user/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) }
         const updatedDoc = {
            $set: {
               role: 'admin'
            }
         }
         const result = await usersCollection.updateOne(query, updatedDoc)
         res.send(result)
      })




      //cars related api.

      // get all cars 

      app.get('/allCars', async (req, res) => {
         const result = await carsCollection.find().toArray();
         res.send(result)
      })

      //get latest published cars

      app.get('/existingCar', async (req, res) => {
         const result = await carsCollection.find().sort({ _id: -1 }).limit(6).toArray();
         res.send(result)
      })

      //get cars by pagination.

      app.get('/cars', async (req, res) => {
         const page = parseInt(req.query.page) || 0;
         const limit = 3;

         const result = await carsCollection
            .find()
            .skip(page * limit)
            .limit(limit)
            .toArray()

         res.send(result)
      })

      //get a specific car.

      app.get('/carDetails/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) }
         const result = await carsCollection.findOne(query);
         res.send(result)
      })

      //post a specific car.

      app.post('/car', async (req, res) => {
         const car = req.body;
         const result = await carsCollection.insertOne(car);
         res.send(result)
      })

      // car delete

      app.delete('/car/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) }
         const result = await carsCollection.deleteOne(query);
         res.send(result)
      })


      // bookings cars related api.

      app.get('/bookings', async (req, res) => {
         const email = req.query.email;
         const query = { email }
         const result = await bookingsCollection.find(query).toArray();
         res.send(result)
      })

      app.get('/orders', async(req, res) =>{
         const result = await bookingsCollection.find().toArray();
         res.send(result)
      })

      app.post('/booking', async (req, res) => {
         const booking = req.body;
         const tourCode = req.query.tourCode;
         const existingBooked = await bookingsCollection.findOne({ tourCode: tourCode })
         if (existingBooked) {
            return res.status(409).send({ message: 'You already booked it.' })
         }

         const result = await bookingsCollection.insertOne(booking);
         res.send(result)
      })

      app.delete('/booking/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const result = await bookingsCollection.deleteOne(query);
         res.send(result)
      })


      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
   } finally {
      // 
   }
}
run().catch(console.dir);



app.get('/', (req, res) => {
   res.send('My server is running...')
})

app.listen(port, () => {
   console.log('my server is running on port : ', port);
})

