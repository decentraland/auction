export default {
  getTotalManaBidded(pendingBids) {
    // TODO: Use BigNumber?
    return pendingBids.reduce(
      (total, pendingBid) => total + parseFloat(pendingBid.yourBid, 10),
      0
    );
  }
};
