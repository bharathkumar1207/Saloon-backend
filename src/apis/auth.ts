import { Router } from "express";
import * as authCore from "../core/auth";
import * as usersCore from "../core/users";
import { requireAuth } from "./middleware";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const result = await authCore.login(email, password);
  if (!result) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  res.json(result);
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await usersCore.getUser(req.auth!.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(usersCore.toSafeUser(user));
});
