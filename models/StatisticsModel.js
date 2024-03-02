import mongoose from 'mongoose'

const statSchemaObj = new mongoose.Schema({
  name: String,
  total: { type: Number, default: 0 },
  days: { type: Map, of: Number },
  stat: { type: Map, of: Number },
})

export default mongoose.model('Statistic', statSchemaObj)
