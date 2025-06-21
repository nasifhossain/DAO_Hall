const express = require("express");
const router = express.Router();
const User = require("../schema/User");
const checkAuth = require("../authentication/checkAuth");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
// 📩 Register a new user
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isApproved: false,
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "Registration request sent", user: newUser });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 🔐 Admin-only: Approve user (by ID)
router.put("/approve/:id", checkAuth, async (req, res) => {
  try {
    const currentWallet = req.user.walletAddress;
    //console.log("Current wallet:", currentWallet);
    //console.log("Admin wallet:", ADMIN_WALLET);
    
    if(!req.user.isAdmin){
      return res.status(403).json({ error: "Access denied: Admins only" });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User approved", user });
  } catch (err) {
    res.status(500).json({ error: "Approval failed" });
  }
});

// ✏️ User adds/updates wallet address
router.put("/wallet", async (req, res) => {
  const { email, walletAddress } = req.body;

  try {
    const existingUser = await User.findOne({ walletAddress });
    if (existingUser)
      return res.status(400).json({ error: "Wallet already in use" });
    const user = await User.findOneAndUpdate(
      { email },
      { walletAddress },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Wallet updated", user });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// 🔍 Get profile by email
router.get("/profile", async (req, res) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// 🧾 Admin-only: Get all registration requests
router.get("/requests", checkAuth, async (req, res) => {
  const user = req.user;
  console.log(user.isAdmin);

  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: "Access denied: Admins only" });
  }
  try {

    const users = await User.find({ isApproved: false });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

router.post("/login", async (req, res) => {

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });
    if (!user.isApproved)
      return res.status(403).json({ error: "Not approved by admin yet" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { name: user.name, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});
router.get("/by-wallet/:wallet", async (req, res) => {
  const wallet = req.params.wallet;
  if (!wallet) return res.status(400).json({ error: "Wallet address required" });
  console.log("Auto-login for wallet:", wallet);
  
  try {
    const user = await User.findOne({ walletAddress: wallet });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.isApproved) return res.status(403).json({ error: "User not approved yet" });

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { name: user.name, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (err) {
    console.error("Auto-login error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});


router.get("/all", checkAuth, async (req, res) => {
  try {
    
    if(!req.user.isAdmin){
      return res.status(403).json({ error: "Access denied: Admins only" });
    }

    const users = await User.find({ isApproved: true }).select("-password");
    console.log("Fetched users:", users);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
router.post("/checktransfer", checkAuth, async (req, res) => {
  try {
    const new_admin_email = req.body.email;
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied: Admins only" });
    }
    const new_admin = await User.findOne({ email: new_admin_email });
    if (!new_admin) {
      return res.status(404).json({ error: "New admin not found" });
    }
    if (!new_admin.walletAddress) {
      return res.status(400).json({ error: "New admin wallet address not set" });
    }
    return res.status(200).json({
      message: "Transfer check successful",
      newAdmin: {
        email: new_admin.email,
        walletAddress: new_admin.walletAddress,
      },
    });
  } catch (err) {
    console.error("Error checking transfer:", err);
    res.status(500).json({ error: "Failed to check transfer" });
  }
});
router.post("/transfer", checkAuth, async (req, res) => {
  try {
    const { email, wallet, by } = req.body;
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied: Admins only" });
    }
    const new_admin = await User.findOneAndUpdate(
      {email},
      {isAdmin: true, walletAddress: wallet},
      { new: true }
    );
    const old_admin = await User.findOneAndUpdate(
      { walletAddress: req.user.walletAddress },
      { isAdmin: false },
      { new: true }
    );
    if (!old_admin) {
      return res.status(404).json({ error: "Old admin not found" });
    }
    if (!new_admin) {
      return res.status(404).json({ error: "New admin not found" });
    }
    if (!new_admin.walletAddress) {
      return res.status(400).json({ error: "New admin wallet address not set" });
    }
    if (new_admin.walletAddress!== wallet) {
      return res.status(400).json({
        error: "New admin wallet address does not match",
      });
    }
    // Here you would typically handle the transfer logic, e.g., updating the contract
    // For now, we just simulate a successful transfer
    res.status(200).json({
      message: `Ownership transferred to ${email} (${wallet}) by ${by}`,
    });
  } catch (err) {
    console.error("Error transferring ownership:", err);
    res.status(500).json({ error: "Failed to transfer ownership" });
  }
}
);

module.exports = router;
