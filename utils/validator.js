import { body, param } from 'express-validator'
import xss from 'xss'

export const settingEditValidator = [
  (req, res, next) => {
    if (req.body.fullName) {
      req.body.fullName = xss(req.body.fullName)
    }
    if (req.body.quotes) {
      req.body.quotes = xss(req.body.quotes)
    }

    next()
  },
  body('fullName', 'Invalid name format').optional(),
  body('quotes', 'Invalid quote format').optional(),
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
export const updateAchiveValidator = [
  (req, res, next) => {
    if (req.body.achiveId) {
      req.body.achiveId = xss(req.body.achiveId)
    }

    next()
  },

  body('achiveId', 'Invalid array format').isNumeric(),
]
export const notifTimeValidator = [
  (req, res, next) => {
    if (req.body.newtime) {
      req.body.newtime = xss(req.body.newtime)
    }

    next()
  },
  body('newtime', 'Invalid notif').optional(),
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
