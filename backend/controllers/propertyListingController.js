const Property = require('../models/propertyListing');

exports.listProperty = async (req, res) => {//...
  try {
    const customers = await Property.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};