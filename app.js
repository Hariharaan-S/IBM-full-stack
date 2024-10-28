import express from "express";
import jsonwebtoken from "jsonwebtoken";

const json_secret = "Akas1212jjjkmsdsl334";
const app = express();
app.use(express.json()); // Middleware to parse JSON requests

const book_list = [
    { isbn: "303-ed-ere-444-eee", author: "Author 1", title: "Title 1", reviews: [] },
    { isbn: "303-ed-ere-444-eef", author: "Author 2", title: "Title 2", reviews: [] },
    { isbn: "303-ed-ere-444-eeg", author: "Author 3", title: "Title 3", reviews: [] },
    { isbn: "303-ed-ere-444-eeh", author: "Author 4", title: "Title 4", reviews: [] },
    { isbn: "303-ed-ere-444-eei", author: "Author 5", title: "Title 5", reviews: [] }
];

let user_list = [];

// Middleware for token verification
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ message: "Token required" });

    jsonwebtoken.verify(token, json_secret, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid token" });
        req.user = decoded;
        next();
    });
};

// Register a new user
app.post("/register/new/user", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }
    user_list.push([username, password]);
    const token = jsonwebtoken.sign({ user: username }, json_secret);
    res.json({ message: "User created successfully", token });
});

// User login
app.post("/login/user", (req, res) => {
    const { username, password } = req.body;
    for (let i = 0; i < user_list.length; i++) {
        const [saved_username, saved_password] = user_list[i];
        if (saved_password === password && saved_username === username) {
            const token = jsonwebtoken.sign({ user: username }, json_secret);
            return res.json({ message: "Logged in", token });
        }
    }
    res.status(401).json({ message: "No user found" });
});

// Get all books
app.get("/get/books/all", (req, res) => {
    res.json({ books: book_list });
});

// Add a book review (requires authentication)
app.post("/add/book/review", verifyToken, (req, res) => {
    const { isbn, review } = req.body;
    const book = book_list.find((b) => b.isbn === isbn);
    if (book) {
        book.reviews.push({ user: req.user.user, review });
        res.json({ message: "Review added", book });
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

// Modify a book review (requires authentication)
app.put("/modify/book/review", verifyToken, (req, res) => {
    const { isbn, review } = req.body;
    const book = book_list.find((b) => b.isbn === isbn);
    if (book) {
        const userReview = book.reviews.find((r) => r.user === req.user.user);
        if (userReview) {
            userReview.review = review;
            res.json({ message: "Review updated", book });
        } else {
            res.status(404).json({ message: "Review by user not found" });
        }
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

// Delete a book review (requires authentication)
app.delete("/delete/book/review", verifyToken, (req, res) => {
    const { isbn } = req.body;
    const book = book_list.find((b) => b.isbn === isbn);
    if (book) {
        book.reviews = book.reviews.filter((r) => r.user !== req.user.user);
        res.json({ message: "Review deleted", book });
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

// Search for a book by detail
app.get("/search/book/:book_detail", (req, res) => {
    const search_var = req.params.book_detail;
    const book = book_list.find(
        (b) =>
            b.isbn === search_var ||
            b.author === search_var ||
            b.title === search_var
    );
    if (book) {
        res.json({ book });
    } else {
        res.json({ error: "Not found" });
    }
});

// Home route
app.get("/", (req, res) => {
    res.json({ message: "Hello" });
});

// Start the server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
