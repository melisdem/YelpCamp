// Requirements
const mongoose = require("mongoose");
mongoose.connect("mongodb://root:159753mel@localhost:27017/YelpCamp?authSource=admin", 
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Db is connected")
});

const cities = require("./cities");
const { places, descriptors } = require('./seedHelpers');
const Campground = require("../models/campground");


// body
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (var i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random()*1000);
    const price = Math.floor(Math.random()*20)+10;
    const camp = new Campground ({
      author: "60ed566fbb24b36d90dcaf7d",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: "https://source.unsplash.com/collection/483251",
      description:"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod",
      price
    });
    await camp.save();
  }    
}

seedDB().then(() => {
  db.close()
})
