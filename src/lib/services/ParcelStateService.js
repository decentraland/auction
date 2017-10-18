export default class ParcelStateService {
  constructor(ParcelState) {
    this.ParcelState = ParcelState;
  }

  insertMatrix(maxx, maxy) {
    const inserts = [];
    for (let x = 0; x <= maxx; x++) {
      for (let y = 0; y <= maxy; y++) {
        const insert = this.ParcelState.insert({ x, y }).catch(() => {});
        inserts.push(insert);
      }
    }
    return Promise.all(inserts);
  }
}
