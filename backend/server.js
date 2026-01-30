const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

app.use("/auth", require("./routes/loginRoute"));
app.use("/data", require("./routes/dataRoute"));
app.use("/admin", require("./routes/adminRoute"));

app.listen(process.env.PORT, () => {
    console.log("Server running on http://localhost:" + process.env.PORT);
});
