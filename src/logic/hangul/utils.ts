import {
  HANGUL_JAMO_BEGIN,
  HANGUL_JAMO_COMPATIBLE_BEGIN,
  HANGUL_JAMO_COMPATIBLE_END,
  HANGUL_JAMO_END,
  HANGUL_SYLLABLES_BEGIN,
  HANGUL_SYLLABLES_END,
} from './consts'

export function isHangul(code: number, isOldHangulIncluded?: boolean) {
  return (
    (HANGUL_JAMO_COMPATIBLE_BEGIN <= code &&
      code <= HANGUL_JAMO_COMPATIBLE_END) ||
    (HANGUL_SYLLABLES_BEGIN <= code && code <= HANGUL_SYLLABLES_END) ||
    (isOldHangulIncluded &&
      HANGUL_JAMO_BEGIN <= code &&
      code <= HANGUL_JAMO_END)
  )
}
