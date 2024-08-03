const express =require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema ,reviewSchema}= require("../schema.js");
const Review= require("../models/review.js");
const Listing= require("../models/listing.js");
const {isLoggedIn ,isOwner, isReviewAuthor} =require("../middleware.js");

const validateReview =(req, res,next)=>{
    let {error }= reviewSchema.validate(req.body);
    if (error) {
      let errmsg =error.details.map((el) =>el.message) .join(",");
      throw new ExpressError (400,errmsg);
    } else {
      next();
    }
  };
  
// review 
router.post("/", isLoggedIn, wrapAsync(async(req,res)=>{
    let listing =await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author =req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","new review created");
    res.redirect(`/listing/${listing._id}`);
  }));

  // delete review
  router.delete("/:reviewId",isReviewAuthor, wrapAsync(async(req,res)=>{
    let { id, reviewId} = req.params;
     Listing.findByIdAndUpdate( id, {$pull :{reviews :reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review deleted");
    res.redirect(`/listing/${id}`);
  }
  ));
  module.exports= router ;