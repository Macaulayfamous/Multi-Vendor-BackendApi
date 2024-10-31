const express = require('express');
const orderRouter = express.Router();
const Order = require('../models/order');
const {auth,vendorAuth} = require('../middleware/auth');

///Post  route for creating orders

orderRouter.post('/api/orders',auth, async(req, res)=>{
try {
    const {
        fullName,
        email,
        state,
        city,
        locality,
        productName,
        productPrice,
        quantity,
        category,
        image,
        vendorId,
        buyerId,
        
    } = req.body;

    const createdAt  = new Date().getMilliseconds()// Get the current date and time


    // create new order instance with the extracted field

    const order = new  Order({
        fullName,
        email,
        state,
        city,
        locality,
        productName,
        productPrice,
        quantity,
        category,
        image,
        vendorId,
        buyerId,
        createdAt
        
    });

    await order.save();
    return res.status(201).json(order);

} catch (e) {
   res.status(500).json({error:e.message});  
}
});

//GET route for fetching orders by buyer ID
orderRouter.get('/api/orders/:buyerId',auth, async (req,res)=>{
  try {
    //Extract the buyerid from the request parameters
    const {buyerId} = req.params;
    //Find all orders in the database  that match the buyerid
    const orders =  await Order.find({buyerId});
    //If no orders are found, return a 404 status  with a message 
    if(orders.length==0){
        return res.status(400).json({msg:"No Orders found for this buyer"});
    }
    //if orders are found , return them with  a 200 status code
    return res.status(200).json(orders);
  } catch (e) {
    //Handle any errors that occure during  the order  retrieval process
    res.status(500).json({error:e.message}); 
  }
});

//Delete route for deleting a specific order by _id
orderRouter.delete("/api/orders/:id",auth, async(req,res)=>{
  try {
    //extract the id from the request parameter
    const {id} = req.params;
    //find and delete the order from the database using the extracted _id
   const deletedOrder = await Order.findByIdAndDelete(id);
   //check if an order was found and deleted
   if(!deletedOrder){
    //if no order was found with the provided _id return 404
    return res.status(404).json({msg:"Order not found"});
   }else{
    //if the order was successfully deleted , return 200 status  with a success message
    return  res.status(200).json({msg:"Order was deleted successully"});
   }
  } catch (e) {
    //if an error occures during the process, return a 500 status with the error message
    res.status(500).json({error:e.message});
  }
});

//GET route for fetching orders by vendor ID
orderRouter.get('/api/orders/vendors/:vendorId',auth,vendorAuth,async (req,res)=>{
  try {
    //Extract the vendorId from the request parameters
    const {vendorId} = req.params;
    //Find all orders in the database  that match the vendorId
    const orders =  await Order.find({vendorId});
    //If no orders are found, return a 404 status  with a message 
    if(orders.length==0){
        return res.status(404).json({msg:"No Orders found for this buyer"});
    }
    //if orders are found , return them with  a 200 status code
    return res.status(200).json(orders);
  } catch (e) {
    //Handle any errors that occure during  the order  retrieval process
    res.status(500).json({error:e.message}); 
  }
});


orderRouter.patch('/api/orders/:id/delivered', async (req, res) => {
  try {
    const {id} = req.params;
    const updatedOrder  = await Order.findByIdAndUpdate(
      id,
      {delivered:true, processing:false},
      {new:true}
      
      );

  if(!updatedOrder){
    return res.status(404).json({msg:"Order not found"})
  }else{
    return res.status(200).json(updatedOrder);
  }
  } catch (error) {
    res.status(500).json({error:e.message}); 

  }
  
});
orderRouter.patch('/api/orders/:id/processing', async (req, res) => {
  try {
    const {id} = req.params;
    const updatedOrder  = await Order.findByIdAndUpdate(
      id,
      {processing:false,delivered:false},
      {new:true}
      
      );

  if(!updatedOrder){
    return res.status(404).json({msg:"Order not found"})
  }else{
    return res.status(200).json(updatedOrder);
  }
  } catch (error) {
    res.status(500).json({error:e.message}); 

  }
  
});

orderRouter.get('/api/orders',async(req,res)=>{
  try {
  const orders =  await Order.find();
  return res.status(200).json(orders);
  } catch (e) {
    return res.status(500).json({error:e.message});
  }
});

module.exports = orderRouter;