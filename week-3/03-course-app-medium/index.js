require("dotenv").config();
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const uuid = require("uuid");

const { generateToken, readJsonFile, writeJSONFile, verifyToken } = require("./utils");

const app = express();
app.use(bodyParser.json());

const adminFilePath = "admin.json";
const usersFilePath = "users.json";
const coursesFilePath = "courses.json";

// Admin routes
app.post("/admin/signup", (req, res) => {
  // logic to sign up admin
  const { username, password } = req.body;
  const admins = readJsonFile(adminFilePath);

  const userExists = admins.some((admin) => admin.username === username);
  if (userExists) {
    res.status(400).send("Username already exists");
  } else {
    const admin = {
      username,
      password,
    };
    const token = generateToken({
      username,
    });
    admins.push(admin);
    writeJSONFile(adminFilePath, JSON.stringify(admins));
    res.status(201).json({
      message: "Admin created successfully",
      token,
    });
  }
});

app.post("/admin/login", (req, res) => {
  // logic to log in admin
  const { username, password } = req.headers;

  const admins = readJsonFile(adminFilePath);
  const userExists = admins.find(
    (admin) => admin.username === username && admin.password === password
  );

  if (userExists) {
    const token = generateToken({
      username,
    });
    res.send(200).json({
      message: "Logged in successfully",
      token,
    });
  } else {
    res.send(401).send("Unauthorized");
  }
});

app.post("/admin/courses",verifyToken, (req, res) => {
  // logic to create a course
  const { title, description, price, imageLink, published } = req.body;
  const id = uuid.v4();
  const course = {
    id,
    title,
    description,
    price,
    imageLink,
    published,
  };
  const courses= readJsonFile(coursesFilePath);
  courses.push(course);
  writeJSONFile(coursesFilePath, JSON.stringify(courses));
  res.status(201).json({
    message: "Course created successfully",
    courseId: id,
  });
});

app.put("/admin/courses/:courseId", (req, res) => {
  // logic to edit a course
});

app.get("/admin/courses", (req, res) => {
  // logic to get all courses
});

// User routes
app.post("/users/signup", (req, res) => {
  // logic to sign up user
});

app.post("/users/login", (req, res) => {
  // logic to log in user
});

app.get("/users/courses", (req, res) => {
  // logic to list all courses
});

app.post("/users/courses/:courseId", (req, res) => {
  // logic to purchase a course
});

app.get("/users/purchasedCourses", (req, res) => {
  // logic to view purchased courses
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
