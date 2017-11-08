import { expect } from "chai";

import coordinates from "../src/lib/coordinates";

describe("coordinates", function() {
  describe(".checkIsValid", function() {
    it("should throw if the supplied coordinates are invalid", function() {
      expect(() => coordinates.checkIsValid("a,b")).to.throw(
        'The coordinate "a,b" are not valid'
      );
      expect(() => coordinates.checkIsValid([1, null])).to.throw(
        'The coordinate "1," are not valid'
      );
      expect(() => coordinates.checkIsValid("1,2  b")).to.throw(
        'The coordinate "1,2  b" are not valid'
      );
      expect(() => coordinates.checkIsValid("")).to.throw(
        'The coordinate "" are not valid'
      );
    });

    it("should not throw if the supplied coordinates valid", function() {
      expect(() => coordinates.checkIsValid("1,2")).not.to.throw();
      expect(() => coordinates.checkIsValid("-1,2")).not.to.throw();
      expect(() => coordinates.checkIsValid("1,-2")).not.to.throw();
      expect(() => coordinates.checkIsValid([22, 23])).not.to.throw();
      expect(() => coordinates.checkIsValid("1,   2")).not.to.throw();
    });
  });

  describe(".toArray", function() {
    it("should return an array composed from the supplied coordinates", function() {
      expect(coordinates.toArray("1,  2")).to.deep.equal(["1", "2"]);
    });

    it("should throw if the coordinates are invalid", function() {
      expect(() => coordinates.toArray("a,  2")).to.throw(
        'The coordinate "a,  2" are not valid'
      );
    });
  });
});
