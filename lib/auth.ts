import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

if (!process.env.JWT_SECRET) {
  throw new Error('Invalid/Missing environment variable: "JWT_SECRET"')
}

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = "7d"

export function generateToken(userId: string) {
  try {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
  } catch (error) {
    console.error("Token generation error:", error)
    throw error
  }
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch (error) {
    console.error("Token verification error:", {
      error: error instanceof Error ? error.message : error,
      tokenExists: !!token
    })
    return null
  }
}

export async function hashPassword(password: string) {
  try {
    return await bcrypt.hash(password, 12)
  } catch (error) {
    console.error("Password hashing error:", error)
    throw error
  }
}

export async function comparePassword(password: string, hashedPassword: string) {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error("Password comparison error:", error)
    throw error
  }
}
