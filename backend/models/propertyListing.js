const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  priceForBuy:{
    type:Number,
    required:true,
  },
  priceForRent:{
    type:Number,
    required:true,
  },
  escrowAmount:{
    type:Number,
    required:true
  },
  uri:{
    type:Number,
    required:true,
    unique:true
  },
});

module.exports = mongoose.model('Property', propertySchema);