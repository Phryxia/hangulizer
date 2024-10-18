import {
  ChoseongsCompatible,
  HANGUL_SYLLABLES_BEGIN,
  JongseongsCompatible,
  JungseongsCompatible,
} from './consts'

/**
 * 자모의 배열을 주면, 남겨진 자모가 최소화되는 완성형 한글을 찾습니다.
 * 완벽하게 encodeHangulTrace의 역변환을 할 순 없습니다.
 * 다음과 같은 모호한 경우가 존재할 수 있기 때문입니다.
 *
 * ex) "글ㅡㄹ" -> ["ㄱ", "ㅡ", "ㄹ", "ㅡ", "ㄹ"] -> "그를"
 *
 * 한글이 아닌 경우는 그대로 내보냅니다.
 *
 * ex) ["ㅅ", "ㅏ", "a"] -> "사a"
 *
 * @param chars a
 * @returns
 */
export function decodeHangulTrace(chars: string[]) {
  if (chars.length <= 1) return chars

  let first = 0 // 스택의 시작 인덱스
  let last = 0 // 추가될 예정인 문자를 가리킴, 따라서 스택은 exclusive
  let result = ''

  // 현재까지 수집한 스택의 내용을 가공없이 출력
  function flush() {
    for (let i = first; i < last; ++i) {
      result += chars[i]
    }
  }

  function assemble(length: number) {
    result += assembleHangulSyllables(
      chars[first],
      chars[first + 1],
      length === 3 ? chars[first + 2] : undefined,
    )
  }

  let currentState = 0
  const states = [
    // idle -> 초성
    (c: string) => {
      if (ChoseongsCompatible.includes(c)) {
        flush()
        first = last
        return 1
      }
      flush()
      first = last
      return 0
    },
    // 초성 -> 중성
    (c: string) => {
      if (JungseongsCompatible.includes(c)) {
        return 2
      }
      if (ChoseongsCompatible.includes(c)) {
        flush()
        first = last
        return 1
      }
      flush()
      first = last
      return 0
    },
    // 중성 -> 종성
    (c: string) => {
      // ex) [ㅅ,ㅏ,ㄹ]
      if (JongseongsCompatible.includes(c)) {
        // ex) [ㅅ,ㅏ,ㄳ]
        if (!ChoseongsCompatible.includes(c)) {
          assemble(3)
          first = last
          return 0
        }
        return 3
      }
      // ex) [ㅎ,ㅐ,ㅉ]
      if (ChoseongsCompatible.includes(c)) {
        assemble(2)
        first = last - 1
        return 1
      }
      // ex) [ㅌ,ㅏ,ㅏ]
      assemble(2)
      first = last
      return 0
    },
    // 종성인지 다음 문자의 초성인지 불확실한 경우
    // ex) [ㄱ,ㅐ,ㄱ]
    (c: string) => {
      // ex) [ㄱ,ㅐ,ㄱ,ㄱ]
      if (ChoseongsCompatible.includes(c)) {
        assemble(3)
        first = last
        return 1
      }
      // ex) [ㄱ,ㅐ,ㄱ,ㅡ]
      if (JungseongsCompatible.includes(c)) {
        assemble(2)
        first += 2
        return 2
      }
      // ex) [ㄱ,ㅐ,ㄱ,?]
      assemble(3)
      first = last
      return 0
    },
  ]

  while (last < chars.length) {
    const c = chars[last]
    currentState = states[currentState](c)
    last += 1
  }

  switch (currentState) {
    default:
      flush()
      break
    case 2:
      assemble(2)
      break
    case 3:
      assemble(3)
      break
  }

  return result
}

function assembleHangulSyllables(
  choseong: string,
  jungseong: string,
  jongseong?: string,
) {
  const choseongIndex = ChoseongsCompatible.indexOf(choseong)
  const jungseongIndex = JungseongsCompatible.indexOf(jungseong)
  const jongseongIndex = jongseong
    ? JongseongsCompatible.indexOf(jongseong) + 1
    : 0

  return String.fromCharCode(
    (choseongIndex * 21 + jungseongIndex) * 28 +
      jongseongIndex +
      HANGUL_SYLLABLES_BEGIN,
  )
}
