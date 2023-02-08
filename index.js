const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");
let phonebookData = require("./data/data.json");

/*
The json-parser functions so that it takes the JSON data of a request, 
transforms it into a JavaScript object and then attaches it to the body
 property of the request object before the route handler is called.*/
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
/*
Now HTTP GET requests to the address www.serversaddress.com/index.html
or www.serversaddress.com will show the React frontend. GET requests
to the address www.serversaddress.com/api/notes will be handled by the backend's code.
*/
app.use(express.static("build"));

//! Middleware
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(requestLogger);

//! REQUEST HANDLERS

//* Generic request
app.get("/", (req, res) => res.status(200).send("Hello From the server"));
//* Get all persons
app.get("/api/persons", (req, res) => {
  res.status(200).json(phonebookData);
});

//* Get single person
app.get("/api/persons/:id", (req, res) => {
  const person = phonebookData.find(
    (person) => person.id === Number(req.params.id)
  );

  if (person) {
    res.status(200).send(person);
  } else {
    res
      .status(404)
      .send({ message: `No person found with id ${req.params.id}` });
  }
});

//* Delete single note
app.delete("/api/persons/:id", (req, res) => {
  const personFound = phonebookData.find(
    (person) => person.id === Number(req.params.id)
  );

  if (personFound) {
    phonebookData = phonebookData.filter(
      (person) => person.id !== personFound.id
    );
    res.status(200).send({ message: `Person with ${req.params.id} deleted.` });
  } else {
    res.status(404).send({ message: `No person with ${req.params.id} found` });
  }
});

//* Add new person
app.post("/api/persons", (req, res) => {
  const { name, number } = req.body;

  if (!name || !number) {
    res.status(404).send({ error: "Missing vallues." });
  }

  const isNameUsed = checkNameUnique(phonebookData, name);

  if (isNameUsed) {
    res.status(404).send({ error: "name must be unique" });
  } else {
    const newPerson = {
      id: generateUniqueId(),
      ...req.body,
    };

    phonebookData = phonebookData.concat(newPerson);

    res.status(200).send({
      message: `Person by name ${newPerson.name} added successfully.`,
      data: newPerson,
    });
  }
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

const checkNameUnique = (arr, nameToCheck) => {
  let nameFound = arr.some(function (entry) {
    return entry.name === nameToCheck;
  });

  return nameFound ? true : false;
};

const generateUniqueId = () => {
  return uuidv4();
};

//! START EXPRESS SERVER

const PORT = process.env.PORT || 3001;
app.listen(PORT, (req, res) => {
  console.log(`Server running at ${PORT}`);
});

app.use(unknownEndpoint);
