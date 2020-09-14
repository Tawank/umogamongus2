export default function smooth (start, end, amt) {
  return (1 - amt) * start + amt * end
}
