require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const morgan = require("morgan")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const Feedback = require("./models/Feedback.models.js")
const Product = require("./models/Product.js")
const User = require("./models/User.js");
const Address = require("./models/Address.js");
const Order = require("./models/Order.js");
const Cart = require('./models/Cart.js');
const Blog = require('./models/Blog.js');

const app = express()
const port = 3000

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:4200"
const PASSWORD_RESET_EXPIRES_MINUTES = Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES || 15)
const SMTP_USER = process.env.SMTP_USER || ""
const SMTP_PASS = process.env.SMTP_PASS || ""

const mailTransport = SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  : null

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex")
}

async function sendPasswordResetEmail(toEmail, resetLink) {
  if (!mailTransport) {
    console.warn("[auth] SMTP_USER/SMTP_PASS is missing, skip sending reset email")
    return
  }

  await mailTransport.sendMail({
    from: `"SẮC – Thời Trang" <${SMTP_USER}>`,
    to: toEmail,
    subject: "🔐 Đặt lại mật khẩu tài khoản SẮC của bạn",
    text: `Xin chào,\n\nChúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản SẮC của bạn.\n\nTruy cập liên kết sau để đặt lại mật khẩu (có hiệu lực trong ${PASSWORD_RESET_EXPIRES_MINUTES} phút):\n${resetLink}\n\nNếu bạn không yêu cầu điều này, hãy bỏ qua email này — tài khoản của bạn vẫn an toàn.\n\nTrân trọng,\nĐội ngũ SẮC`,
    html: `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#fdf6f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdf6f0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#8b2f3f;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;letter-spacing:0.12em;">SẮC</h1>
              <p style="margin:6px 0 0;color:rgba(255,222,228,0.85);font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">Thời Trang Thuần Việt</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;">Quên mật khẩu? 🔑</p>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;">
                Xin chào,<br>
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong style="color:#8b2f3f;">SẮC</strong> của bạn.
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#777;line-height:1.6;">
                Bấm vào nút bên dưới để tạo mật khẩu mới. Liên kết chỉ có hiệu lực trong <strong>${PASSWORD_RESET_EXPIRES_MINUTES} phút</strong>.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="border-radius:50px;background-color:#8b2f3f;">
                    <a href="${resetLink}" style="display:inline-block;padding:14px 36px;color:#fff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.04em;border-radius:50px;">
                      ✨ Đặt lại mật khẩu
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#999;line-height:1.6;">
                Nếu nút không hoạt động, hãy copy và dán liên kết này vào trình duyệt:
              </p>
              <p style="margin:0 0 32px;word-break:break-all;">
                <a href="${resetLink}" style="font-size:12px;color:#8b2f3f;">${resetLink}</a>
              </p>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f8;border-left:3px solid #8b2f3f;border-radius:4px;">
                <tr>
                  <td style="padding:14px 16px;font-size:13px;color:#666;line-height:1.6;">
                    ⚠️ <strong>Không phải bạn yêu cầu?</strong> Hãy bỏ qua email này — tài khoản của bạn vẫn hoàn toàn an toàn.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fdf6f0;padding:24px 40px;text-align:center;border-top:1px solid #f0e8e0;">
              <p style="margin:0 0 4px;font-size:13px;color:#aaa;">© 2026 SẮC – Thời Trang Thuần Việt</p>
              <p style="margin:0;font-size:12px;color:#bbb;">Email này được gửi tự động, vui lòng không trả lời.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}

function sanitizeUser(userDoc) {
  if (!userDoc) return userDoc
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc }
  delete user.password
  delete user.passwordResetTokenHash
  delete user.passwordResetExpiresAt
  return user
}

app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))
app.use(morgan("dev"))
const imageDir = path.join(__dirname, "public", "images")
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true })
}
app.use("/images", express.static(imageDir))

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, imageDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
    cb(null, `${base || "image"}${ext}`)
  }
})

const upload = multer({ storage })

const mongoUri = process.env.MONGODB_URI || "mongodb+srv://sac_admin:admin1234@admindb.d3miums.mongodb.net/";
mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB connected to:", mongoUri))
  .catch(err => console.log("MongoDB connection error:", err));

app.get("/", (req,res)=>{
    res.send("Hello Restful API")
})

/* FEEDBACK */
app.post("/feedback", async (req,res)=>{
    try{
        const feedback = new Feedback(req.body)
        await feedback.save()
        res.json(feedback)
    }catch(err){
        res.status(500).json(err)
    }
})

app.get("/feedback", async (req,res)=>{
    try{
        const feedbacks = await Feedback.find()
        res.json(feedbacks)
    }catch(err){
        res.status(500).json(err)
    }
})
app.put("/feedback/:id", async (req,res)=>{
    try{
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        )
        res.json(feedback)
    }catch(err){
        res.status(500).json(err)
    }
})
app.delete("/feedback/:id", async (req,res)=>{
    try{
        await Feedback.findByIdAndDelete(req.params.id)
        res.json({message:"Feedback deleted"})
    }catch(err){
        res.status(500).json(err)
    }
})

app.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Chưa có file ảnh" })
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
  res.json({
    fileName: req.file.filename,
    imageUrl
  })
})

function toSlug(text = "") {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function buildUniqueSlug(baseText, excludeId = null) {
  const base = toSlug(baseText) || `product-${Date.now()}`;
  let slug = base;
  let i = 1;

  while (
    await Product.exists(
      excludeId
        ? { slug, _id: { $ne: excludeId } }
        : { slug }
    )
  ) {
    slug = `${base}-${i++}`;
  }

  return slug;
}

async function buildUniqueBlogSlug(baseText, excludeId = null) {
  const base = toSlug(baseText) || `blog-${Date.now()}`;
  let slug = base;
  let i = 1;

  while (
    await Blog.exists(
      excludeId
        ? { slug, _id: { $ne: excludeId } }
        : { slug }
    )
  ) {
    slug = `${base}-${i++}`;
  }

  return slug;
}

app.post("/products", async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.slug) {
      payload.slug = await buildUniqueSlug(payload.product_name);
    }

    // For accessories (product_dept === 'phu-kien'), accept a single stock number
    const validSizes = ["S", "M", "L", "XL"];
    if (payload.product_dept === 'phu-kien') {
      // require numeric stock >= 0
      if (typeof payload.stock !== 'number' || payload.stock < 0) {
        return res.status(400).json({ message: "Phụ kiện cần trường `stock` là số >= 0." });
      }
      // ensure sizes is empty array for accessories
      payload.sizes = [];
    } else {
      // Validate sizes array for clothing items
      if (!Array.isArray(payload.sizes) || payload.sizes.length === 0) {
        return res.status(400).json({ message: "Sản phẩm phải có ít nhất một size với số lượng." });
      }
      for (const s of payload.sizes) {
        if (!s.size || !validSizes.includes(s.size)) {
          return res.status(400).json({ message: `Size không hợp lệ: ${s.size}` });
        }
        if (typeof s.quantity !== "number" || s.quantity < 0) {
          return res.status(400).json({ message: `Số lượng cho size ${s.size} phải là số không âm.` });
        }
      }
    }

    const product = new Product(payload);
    const savedProduct = await product.save();
    res.json(savedProduct);
  } catch (err) {
    res.status(500).json({
      message: "Tạo sản phẩm thất bại",
      error: err?.message || err
    });
  }
});

/* PRODUCTS */
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.slug && payload.product_name) {
      payload.slug = await buildUniqueSlug(payload.product_name, req.params.id);
    }
    // For accessories (product_dept === 'phu-kien'), accept stock field and clear sizes
    const validSizes = ["S", "M", "L", "XL"];
    if (payload.product_dept === 'phu-kien') {
      if (typeof payload.stock !== 'number' || payload.stock < 0) {
        return res.status(400).json({ message: "Phụ kiện cần trường `stock` là số >= 0." });
      }
      payload.sizes = [];
    } else if (payload.sizes) {
      if (!Array.isArray(payload.sizes) || payload.sizes.length === 0) {
        return res.status(400).json({ message: "Sản phẩm phải có ít nhất một size với số lượng." });
      }
      for (const s of payload.sizes) {
        if (!s.size || !validSizes.includes(s.size)) {
          return res.status(400).json({ message: `Size không hợp lệ: ${s.size}` });
        }
        if (typeof s.quantity !== "number" || s.quantity < 0) {
          return res.status(400).json({ message: `Số lượng cho size ${s.size} phải là số không âm.` });
        }
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json({
      message: "Cập nhật sản phẩm thất bại",
      error: err?.message || err
    });
  }
});

/* BLOGS */
app.post("/blogs", async (req, res) => {
  try {
    const payload = { ...req.body };

    if (!payload.title || !payload.content) {
      return res.status(400).json({ message: "Thiếu tiêu đề hoặc nội dung bài viết" });
    }

    // Xử lý authorId - nếu không có hoặc rỗng thì tạo một ObjectId mặc định
    if (!payload.authorId || payload.authorId.trim() === '') {
      // Tạo một ObjectId mặc định hoặc tìm admin user
      payload.authorId = new mongoose.Types.ObjectId();
    } else {
      // Kiểm tra authorId có phải ObjectId hợp lệ không
      if (!mongoose.Types.ObjectId.isValid(payload.authorId)) {
        payload.authorId = new mongoose.Types.ObjectId();
      }
    }

    // Đảm bảo có authorName
    if (!payload.authorName || payload.authorName.trim() === '') {
      payload.authorName = 'Admin';
    }

    if (!payload.slug) {
      payload.slug = await buildUniqueBlogSlug(payload.title);
    } else {
      payload.slug = await buildUniqueBlogSlug(payload.slug);
    }

    if (payload.status === "published" && !payload.publishedAt) {
      payload.publishedAt = new Date();
    }

    if (typeof payload.tags === "string") {
      payload.tags = payload.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean);
    }

    console.log('Creating blog with payload:', JSON.stringify(payload, null, 2));
    
    const blog = new Blog(payload);
    const savedBlog = await blog.save();
    
    console.log('Blog created successfully:', savedBlog._id);
    res.status(201).json(savedBlog);
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({
      message: "Tạo bài viết thất bại",
      error: err?.message || err,
      details: err.name === 'ValidationError' ? err.errors : undefined
    });
  }
});

app.get("/blogs", async (req, res) => {
  try {
    const { q, status, category, tag } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { excerpt: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } }
      ];
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/blogs/:id", async (req, res) => {
  try {
    const payload = { ...req.body };

    if (payload.title && !payload.slug) {
      payload.slug = await buildUniqueBlogSlug(payload.title, req.params.id);
    }

    if (payload.slug) {
      payload.slug = await buildUniqueBlogSlug(payload.slug, req.params.id);
    }

    if (payload.status === "published" && !payload.publishedAt) {
      payload.publishedAt = new Date();
    }

    if (typeof payload.tags === "string") {
      payload.tags = payload.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean);
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    res.json(blog);
  } catch (err) {
    res.status(500).json({
      message: "Cập nhật bài viết thất bại",
      error: err?.message || err
    });
  }
});

app.delete("/blogs/:id", async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* USER */
app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    res.send(sanitizeUser(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }

    let isPasswordValid = await bcrypt.compare(password, user.password);

    // Backward compatibility for old plain-text passwords in database.
    if (!isPasswordValid && password === user.password) {
      user.password = password;
      await user.save();
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }

    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/users/forgot-password", async (req, res) => {
  try {
    const email = (req.body?.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Email la bat buoc" });
    }

    const user = await User.findOne({ email });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = sha256(rawToken);

      user.passwordResetTokenHash = tokenHash;
      user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000);
      await user.save();

      const resetLink = `${FRONTEND_BASE_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;
      await sendPasswordResetEmail(user.email, resetLink);
    }

    return res.json({
      message: "Neu email ton tai, he thong da gui link dat lai mat khau.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/users/reset-password", async (req, res) => {
  try {
    const token = (req.body?.token || "").trim();
    const newPassword = req.body?.newPassword || "";

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Thieu token hoac mat khau moi" });
    }

    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);

    if (!hasMinLength || !hasUppercase || !hasLowercase) {
      return res.status(400).json({ message: "Mat khau moi chua dat yeu cau" });
    }

    const tokenHash = sha256(token);
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token khong hop le hoac da het han" });
    }

    user.password = newPassword;
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    return res.json({ message: "Dat lai mat khau thanh cong" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users.map(sanitizeUser));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.send(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.send({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ADDRESS */
app.post("/addresses", async (req, res) => {
  try {
    const address = new Address(req.body);
    const savedAddress = await address.save();
    res.json(savedAddress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/addresses/:userId", async (req, res) => {
  try {
    const address = await Address.findOne({ userId: req.params.userId });
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.put("/addresses/:id", async (req, res) => {
  try {
    const address = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.delete("/addresses/:id", async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params.id);
    res.json({ message: "Address deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ORDER */
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN STATS - aggregated counts and revenue
app.get("/api/admin/stats", async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const ordersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const revenue = revenueAgg && revenueAgg.length ? revenueAgg[0].total || 0 : 0;

    res.json({ users: usersCount, orders: ordersCount, products: productsCount, revenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get("/orders/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.post("/orders", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.put("/orders/:id/status", async (req, res) => {
  try {
    // Load existing order so we can inspect paymentMethod/isPaid
    const existing = await Order.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Order not found' });

    const newStatus = req.body.status;
    const updateData = { status: newStatus };

    const pm = (existing.paymentMethod || '').toString().toLowerCase();
    // If marking delivered and payment method is COD/cash, mark as paid
    if (newStatus === 'delivered' && (pm === 'cod' || pm === 'cash') && !existing.isPaid) {
      updateData.isPaid = true;
      updateData.paidAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.put("/orders/:id/cancel", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.delete("/orders/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* CART */
app.get("/cart", async (req, res) => {
  try {
    const cart = await Cart.find().sort({ createdAt: -1 });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get("/cart/user/:userId", async (req, res) => {
  try {
    const cart = await Cart.find({ userId: req.params.userId });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.post("/cart", async (req, res) => {
  try {
    const { userId, name, price, quantity, image } = req.body;
    let item = await Cart.findOne({ userId, name });
    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      item = new Cart({ userId, name, price, quantity, image });
      await item.save();
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.put("/cart/:id", async (req, res) => {
  try {
    const item = await Cart.findByIdAndUpdate(req.params.id, { quantity: req.body.quantity }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.delete("/cart/:id", async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.delete("/cart/user/:userId", async (req, res) => {
  try {
    await Cart.deleteMany({ userId: req.params.userId });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create order from cart
app.post("/order/from-cart", async (req, res) => {
  try {
    const { userId, customerInfo, paymentMethod } = req.body;
    
    // Get cart items
    const cartItems = await Cart.find({ userId });
    
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order with correct Order model structure
    const pm = (paymentMethod || (customerInfo && customerInfo.paymentMethod) || 'online').toString().toLowerCase();
    const isOnlinePaid = pm !== 'cod' && pm !== 'cash';

    const order = new Order({
      user: userId, // ObjectId reference
      userName: customerInfo.name,
      orderItems: cartItems.map(item => ({
        name: item.name,
        qty: item.quantity,
        price: item.price,
        image: item.image,
        // product: null // We don't have product ID from cart
      })),
      totalPrice: total,
      status: "pending",
      paymentMethod: pm,
      isPaid: !!isOnlinePaid,
      paidAt: isOnlinePaid ? new Date() : null
    });

    await order.save();

    // Clear cart after successful order
    await Cart.deleteMany({ userId });

    res.json({ 
      message: "Order created successfully",
      orderId: order._id,
      order: order
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, ()=>{
    console.log(`Server running at http://localhost:${port}`)
})