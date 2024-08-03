const express =require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema ,reviewSchema}= require("../schema.js");
const Listing= require("../models/listing.js");
const {isLoggedIn ,isOwner} =require("../middleware.js");
const multer  = require('multer')
const {storage }= require("../cloudconfig.js");
const upload = multer({ storage })

const validateListing =(req, res,next)=>{
  let {error }= listingSchema.validate(req.body);
  if (error) {
    let errmsg =error.details.map((el) =>el.message) .join(",");
    throw new ExpressError (400,errmsg);
  } else {
    next();
  }
};
// index route
router.get("/",wrapAsync( async (req,res)=>{
    let alllistings =await Listing.find();
    //console.log(alllistings);
    //res.send("hi")
    res.render("listing/index.ejs",{alllistings});
}));

// new route
router.get("/new",isLoggedIn,(req,res)=>{
  res.render("listing/new.ejs");
});

// show route
router.get("/:id",wrapAsync( async(req,res)=>{
  let{id}= req.params;
  const listing =await Listing.findById(id).populate({ path: "reviews" , populate :{path : "author",}}).populate("owner");
  //console.log(listing);
  if (!listing) {
    req.flash("error"," listing does not exict");
    res.redirect("/listing");
  }
  res.render("listing/show.ejs",{listing});
}));
 //create route
router.post("/", isLoggedIn,upload.single('listing[image]'),wrapAsync(async (req, res,next) => {
 listingSchema.validate(req.body);
  let url=req.file.path;
  let filename =req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner =req.user._id ;
  newListing.image ={url,filename};
  await newListing.save();
  req.flash("success","new listing created");
  res.redirect("/listing");
}));

//edit route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  
  if (!listing) {
    req.flash("error"," listing does not exict");
    res.redirect("/listing");
  }
  let orginalImage=listing.image.url;
  orginalImage=orginalImage.replace("/upload","/upload/h_300,w_250")
  res.render("listing/edit.ejs", { listing,orginalImage });
}));

// update route
router.put("/:id",isLoggedIn,isOwner,upload.single('listing[image]'),validateListing, wrapAsync(async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400,"send vaild list");
 }
  let { id } = req.params;
  let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !=="undefined") {
    let url=req.file.path;
    let filename =req.file.filename;
    listing.image= {url,filename};
    await listing.save();
  }
 
  req.flash("success","new listing update   ");
  res.redirect(`/listing/${id}`);
}));
// delete route
router.delete("/:id",isLoggedIn, isOwner,wrapAsync( async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success"," listing delete");
  res.redirect("/listing");
}));

module.exports= router ;