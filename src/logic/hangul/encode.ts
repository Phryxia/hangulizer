import {
  ChoseongsCompatible,
  HANGUL_SYLLABLES_BEGIN,
  JongseongsCompatible,
  JungseongsCompatible,
} from './consts'

export function encodeHangulTrace(s: string) {
  return [...s].flatMap((c) => {
    const code = c.charCodeAt(0)

    if (isJamo(code)) return [c]

    if (isCompleteHangul(code)) return decomposeHangulSyllables(code)

    return [c]
  })
}

/**
 * @param code 유니코드
 * @returns 자모인지 여부
 */
function isJamo(code: number) {
  return 12593 <= code && code <= 12643
}

/**
 * @param code 유니코드
 * @returns 완성형 한글인지 여부
 */
function isCompleteHangul(code: number) {
  return HANGUL_SYLLABLES_BEGIN <= code && 0xdcaf
}

function decomposeHangulSyllables(code: number) {
  code -= HANGUL_SYLLABLES_BEGIN

  const chosungIndex = Math.floor(code / (21 * 28))
  const jungsungIndex = Math.floor(code / 28) % 21
  const jongsungIndex = code % 28

  const result = [
    ChoseongsCompatible[chosungIndex],
    JungseongsCompatible[jungsungIndex],
  ]
  if (jongsungIndex) {
    result.push(JongseongsCompatible[jongsungIndex - 1])
  }
  return result
}
