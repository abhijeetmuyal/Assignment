import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors';
import connectDB from './config/connectdb.js'
import userRoutes from './routes/userRoutes.js'


const bodyParser = require('body-parser');
const port = process.env.PORT
const app = express();
const AUTH_TOKEN = 'AUTH_TOKEN';
const DATABASE_URL =  process.env.DATABASE_URL

app.use(bodyParser.json());

// Endpoint for POST request
app.post('/intersections', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const linestring = req.body;
  if (!linestring || linestring.type !== 'Feature' || linestring.geometry.type !== 'LineString') {
    return res.status(400).json({ message: 'Invalid line string' });
  }

  const intersections = [];

  // Generate 50 random lines with ids
  const lines = turf.randomLineString(50, { bbox: turf.bbox(linestring) }).features.map((line, i) => {
    return turf.feature(line.geometry, { id: `L${(i + 1).toString().padStart(2, '0')}` });
  });

  // Check for intersections with each line
  lines.forEach((line) => {
    const intersection = turf.lineIntersect(linestring, line);
    if (intersection.features.length > 0) {
      intersections.push({ id: line.properties.id, intersection: intersection.features[0] });
    }
  });

  return res.json(intersections);
});

// CORS Policy
app.use(cors())

//Database connection
connectDB(DATABASE_URL)

// JSON
app.use(express.json())

// Load Routes
app.use("/api/user", userRoutes)

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});