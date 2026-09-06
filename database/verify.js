print("=== Product count: " + db.products.countDocuments());
print("=== Categories:");
db.products.aggregate([{$group:{_id:"$category",count:{$sum:1}}},{$sort:{count:-1}}])
  .toArray().forEach(function(c){ print("  " + c._id + ": " + c.count); });
print("=== Sample products:");
db.products.find({},{name:1,category:1,price:1,imageUrl:1,_id:0}).limit(3)
  .toArray().forEach(function(p){ print("  " + JSON.stringify(p)); });
