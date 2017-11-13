export default function shortenAddress(address = "") {
  if (address) {
    return address.slice(0, 6) + "..." + address.slice(42 - 5);
  }
}
