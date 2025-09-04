import jwt from "jsonwebtoken";

export const verifyUser = (req, res, next) => {
  console.log(req.cookies);
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded._id;
    req.role = decoded.role;
    console.log(req.userId, req.role);

    // 👇 extra check
    if (req.role !== "admin") {
      return res
        .status(403) // Forbidden
        .json({ message: "Not authorized. Admins only." });
    }

    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token." });
  }
};
