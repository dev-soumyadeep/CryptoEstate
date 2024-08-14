import { Request, Response } from 'express';
// import Property from '../models/propertyListing';

export const listProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    // const customers = await Property.find();
    // res.json(customers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
