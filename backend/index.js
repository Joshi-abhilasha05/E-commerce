const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Ensure upload folder exists
const uploadDir = './upload/images';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// MongoDB Connection
mongoose.connect("mongodb+srv://abhilasha:Abhi0189@cluster0.m45wf.mongodb.net/e-commerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log(" MongoDB connected"))
    .catch(err => console.error(" MongoDB connection error:", err));

//  Root Route
app.get("/", (req, res) => {
    res.send(" Express App is Running!");
});

// Image Storage Engine
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });
app.use('/images', express.static(uploadDir));

//  Image Upload Endpoint
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${PORT}/images/${req.file.filename}`
    });
});

// Product Schema
const ProductSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true },
});
const Product = mongoose.model("Product", ProductSchema);

//  Add Product Endpoint
app.post('/addproduct', async (req, res) => {
    try {
        let products = await Product.find({});
        let newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;

        const { name, image, category, new_price, old_price } = req.body;
        if (!name || !image || !category || !new_price || !old_price) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const product = new Product({ id: newId, name, image, category, new_price, old_price });
        await product.save();

        res.json({ success: true, name: product.name });
    } catch (error) {
        console.error(" Error adding product:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Delete Product Endpoint
app.post('/removeproduct', async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: req.body.id });
        res.json({ success: true, name: req.body.name });
    } catch (error) {
        console.error(" Error deleting product:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

//  User Schema
const Users = mongoose.model('Users', {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    cartData: { type: Map, of: Number },
    date: { type: Date, default: Date.now }
});

//  User Signup Endpoint
app.post('/signup', async (req, res) => {
    try {
        let check = await Users.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({ success: false, errors: "User with this email already exists" });
        }

        let cart = {};
        for (let i = 0; i < 300; i++) cart[i] = 0;

        const user = new Users({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            cartData: cart,
        });

        await user.save();
        const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom');
        res.json({ success: true, token });
    } catch (error) {
        console.error(" Error signing up:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// User Login Endpoint
app.post('/login', async (req, res) => {
    try {
        let user = await Users.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ success: false, errors: "Invalid Email" });
        }

        if (req.body.password !== user.password) {
            return res.status(400).json({ success: false, errors: "Invalid Password" });
        }

        const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom');
        res.json({ success: true, token });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Get All Products Endpoint
app.get('/allproducts', async (req, res) => {
    try {
        let products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error(" Error fetching products:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

//  Get New Collections (Latest 8 Products)
app.get('/newcollections', async (req, res) => {
    try {
        let products = await Product.find({});
        let newcollection = products.slice(-8); // Get last 8 items
        res.json(newcollection);
    } catch (error) {
        console.error(" Error fetching new collections:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
app.get('/popularinwomen', async (req, res) => {
    try {
        let products = await Product.find({ category: "women" }).limit(4);
        console.log("Popular in women fetched");
        res.json(products);
    } catch (error) {
        console.error("Error fetching popular women products:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ errors: "Please authenticate using valid token" });

    }
    else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({ errors: "please authenticate using a valid token " });
        }
    }
}
app.post('/addtocart', fetchUser, async (req, res) => {
    console.log("Added", req.body.itemId);
    try {
        const userId = req.user.id;
        const itemId = req.body.itemId;

        // Check if the user exists
        let user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Increment cart count in database
        const updateQuery = {};
        updateQuery[`cartData.${itemId}`] = 1;

        await Users.findByIdAndUpdate(userId, { $inc: updateQuery }, { new: true });

        // Fetch updated user data
        user = await Users.findById(userId);

        res.json({ success: true, message: "Item added to cart", cart: user.cartData });
    } catch (error) {
        console.error(" Error adding to cart:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("removed", req.body.itemId);
    try {
        const userId = req.user.id;
        const itemId = req.body.itemId;

        // Get user data
        let user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if the item exists in the cart and is greater than 0
        if (user.cartData[itemId] && user.cartData[itemId] > 0) {
            const updateQuery = {};
            updateQuery[`cartData.${itemId}`] = -1;

            // Decrement the count in MongoDB
            await Users.findByIdAndUpdate(userId, { $inc: updateQuery }, { new: true });
        } else {
            // Ensure the cart value doesn't go negative
            await Users.findByIdAndUpdate(userId, { $set: { [`cartData.${itemId}`]: 0 } }, { new: true });
        }

        // Fetch updated cart
        user = await Users.findById(userId);

        res.json({ success: true, message: "Item removed from cart", cart: user.cartData });
    } catch (error) {
        console.error(" Error removing from cart:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
//creating end point to get cartdata
app.post('/getcart', fetchUser, async (req, res) => {
    console.log("GetCart");
    let userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.cartData);
})

// Start Server
app.listen(PORT, (error) => {
    if (!error) {
        console.log(` Server running on http://localhost:${PORT}`);
    } else {
        console.error(" Server startup error:", error);
    }
});
