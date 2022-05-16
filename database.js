class Database {


    constructor(client, databaseAndCollection, uri) {
         const { MongoClient, ServerApiVersion } = require('mongodb');
         this.uri = uri;
         this.client = client;
         this.databaseAndCollection = databaseAndCollection;
         
         
  
         client.connect();
     
 
     }
 
     
     async writeToDatabase(client, databaseAndCollection, classSelection) {
         await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(classSelection);
         // await results;
     }
 
     async lookupApplication(client, databaseAndCollection, studentID) {
         
         let filter = {studentID: { $eq: studentID}};
         const cursor = await client.db(databaseAndCollection.db)
         .collection(databaseAndCollection.collection)
         .find(filter);
 
        const result = await cursor.toArray();
        return result;
     }
 
     async lookupTeachers(client, databaseAndCollection, classCode) {
         
        let filter = {classCode: { $eq: classCode}};
        const cursor = await client.db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .find(filter);

       const result = await cursor.toArray();
       return result;
    }
 
     async delete(client, databaseAndCollection, studentID) {
        let filter = {studentID: { $eq: studentID}};
        const result = await client.db(databaseAndCollection.db)
                       .collection(databaseAndCollection.collection)
                       .deleteMany(filter);
        
         return result.deletedCount;
     }
     
     
 }
 module.exports = {Database}; 
 