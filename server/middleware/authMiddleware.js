import jwt from "jsonwebtoken";

/**
 * Authentication middleware.
 *
 * Reads the Authorization header, verifies the Bearer JWT,
 * and attaches the decoded identity to req.user:
 *
 *   req.user = { id: <userId> }
 *
 * Rejects with 401 if:
 *   - Authorization header is missing or malformed
 *   - Token is invalid
 *   - Token is expired
 *
 * Never logs the token or the JWT secret.
 * Keep this reusable — any route can use it as middleware.
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Require "Bearer <token>"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // Server misconfiguration — do not reveal details to client
      console.error("❌ authMiddleware: JWT_SECRET is not configured");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Verify and decode — throws if invalid or expired
    const decoded = jwt.verify(token, secret);

    // Attach minimal identity — only what downstream handlers need
    req.user = { id: decoded.userId };

    next();

  } catch (err) {
    // jwt.verify throws JsonWebTokenError, TokenExpiredError, etc.
    // Never expose the specific reason — just reject with 401
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default authMiddleware;
