import rateLimit from 'express-rate-limit'

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many requests from this IP, please try again later',
})

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many requests from this IP, please try again later',
})
