import { utils } from 'decentraland-commons'

export default function omitInArray(array, props = []) {
  return array.map(obj => utils.omit(obj, props))
}
