const express = require("express");
const router = express.Router();
const schemas = require("../models/schemas");
const axios = require("axios");
const fs = require("fs");
const base64Img = require("base64-img");

router.post("/cards", async (req, res) => {
  // console.log(req.body);
  const {
    address,
    name,
    id,
    telephone,
    url,
    website,
    photos,
    rating,
    priceLevel,
    categories,
  } = req.body;

  let cardData = {
    address: address,
    name: name,
    _id: id,
    telephone: telephone,
    url: url,
    website: website,
    photos: photos,
    rating: rating,
    priceLevel: priceLevel,
    categories: categories,
  };

  async function downloadImage(url, filename) {
    const response = await axios.get(url, { responseType: "arraybuffer" });

    fs.writeFile(filename, response.data, (err) => {
      if (err) throw err;
      console.log("Image downloaded successfully!");
    });
  }

  if (photos.substring(0, 5) === "https") {
    //IS URL, NOT BASE64
    const newPhotoUrl = await axios.get(cardData.photos).then((res) => {
      //console.log(res.request._redirectable._options.href);
      return res.request._redirectable._options.href;
    });
    if (newPhotoUrl) {
      cardData = { ...cardData, photos: newPhotoUrl };
    }
  }

  //console.log(cardData);

  const card = new schemas.Card(cardData);
  const saveCard = await card
    .save()
    .then((data) => {
      console.log("INSERT SUCCESSFUL\n" + data);
      res.status(200).send("OK").end();
      //STORE IMAGE
      cardData.photos.substring(0, 5) === "https"
        ? downloadImage(cardData.photos, `./thumbnails/${cardData._id}.jpg`)
        : base64Img.img(
            cardData.photos,
            "./thumbnails/",
            cardData._id,
            (err, filepath) => {}
          );
    })
    .catch((err) => {
      if (err.code === 11000) {
        console.error('Duplicate key error. Document already exists!');
        // Handle the duplicate key error here (e.g., retry with different data)
        res.status(200).send("DUPLICATE").end();
      } else {
        res.status(500).send("ERROR").end();
        console.error('An error occurred:', err);
      }
      console.log("DATA NOT INSERTED!");

    });

  // res.end();
});

module.exports = router;
