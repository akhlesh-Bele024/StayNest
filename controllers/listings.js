const express=require("express");
let  Listing = require("../models/listing.js");//js
module.exports.index =async(req, res,next) => {
  //  Listing.image = String(req.body.image || req.file.image || '');
  //    let Listing= req.body.Listing
  const allListings = await Listing.find({});
   res.render("listings/index.ejs", { allListings });
   console.log("succesfulle add ")
 };


 module.exports.renderNewform=async(req, res,next) => {
  console.log(req.user)
   res.render("listings/new.ejs");
 }

 module.exports.showListing=async (req, res,next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({path:"reviews",populate:{
   path:"author",
  }}).populate("owner");
   if(!listing){ req.flash("error","Listing you requested for does not exist");
     res.redirect("/listings");
  
   }
  console.log(req.file);
console.log(req.files);

  console.log(listing)
  res.render("listings/show.ejs", { listing});
};
module.exports.createListing = async (req, res, next) => {
  try {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // ✅ Only assign image if a file was uploaded
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    } else {
      // Optional: assign a default image or skip
      newListing.image = {
        url: '/default.jpg',    // you can add a default image in public folder
        filename: 'default'
      };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (e) {
    console.log(e);
    req.flash("error", "Something went wrong");
    res.redirect("/listings");
  }
};

// module.exports.createListing = async (req, res) => {
//   const listing = new Listing(req.body.listing);
  
//   if (req.file) {
//     listing.image = {
//       url: req.file.path,
//       filename: req.file.filename
//     };
//   }
  
//   await listing.save();
//   res.redirect(`/listings/${listing._id}`);
// };

 module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
     req.flash("error","Listing you requested for does not exist");
     res.redirect("/listings");
    }
   let originalImageUrl= listing.image.url;
   originalImageUrl =originalImageUrl.replace("/upload","/upload/w_250")
    res.render("listings/edit.ejs", { listing,originalImageUrl });
  }
 module.exports.updateListing=async(req, res) => {
 

  
   
    let { id } = req.params;
    await Listing.findById(id);
   
   let listing= await Listing.findByIdAndUpdate(id, { ...req.body.listing });
   if(typeof req.file !=="undefined"){
   let url =req.file.path;
   let filename =req.file.filename;
   listing.image={url,filename};
   await listing.save();
   }


    req.flash("success"," Listing updated!");
    res.redirect(`/listings/${id}`);
  }

  module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success"," Listing deleted!");
    res.redirect("/listings");
  }