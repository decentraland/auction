import { ParcelState } from "../models";

class ParcelStateService {
  constructor() {
    this.ParcelState = ParcelState;
  }

  async insertMatrix(minX, minY, maxX, maxY) {
    for (let x = minX; x <= maxX; x++) {
      const inserts = [];
      for (let y = minY; y <= maxY; y++) {
        inserts.push(this.ParcelState.insert({ x, y }))
      }
      await Promise.all(inserts);
    }
  }
}

export default ParcelStateService;
