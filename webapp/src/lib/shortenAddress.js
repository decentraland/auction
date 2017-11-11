export default function shortenAddress(address = "") {
  if (address) {
    return address.slice(0, 10) + "..." + address.slice(42 - 8);
  }
}
