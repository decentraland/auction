import { ParcelState } from '../models'

class ParcelStateService {
  constructor() {
    this.ParcelState = ParcelState
  }

  async insertMatrix(minX, minY, maxX, maxY) {
    const skipDuplicates = error => {
      if (!isDuplicatedError(error)) throw new Error(error)
    }

    const inserts = []

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        inserts.push(this.ParcelState.insert({ x, y }).catch(skipDuplicates))
      }
    }

    await Promise.all(inserts)
  }
}

function isDuplicatedError(error) {
  const duplicateErrorRegexp = /duplicate key value violates unique constraint ".+_pkey"/
  return error.search(duplicateErrorRegexp) !== -1
}

export default ParcelStateService
