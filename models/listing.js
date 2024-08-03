const mongoose = require("mongoose");
const review = require("./review");
const { ref } = require("joi");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: String,
  description: String,
  image:{
    filename:String,
    url:String,
  },
  price: Number,
  location: String,
  country: String,
  reviews :[
    {
      type:Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner :{
    type :Schema.Types.ObjectId,
    ref:"User",
  },
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;