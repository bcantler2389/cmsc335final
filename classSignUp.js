/* Important */

process.stdin.setEncoding("utf8");

let fetch = require("node-fetch");
let listType = process.argv[2];
let bodyParser = require("body-parser"); 


require("dotenv").config() 
const myClassModule = require("./database.js"); 
const { MongoClient, ServerApiVersion } = require('mongodb');
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const db = process.env.DB_NAME;
const collection = process.COLLECTION;
const databaseAndCollection = {db: "ClassSignUp", collection: "Students"};
const uri = `mongodb+srv://${userName}:${password}@cluster0.22tx4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// why does this not work??
if (process.argv.length != 3) {
  process.stdout.write(`Usage classSignUp.js jsonFile\n`);
  process.exit(1);
}

process.stdout.write(`Web server started and running at http://localhost:${process.argv[2]}\n`);
let prompt = "Stop to shut down the server: ";
process.stdout.write(prompt);
process.stdin.on("readable", function () {
  let dataInput = process.stdin.read();
  if (dataInput !== null) {
    let command = dataInput.trim();
    if (command === "stop") {
      process.stdout.write("Shutting down the server\n");
      process.exit(0);
    } else {
        process.stdout.write(`Invalid command: ${dataInput}`);
       
    }
    process.stdin.resume();
    process.stdout.write(`${prompt}`);
    
  }
});

let http = require("http");
let path = require("path");
let express = require("express");   /* Accessing express module */
const { render, type } = require("express/lib/response");
const { table } = require("console");
let app = express();  /* app is a request handler function */
let publicPath = path.resolve(__dirname, "templates");
app.set("views", publicPath);
app.set("view engine", "ejs");

let database = new myClassModule.Database(client, databaseAndCollection, uri);


app.use("/styles",express.static(__dirname + "/styles"));
app.get("/", (request, response) => { 
   response.render("index");
});

app.get("/signUp", (request, response) => { 
    let url = "http://localhost:" + process.argv[2];

    let str = {
        URL: url
    };
    response.render("signUp", str);
});

app.use(bodyParser.urlencoded({extended:false})); 



app.post("/signUp", (request, response) => {
    
    let name = request.body.name;  
    let studentID = request.body.studentID;
    let classCode = request.body.classCode;
    let sectionNumber = request.body.sectionNumber;
    let url = "http://localhost:" + process.argv[2];

   
    const headers = {
        'Accept':'application/json'
    };
      let theURL = "https://api.planetterp.com/v1/course?name=" + classCode;
      fetch(theURL,
      {
        method: 'GET',
      
        headers: headers
      }).then(function(res) {
          return res.json();
      }).then(function(body) {
        if (body.error === 'course not found') {
        let obj = {
            msg: "Class code provided is not valid, please try again",
            name: "-",
            studentID: "-",
            classCode: "-", 
            sectionNumber: "-",
            URL: url
       }

       response.render("processSignUp", obj);

        }
        else {
            let str = {
                msg: "",
                name: name,
                studentID: studentID,
                classCode: classCode,
                sectionNumber: sectionNumber,
                URL: url
            };
        
            let out = {
                name: name,
                studentID: studentID,
                classCode: classCode,
                sectionNumber: sectionNumber
            }
        
        
            database.writeToDatabase(client, databaseAndCollection, out);
            response.render("processSignUp", str);
        }
      });

    
    
});

app.get("/myClasses", (request, response) => { 
    let url = "http://localhost:" + process.argv[2];

    let str = {

        URL: url
    };
    response.render("myClasses", str);
});

app.post("/myClasses", (request, response) => {

    let studentID = request.body.studentID;
    let obj; 
    console.log(studentID);
   
    (async () => {obj =
        await database.lookupApplication(client, databaseAndCollection, studentID);
        
        
        if (obj.length === 0) {
            
            let outObj = {
                msg: "Invalid student ID provided, please try again.",
                classTable: "-"
            }
            
            outObj.URL = "http://localhost:" + process.argv[2];
    
            response.render("processMyClasses", outObj);
        }
        else {
            
            
            let outObj = {
                msg: "",
                classTable: "<table border =1><tr><th>Class</th><th>Section</td></th>"
            }  
         
            obj.forEach(element => {
                outObj.classTable += `<tr><td>${element.classCode}</td><td>${element.sectionNumber}</td></tr>`
            });
             
            outObj.URL = "http://localhost:" + process.argv[2];
    

            outObj.outTable += "</table>";
    
            response.render("processMyClasses", outObj);
        }
        
    
    })();  
    
} ) ;

app.get("/averageGPA", (request, response) => { 
    let url = "http://localhost:" + process.argv[2];

    let str = {
        URL: url
    };
    response.render("averageGPA", str);
});

app.post("/averageGPA", (request, response) => {
    let classCode = request.body.classCode;
    let url = "http://localhost:" + process.argv[2];
    
    const headers = {
        'Accept':'application/json'
      };
      
      let str = "https://api.planetterp.com/v1/course?name=" + classCode;
      fetch(str,
      {
        method: 'GET',
      
        headers: headers
      }).then(function(res) {
          return res.json();
        
      }).then(function(body) {
          let obj;
        if(body.error === 'course not found') {
            obj = {
                msg: "Invalid class code provided please try again",
                classCode: classCode, 
                averageGPA: "-",
                URL: url
           } 
        }
        else {
            obj = {
                msg: "",
                classCode: classCode, 
                averageGPA: body.average_gpa,
                URL: url
            }   
        }
        

       response.render("processAverageGPA", obj);
      });
    
} ) ;

app.get("/teachers", (request, response) => { 
    let url = "http://localhost:" + process.argv[2];

    let str = {
        URL: url
    };
    response.render("teachers", str);
});

app.post("/teachers", (request, response) => {
    let url = "http://localhost:" + process.argv[2];
    let classCode = request.body.classCode;
    

    const headers = {
        'Accept':'application/json'
      };
      
      let str = "https://api.planetterp.com/v1/course?name=" + classCode;
      fetch(str,
      {
        method: 'GET',
      
        headers: headers
      }).then(function(res) {
          return res.json();
        
      }).then(function(body) {
          let obj;
          if(body.professors === undefined ) {
            obj = {
                msg: "Invalid class code provided please try again",
                classCode: classCode, 
                teacherTable: "",
                URL: url
           }
        
          }
          else {
            let teacherTable = "<table border =1><tr><th>Professors</th></tr>";
            body.professors.forEach(element => {
                teacherTable += `<tr><td>${element}</td></tr>`
            });
            teacherTable += "</table>"
            obj = {
                msg: "",
                classCode: classCode, 
                teacherTable: teacherTable,
                URL: url
            }
         }

       response.render("processTeachers", obj);
      });
    
} ) ;

app.get("/clearClasses", (request, response) => { 
    let url = "http://localhost:" + process.argv[2];

    let str = {
        URL: url
    };
    response.render("clearClasses", str);
});

app.post("/clearClasses", (request, response) => {
    let studentID = request.body.studentID;
    

    let obj; 
    (async () => {obj =
       
        await database.delete(client, databaseAndCollection, studentID);
        
        if (obj === 0) {
            
            let outObj = {
                num: "0"
            }
            
            outObj.URL = "http://localhost:" + process.argv[2];
    
            response.render("processClearClasses", outObj);
        }
        else {
            
            let outObj = {
                num: obj
            }   

            outObj.URL = "http://localhost:" + process.argv[2];
            response.render("processClearClasses", outObj);
        }
    
    })();  
    
} ) ;

http.createServer(app).listen(process.env.PORT || process.argv[2]);


