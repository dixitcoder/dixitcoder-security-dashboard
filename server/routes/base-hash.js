import crypto from "crypto";

export function generateHash(text, algorithm = "md5") {
  try {
    return crypto.createHash(algorithm).update(text).digest("hex");
  } catch (err) {
    throw new Error("Invalid algorithm selected!");
  }
}
