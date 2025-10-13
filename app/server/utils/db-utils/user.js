import bcrypt from 'bcryptjs'

// Hash a password using bcrypt with 10 salt rounds
export const hashPassword = password => bcrypt.hash(password, 10)

// Verify a plain password against a hashed password
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash)