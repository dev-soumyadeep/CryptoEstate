import { Request, Response } from 'express';
import { ethers } from 'ethers';
// import Property from '../models/propertyListing';
interface PropertyData{
  priceForRent:number;
  priceForBuy:number;
  escrowAmount:number;
  uri:string;
}
export const listProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const {priceForRent,priceForBuy,escrowAmount,uri}:PropertyData=req.body
    

    // const customers = await Property.find();
    // res.json(customers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
