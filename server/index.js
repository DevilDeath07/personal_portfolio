require('dotenv').config();
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')));

// Check Environment Variables
console.log("Mongo URI Loaded:", process.env.MONGODB_URI ? "Yes" : "No");

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../client/public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

require('dotenv').config();

// ----- MONGODB CONNECTION HANDLER -----

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing in .env file");
        }

        console.log("Connecting to MongoDB Atlas...");

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(" MongoDB Atlas Connected Successfully!");

    } catch (error) {
        console.error(" MongoDB Connection Failed:");
        console.error(error.message);

        console.log("\nPossible Reasons:");
        console.log("1. IP not whitelisted in MongoDB Atlas");
        console.log("2. Wrong username or password in connection string");
        console.log("3. Internet connection issue");
        console.log("4. Database cluster is paused or not running");

        process.exit(1);
    }
};

// Call Connection
connectDB();


// ----------------- MODELS -----------------

const Contact = require('./models/Contact');
const Certificate = require('./models/Certificate');
const Skill = require('./models/Skill');
const Project = require('./models/Project');
const Profile = require('./models/Profile');
const User = require('./models/User');
const Experience = require('./models/Experience');

// ----------------- HELPER FUNCTION -----------------

const updateLocalDataFile = async (key, newData) => {
    const filePath = path.join(__dirname, '../client/src/data/index.js');

    try {
        let content = fs.readFileSync(filePath, 'utf8');

        if (key === 'profile') {
            const regex = /(export const profile = )(\{[\s\S]*?\})(;)/;
            const newProfileStr = JSON.stringify(newData, null, 2);
            content = content.replace(regex, `$1${newProfileStr}$3`);
        } else {
            const regex = new RegExp(`(export const ${key} = \\[)([\\s\\S]*?)(\\];)`);

            if (content.match(regex)) {
                content = content.replace(regex, (match, p1, p2, p3) => {
                    const inner = p2.trim();
                    const newItemStr = JSON.stringify(newData, null, 2);
                    const sep = inner.length > 0 ? ',\n' : '\n';
                    return `${p1}\n${inner}${sep}${newItemStr}\n${p3}`;
                });
            }
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(` Local data file updated for ${key}`);
    } catch (err) {
        console.error(' Error updating local data file:', err);
    }
};

// ----------------- DEFAULT USERS SEED -----------------

const seedDefaultUser = async () => {
    try {
        const demoUser = await User.findOne({ username: 'demo' });
        if (!demoUser) {
            const hashedPassword = await bcrypt.hash('demo@1234', 10);
            await new User({ username: 'demo', password: hashedPassword }).save();
            console.log(' Default user "demo" created.');
        }

        const adminUser = await User.findOne({ username: 'admin' });
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash('1234', 10);
            await new User({ username: 'admin', password: hashedPassword }).save();
            console.log(' Default user "admin" created.');
        }

    } catch (error) {
        console.error(' Error creating default users:', error);
    }
};

mongoose.connection.once('open', seedDefaultUser);

// ----------------- AUTH ROUTES -----------------

app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser)
            return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        await new User({ username, password: hashedPassword }).save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user)
            return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword)
            return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET || 'secretkey'
        );

        res.json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// ----------------- CONTACT ROUTE -----------------

app.post('/api/contact', async (req, res) => {
    try {
        await new Contact(req.body).save();
        res.status(201).json({ message: 'Message sent successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// ----------------- CERTIFICATES -----------------

app.get('/api/certificates', async (req, res) => {
    try {
        const data = await Certificate.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
});

app.post('/api/certificates', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: 'No file uploaded' });

        const { title, issuer, year, description } = req.body;

        const newCert = new Certificate({
            title,
            issuer,
            year,
            description,
            fileUrl: `/uploads/${req.file.filename}`
        });

        await newCert.save();
        await updateLocalDataFile('certificates', newCert.toObject());

        res.status(201).json(newCert);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add certificate' });
    }
});

// ----------------- SKILLS -----------------

app.get('/api/skills', async (req, res) => {
    try {
        const data = await Skill.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
});

app.post('/api/skills', authenticateToken, async (req, res) => {
    try {
        const newSkill = await new Skill(req.body).save();
        await updateLocalDataFile('skills', newSkill.toObject());

        res.status(201).json(newSkill);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add skill' });
    }
});

// ----------------- SERVER START -----------------

app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});

module.exports = app;
