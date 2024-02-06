import { body, param } from 'express-validator'
import xss from 'xss'

export const settingEditValidator = [
  (req, res, next) => {
    if (req.body.fullName) {
      req.body.fullName = xss(req.body.fullName)
    }
    // if (req.body.date) {
    //   req.body.date = xss(req.body.date)
    // }
    // if (req.body.wind) {
    //   req.body.wind = xss(req.body.wind)
    // }
    // if (req.body.clothes) {
    //   req.body.clothes = xss(req.body.clothes)
    // }
    // if (req.body.fullName) {
    //   req.body.fullName = xss(req.body.fullName)
    // }

    next()
  },
  body('fullName', 'Invalid name format').optional(),
  // body('wind', 'Invalid wind unit').isIn(['mph', 'kmh']).optional(),
  // body('clothes', 'Invalid clothes settings').isString().optional(),
  // body('fullName', 'Invalid wind unit').isString().optional(),
  // body('date', 'Invalid date format').isString().optional(),
]
export const editEchoValidator = [
  (req, res, next) => {
    if (req.body.echos) {
      req.body.echos = xss(req.body.echos)
    }

    next()
  },
  body('echos', 'Invalid array format').optional(),
]
export const newEchoValidator = [
  (req, res, next) => {
    if (req.body.newEcho) {
      next()
    }
  },
  body('newEcho', 'Invalid array format').isObject(),
]
export const removeEchoValidator = [
  (req, res, next) => {
    if (req.body.echoId) {
      req.body.echoId = xss(req.body.echoId)
    }
    next()
  },
  body('echoId', 'Invalid string').isString(),
]
export const goalValidator = [
  (req, res, next) => {
    if (req.body.goal) {
      req.body.goal = xss(req.body.goal)
    }
    next()
  },
  body('goal', 'Invalid string').isString(),
]
