import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  /**
   * POST: Create a new application
   */
  app.post(api.applications.create.path, async (req, res) => {
    try {
      const input = api.applications.create.input.parse(req.body);
      const application = await storage.createApplication(input);

      if (process.env.RESEND_API_KEY) {
        try {
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'Outworlders <onboarding@resend.dev>',
              to: 'delivered@resend.dev',
              subject: 'New Outworlder Signal Received',
              html: `
                <div style="font-family: monospace; background: #050505; color: #c8ff00; padding: 24px;">
                  <h2 style="letter-spacing: 0.1em;">◈ NEW SIGNAL REGISTERED</h2>
                  <p><strong>X Handle / Link:</strong> ${application.xUsername}</p>
                  <p><strong>EVM Address:</strong> ${application.evmAddress}</p>
                  <p><strong>Quote Tweet:</strong> ${application.quoteTweet}</p>
                  <hr style="border-color: rgba(200,255,0,0.2); margin: 16px 0;" />
                  <p style="font-size: 11px; color: #666;">OUTWORLD3RS · Reality stops negotiating.</p>
                </div>
              `
            })
          });

          if (!resendRes.ok) {
            console.error('Resend API error:', await resendRes.text());
          }
        } catch (e) {
          console.error('Email service failed:', e);
        }
      } else {
        console.log("RESEND_API_KEY not set. Storing application in DB only.");
      }

      res.status(201).json(application);

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }

      console.error("Route Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  /**
   * GET: Check application status by EVM address
   */
  app.get(api.applications.status.path, async (req, res) => {
    try {
      const { address } = req.params;

      if (!address) {
        return res.status(400).json({ message: "Wallet address is required" });
      }

      const application = await storage.getApplicationByAddress(address);

      if (!application) {
        return res.status(404).json({ message: "No application found for this address" });
      }

      res.status(200).json({
        status: "submitted",
        timestamp: application.createdAt
      });

    } catch (err) {
      console.error("Status Route Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
