const express = require("express");
const router = express.Router();

// Mock data for development
const courses = [
  {
    id: 1,
    title: "Introduction to Web Development",
    instructor: "John Smith",
    description:
      "Learn the basics of HTML, CSS, and JavaScript to build modern websites.",
    duration: "8 weeks",
    level: "Beginner",
    category: "programming",
    price: "$49.99",
    thumbnail: "https://via.placeholder.com/300x200?text=Web+Development",
  },
  {
    id: 2,
    title: "UI/UX Design Principles",
    instructor: "Sarah Johnson",
    description:
      "Master the art of creating beautiful and functional user interfaces.",
    duration: "6 weeks",
    level: "Intermediate",
    category: "design",
    price: "$59.99",
    thumbnail: "https://via.placeholder.com/300x200?text=UI/UX+Design",
  },
  {
    id: 3,
    title: "Digital Marketing Fundamentals",
    instructor: "Michael Brown",
    description: "Learn how to create effective digital marketing campaigns.",
    duration: "4 weeks",
    level: "Beginner",
    category: "marketing",
    price: "$39.99",
    thumbnail: "https://via.placeholder.com/300x200?text=Digital+Marketing",
  },
  {
    id: 4,
    title: "Business Analytics",
    instructor: "Emma Williams",
    description:
      "Learn how to analyze business data to make informed decisions.",
    duration: "10 weeks",
    level: "Advanced",
    category: "business",
    price: "$79.99",
    thumbnail: "https://via.placeholder.com/300x200?text=Business+Analytics",
  },
];

// Get all courses
router.get("/", (req, res) => {
  res.json(courses);
});

// Get course by ID
router.get("/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  res.json(course);
});

// Create new course
router.post("/", (req, res) => {
  // This is a mock implementation
  const newCourse = {
    id: courses.length + 1,
    ...req.body,
  };

  courses.push(newCourse);
  res.status(201).json(newCourse);
});

// Update course
router.put("/:id", (req, res) => {
  const courseIndex = courses.findIndex(
    (c) => c.id === parseInt(req.params.id)
  );

  if (courseIndex === -1) {
    return res.status(404).json({ message: "Course not found" });
  }

  courses[courseIndex] = {
    ...courses[courseIndex],
    ...req.body,
  };

  res.json(courses[courseIndex]);
});

// Delete course
router.delete("/:id", (req, res) => {
  const courseIndex = courses.findIndex(
    (c) => c.id === parseInt(req.params.id)
  );

  if (courseIndex === -1) {
    return res.status(404).json({ message: "Course not found" });
  }

  const deletedCourse = courses.splice(courseIndex, 1);
  res.json({
    message: "Course deleted successfully",
    course: deletedCourse[0],
  });
});

module.exports = router;
