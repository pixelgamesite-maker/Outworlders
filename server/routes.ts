import type { Express } from "express";
import type { Server } from "http";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const applicationSchema = z.object({
  evmAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM wallet address"),
  xUsername: z.string().min(1, "X handle is required"),
  quoteTweet: z.string().min(1, "Quote tweet link is required"),
});

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // POST /api/applications — submit whitelist application
  app.post("/api/applications", async (req, res) => {
    try {
      const input = applicationSchema.parse(req.body);

      const { data, error } = await supabase
        .from("applications")
        .insert({
          evm_address: input.evmAddress,
          x_username: input.xUsername,
          quote_tweet: input.quoteTweet,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({ message: error.message });
      }

      // Optional email notification
      if (process.env.RESEND_API_KEY) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Outworlders <onboarding@resend.dev>",
              to: "delivered@resend.dev",
              subject: "New Outworlder Signal Received",
              html: `
                <div style="font-family: monospace; background: #050505; color: #c8ff00; padding: 24px;">
                  <h2>◈ NEW SIGNAL REGISTERED</h2>
                  <p><strong>X Handle:</strong> ${input.xUsername}</p>
                  <p><strong>EVM Address:</strong> ${input.evmAddress}</p>
                  <p><strong>Quote Tweet:</strong> ${input.quoteTweet}</p>
                  <hr />
                  <p style="font-size: 11px; color: #666;">OUTWORLD3RS · Reality stops negotiating.</p>
                </div>
              `,
            }),
          });
        } catch (e) {
          console.error("Email failed:", e);
        }
      }

      return res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: err.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
        });
      }
      console.error("Route error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET /api/status/:address — check application status
  app.get("/api/status/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const { data, error } = await supabase
        .from("applications")
        .select("created_at")
        .eq("evm_address", address)
        .maybeSingle();

      if (error) return res.status(500).json({ message: error.message });
      if (!data) return res.status(404).json({ message: "Not found" });

      return res.status(200).json({ status: "submitted", timestamp: data.created_at });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
