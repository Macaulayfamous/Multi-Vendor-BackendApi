const express = require('express');
const Product = require('../models/product');
const productRouter = express.Router();
const {auth, vendorAuth} = require('../middleware/auth');

productRouter.post('/api/add-product',auth,vendorAuth, async(req, res)=>{
  try {
    const {productName, productPrice, quantity,description, category ,vendorId, fullName, subCategory, images} = req.body;
   const product = new Product({productName, productPrice, quantity,description, category ,vendorId, fullName,  subCategory, images});
   await product.save();
   return res.status(201).send(product);
  } catch (e) {
      res.status(500).json({error:e.message});
  }
});

productRouter.get('/api/popular-products',async(req,res)=>{
  try {
    const product = await Product.find({popular:true});
    if(!product ||product.length==0){
        return res.status(404).json({msg:"products not found"});
    }else{
        return  res.status(200).json(product);
    }
  } catch (e) {
    res.status(500).json({error:e.message})
  }
});

productRouter.get('/api/recommended-products',async(req,res)=>{
    try {
      const product = await Product.find({recommend:true});
      if(!product ||product.length==0){
          return res.status(404).json({msg:"products not found"});
      }else{
          return  res.status(200).json({product});
      }
    } catch (e) {
      res.status(500).json({error:e.message})
    }
  });
//new route for retrieving products by category
productRouter.get('/api/products-by-category/:category', async(req,res)=>{
  try {
    const {category} = req.params;
    const products =  await Product.find({category,popular:true});
    if(!products|| products.length==0){
      return res.status(404).json({msg:"Product not found"});
    }else{
      return res.status(200).json(products);
    }
  } catch (e) {
    res.status(500).json({error:e.message});
  }
});

//new route for retrieving related products by subcategory
productRouter.get('/api/related-products-by-subcategory/:productId',async(req,res)=>{
  try {
    const {productId} = req.params;
    //first ,find the prduct to get its subcategory
  const product =  await Product.findById(productId);
  if(!product){
    return res.status(404).json({msg:"Product not found"});
  }else{
    //find related products base  on the subcategory  of the retrieved product
  const relatedProducts =  await Product.find({
      subCategory: product.subCategory,
      _id:{$ne:productId}//Exclude the current product
    });

   if(!relatedProducts || relatedProducts.length ==0){
    return res.status(404).json({msg:"No related products found"});
   } 
    
   return res.status(200).json(relatedProducts);

  }
  } catch (e) {
    return res.status(500).json({error:e.message});
  }
});


//route for retrieving the top 10 highest-rated products
productRouter.get('/api/top-rated-products',async(req,res)=>{
  try {
    //fetch all products and sort them by avaragerating in decending order(higest rating)
    //sort product by averageRating, with -1 indicating decending
  const topRatedProducts =  await Product.find({}).sort({averageRating: -1}).limit(10);//limit the result to the top highest rated product

  //check if there are any top-rated products  returned
  if(!topRatedProducts||topRatedProducts.length==0){
    return res.status(404).json({msg:"No top-rated products  found"});
  }

  //return the top-rated product as a response 
  return res.status(200).json(topRatedProducts);
  } catch (e) {
    //handle any server errors that occure during the request
    return res.status(500).json({error:e.message});
  }
});


module.exports = productRouter;