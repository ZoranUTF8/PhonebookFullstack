const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const url = `mongodb+srv://admin-zoran:${process.env.ATLAS_DB_PASSWORD}@clusterfullstack2023.999pbro.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minLength: 3,
      required: [true, "User name is required"],
    },
    number: {
      type: String,
      minLength: 8,
      validate: {
        validator: function (v) {
          return /^\d{2,3}-\d{4}/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid phone number! Format can be: '##-####' or '###-####'`,
      },
      required: [true, "User phone number required."],
    },
  },
  { timestamps: true }
);

//? Remove the _id to id from the returned documents
personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
