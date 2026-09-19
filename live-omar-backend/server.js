const express = require("express");
const dotenv = require("dotenv");
const { AccessToken } = require("livekit-server-sdk");

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Live Omar Backend is running!");
});

app.post("/token", async (req, res) => {
  try {
    const { room, username } = req.body;

    if (!room || !username) {
      return res.status(400).json({
        error: "room and username are required"
      });
    }

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: username,
      }
    );

    token.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();

    res.json({ token: jwt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create token" });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});