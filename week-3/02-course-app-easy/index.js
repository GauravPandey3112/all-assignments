const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");

const app = express();
app.use(bodyParser.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

// Admin routes
app.post("/admin/signup", (req, res) => {
  // logic to sign up admin
  const { username, password } = req.body;
  const userExists = ADMINS.some((admin) => admin.username === username);
  if (userExists) {
    res.status(400).send("Username already exists");
  } else {
    const admin = {
      username,
      password,
    };

    ADMINS.push(admin);
    res.status(201).send("User created successfully");
  }
});

app.post("/admin/login", (req, res) => {
  // logic to log in admin
  const { username, password } = req.headers;

  const userExists = ADMINS.find(
    (admin) => admin.username === username && admin.password === password
  );

  if (userExists) {
    res.send(200).send("Logged in successfully");
  } else {
    res.send(401).send("Unauthorized");
  }
});
//Admin authenticate
const adminAuthenticate = (req, res, next) => {
  const { username, password } = req.headers;

  // Check if userExists
  const userExists = ADMINS.find(
    (admin) => admin.username === username && admin.password === password
  );
  if (userExists) {
    next(); // Proceed to the next middleware/route handler
  } else {
    res.status(401).send("Unauthorized"); // Invalid credentials
  }
};
app.post("/admin/courses", adminAuthenticate, (req, res) => {
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
  COURSES.push(course);
  res.status(201).json({
    message: "Course created successfully",
    courseId: id,
  });
});

app.put("/admin/courses/:courseId", adminAuthenticate, (req, res) => {
  // logic to edit a course
  const courseId = req.params.courseId;
  const { title, description, price, imageLink, published } = req.body;

  // Find the course with the given ID
  const courseIndex = COURSES.findIndex((course) => course.id === courseId);

  if (courseIndex === -1) {
    return res.status(404).json({ message: "Course not found" });
  }

  // Update the course object
  const updatedCourse = {
    ...COURSES[courseIndex],
    ...(title && { title }),
    ...(description && { description }),
    ...(price && { price }),
    ...(imageLink && { imageLink }),
    ...(published !== undefined && { published }),
  };

  // Update the course in the array
  COURSES[courseIndex] = updatedCourse;

  res.json({ message: "Course updated successfully" });
});

app.get("/admin/courses", adminAuthenticate, (req, res) => {
  // logic to get all courses
  res.json({
    courses: COURSES,
  });
});

// User routes
app.post("/users/signup", (req, res) => {
  // logic to sign up user
  const { username, password } = req.body;
  const userExists = USERS.some((user) => user.username === username);
  if (userExists) {
    res.status(400).send("Username already exists");
  } else {
    const user = {
      username,
      password,
      purchasedCourses: []
    };

    USERS.push(user);
    res.status(201).send("User created successfully");
  }
});

app.post("/users/login", (req, res) => {
  // logic to log in user
  const { username, password } = req.headers;

  const userExists = USERS.find(
    (user) => user.username === username && user.password === password
  );

  if (userExists) {
    res.send(200).send("Logged in successfully");
  } else {
    res.send(401).send("Unauthorized");
  }
});

const userAuthenticate = (req, res, next) => {
  const { username, password } = req.headers;

  // Check if userExists
  const userExists = USERS.find(
    (user) => user.username === username && user.password === password
  );
  if (userExists) {
    req.user=userExists;
    next(); // Proceed to the next middleware/route handler
  } else {
    res.status(401).send("Unauthorized"); // Invalid credentials
  }
};
app.get("/users/courses", userAuthenticate, (req, res) => {
  // logic to list all courses
  const publishedCourses=COURSES.filter( course=> course.published === true)
  res.json({
    courses: publishedCourses,
  });
});

app.post("/users/courses/:courseId",userAuthenticate, (req, res) => {
  // logic to purchase a course
  const { username, password } = req.headers;
  const courseId=req.params.courseId;
  const userIdx=findUserIdx(username,password);

  const courseIdx=COURSES.findIndex( course=> course.published === true && id === courseId)

  if(courseIdx !== -1){
    const courseExists=USERS[userIdx].publishedCourses.findIndex(course => course.id === COURSES[courseIdx].id)
    if(courseExists !== -1){
      res.status(409).send("Course already purchased")
    }else{
      USERS[userIdx].publishedCourses.push(COURSES[courseIdx])
      res.json({ message: 'Course purchased successfully' });
    }
    
  }else{
    res.status(404)
  }

});

const findUserIdx=(username,password)=>{
  return USERS.findIndex(
    (user) => user.username === username && user.password === password
  );

}

app.get("/users/purchasedCourses",userAuthenticate, (req, res) => {
  // logic to view purchased courses
  const { username, password } = req.headers;
  const userIdx=findUserIdx(username,password);
  const purchasedCourses=USERS[userIdx].purchasedCourses

  res.json({
    purchasedCourses
  })
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
