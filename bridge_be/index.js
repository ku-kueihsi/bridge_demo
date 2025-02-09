const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
//middleware
app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  port: "5432",
  database: "postgres"
});

async function findPointsWithinDistance(latitude, longitude, distance) {
  try {
      // In gis it is the order of long/lat.
      const query = `
          SELECT *
          FROM pandas_db
          WHERE ST_DWithin(
              geom,
              ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
              $3, 
              false
          );
      `;
      const values = [latitude, longitude, distance];
      const result = await pool.query(query, values);
      // const result = await pool.query(query);
      return result.rows;
  } catch (error) {
      console.error("Error executing query:", error);
      throw error;
  }
}

app.get('/', (req, res) => {
    req.query
    // const latitude = 41.761672222222224;
    // const longitude = -71.42495555555556;
    // const distance = 6000; // meters
    const {latitude = 0.0, longitude = 0.0, distance = 0.0} = req.query;
    findPointsWithinDistance(latitude, longitude, distance)
    .then((points)=>{
      res.json(points);
      console.log("Points within distance:", points);
    })
    .catch((error)=>{console.error("Error:", error);})
    .finally();
})

app.listen(9000, () => {
  console.log("server started on port 9000");
});