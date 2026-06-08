/** Compare Salesforce record ids (15 or 18 chars; casing can differ between APIs). */
export function salesforceIdsEqual(a: string, b: string): boolean {
  const x = (a || '').trim()
  const y = (b || '').trim()
  if (!x || !y) return false
  if (x === y) return true
  if (x.toLowerCase() === y.toLowerCase()) return true
  if (x.length >= 15 && y.length >= 15) {
    return x.slice(0, 15).toLowerCase() === y.slice(0, 15).toLowerCase()
  }
  return false
}
