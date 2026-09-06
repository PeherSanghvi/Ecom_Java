db.system.replset.updateOne(
  { "_id": "rs0" },
  { $set: { "members.0.host": "ecom-java-mongo:27017", "version": 2 } }
);
var u = db.system.replset.findOne();
print("Updated member host: " + u.members[0].host);
print("Version: " + u.version);
