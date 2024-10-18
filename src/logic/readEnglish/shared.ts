export function branchReading(
  candidates: string[][],
  newCandidates: string[][],
) {
  if (!candidates.length) {
    return newCandidates
  }

  return newCandidates.flatMap((newCandidate) =>
    candidates.map((oldCandidates) => [...oldCandidates, ...newCandidate]),
  )
}
