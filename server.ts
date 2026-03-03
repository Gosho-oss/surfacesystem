import express from "express";
import { createServer as createViteServer } from "vite";
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/send-order-email", async (req, res) => {
    try {
      const { orderId, userEmail, width, height, material, price } = req.body;
      
      if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not set. Skipping email.");
        return res.json({ success: true, warning: "Email skipped (no API key)" });
      }

      const data = await resend.emails.send({
        from: 'Orders <onboarding@resend.dev>', // Use Resend's testing domain
        to: ['admin@example.com'], // Replace with actual admin email or use a verified domain
        subject: `New Wallpaper Order: ${orderId}`,
        html: `
          <h2>New Order Received</h2>
          <p><strong>User:</strong> ${userEmail}</p>
          <p><strong>Dimensions:</strong> ${width}cm x ${height}cm</p>
          <p><strong>Material:</strong> ${material}</p>
          <p><strong>Total Price:</strong> €${price.toFixed(2)}</p>
        `
      });

      res.json({ success: true, data });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
