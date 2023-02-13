require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./Models/Person");
//? Middleware imports
const MongooseErrorHandler = require("./Middleware/Errors/MongooseErrors");

/*
Now HTTP GET requests to the address www.serversaddress.com/index.html
or www.serversaddress.com will show the React frontend. GET requests
to the address www.serversaddress.com/api/notes will be handled by the backend's code.
*/
app.use(express.static("build"));
/*
The json-parser functions so that it takes the JSON data of a request, 
transforms it into a JavaScript object and then attaches it to the body
 property of the request object before the route handler is called.*/
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

//! REQUEST HANDLERS

//* Generic request
app.get("/", (req, res) => res.status(200).send("Hello From the server"));
//* Get all persons
app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

//* Get single person
app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      console.log(person);
      if (person) {
        res.status(200).json({
          status: "success",
          message: `Person with ${req.params.id} found`,
          data: person,
        });
      } else {
        res.status(404).json({
          status: "fail",
          message: `No person with ${req.params.id} found`,
        });
      }
    })
    .catch((error) => {
      next(error);
    });
});

//* Delete single person
app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then((person) => {
      if (person) {
        res
          .status(200)
          .json({ message: `Person with id ${person.id} was removed.` });
      } else {
        res
          .status(404)
          .json({ message: `No person with id ${req.params.id} was found.` });
      }
    })
    .catch((error) => next(error));
});

//* Add new person
app.post("/api/persons", (req, res) => {
  if (req.body.name && req.body.number) {
    const newPerson = new Person({
      name: req.body.name,
      number: req.body.number,
    });

    newPerson.save().then((person) => {
      console.log(person);
      res
        .status(200)
        .json({ message: `Person added under id `, data: newPerson });
    });
  } else {
    res.status(400).json({ error: "Bad request, missing content" });
  }

  // ! Check later for the above
  // const isNameUsed = checkNameUnique(phonebookData, name);

  // if (isNameUsed) {
  //   res.status(404).send({ error: "name must be unique" });
  // } else {
  //   const newPerson = {
  //     id: generateUniqueId(),
  //     ...req.body,
  //   };

  // const checkNameUnique = (arr, nameToCheck) => {
  //   let nameFound = arr.some(function (entry) {
  //     return entry.name === nameToCheck;
  //   });

  //   return nameFound ? true : false;
  // };
});

//* Get phonebook info
app.get("/info", (req, res) => {
  res
    .status(200)
    .send(
      `Phonebook contains info for ${
        phonebookData.length
      } people\n Current date: ${new Date()}`
    );
});

//* Update phonebook entry
app.put("/api/persons/:id", (req, res, next) => {
  console.log("ola");
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

//! START EXPRESS SERVER

const PORT = process.env.PORT || 3001;
app.listen(PORT, (req, res) => {
  console.log(`Server running at ${PORT}`);
});

//! handler of requests with unknown endpoint
app.use(unknownEndpoint);
//! Note that the error-handling middleware has to be the last loaded middleware!
app.use(MongooseErrorHandler);
