import { ParcelState } from "../models";

class ParcelStateService {
  constructor() {
    this.ParcelState = ParcelState;
  }

  insertMatrix(minX, minY, maxX, maxY) {
    const inserts = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const insert = this.ParcelState.insert({ x, y }).catch(() => {});
        inserts.push(insert);
      }
    }
    return Promise.all(inserts);
  }
}

export default ParcelStateService;
