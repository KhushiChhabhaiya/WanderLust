import mongoose from "mongoose";
import initData from "./data.js";
import listings from "../models/listing.js";
import "dotenv/config";

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const MONGO_URL = process.env.ATLAS_DB_URL;

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB");
}

const coordinatesByLocation = {
  Malibu: [-118.7798, 34.0259],
  "New York City": [-74.006, 40.7128],
  Aspen: [-106.8175, 39.1911],
  Florence: [11.2558, 43.7696],
  Portland: [-122.6784, 45.5152],
  Cancun: [-86.8515, 21.1619],
  "Lake Tahoe": [-120.0324, 39.0968],
  "Los Angeles": [-118.2437, 34.0522],
  Verbier: [7.228, 46.096],
  "Serengeti National Park": [34.6857, -2.3333],
  Amsterdam: [4.9041, 52.3676],
  Fiji: [178.4501, -18.1248],
  Cotswolds: [-1.8433, 51.833],
  Boston: [-71.0589, 42.3601],
  Bali: [115.1889, -8.4095],
  Banff: [-115.5708, 51.1784],
  Miami: [-80.1918, 25.7617],
  Phuket: [98.3923, 7.8804],
  "Scottish Highlands": [-4.2026, 57.12],
  Dubai: [55.2708, 25.2048],
  Montana: [-110.3626, 46.8797],
  Mykonos: [25.3289, 37.4467],
  "Costa Rica": [-84.0907, 9.9281],
  Charleston: [-79.9311, 32.7765],
  Tokyo: [139.6917, 35.6895],
  "New Hampshire": [-71.5724, 43.1939],
  Maldives: [73.5093, 4.1755],
};

const initDb = async () => {
  await listings.deleteMany({});

  const updatedData = initData.data.map((obj) => ({
    ...obj,
    owner: "6ad4f977677a17c03f8f04d8",
    geometry: {
      type: "Point",
      coordinates: coordinatesByLocation[obj.location] || [0, 0],
    },
    // Add category to each listing
    category: obj.category || "Trending",
  }));

  await listings.insertMany(updatedData);

  console.log("Data initialized.");
};

main()
  .then(() => {
    return initDb();
  })
  .catch((err) => {
    console.log(err);
  });
