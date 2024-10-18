import { decodeHangulTrace } from '../hangul/decode'
import { encodeHangulTrace } from '../hangul/encode'
import { isHangul } from '../hangul/utils'
import { SemiVowels, Vowels } from './consts'
import { branchReading } from './shared'

export function readEnglishUnigramAI(s: string) {
  let candidates: string[][] = []

  let currentState = 0

  /*
    0: 음절 시작
    1: 음절 시작이 모음인 경우
    2: 음절 시작이 반모음인 경우
    3: 음절 시작이 자음인 경우
    4: 음절 시작이 q인 경우
    5: 음절 시작이 x인 경우
    6: 음절 시작이 a인 경우
    7: 음절 시작이 e인 경우
    8: 음절 시작이 o인 경우
    9: 음절 시작이 u인 경우
    10: 자음 끝나고 중간 라우팅
    11: s 다음에 h인 경우
    12: sh 다음의 경우
  */

  function handleConsonant(c: string) {
    switch (c) {
      case 'b':
      case 'v':
        candidates = branchReading(candidates, [['ㅂ']])
        break
      case 'c':
        candidates = branchReading(candidates, [['ㅋ'], ['ㅅ'], ['ㅆ']])
        break
      case 'd':
        candidates = branchReading(candidates, [['ㄷ']])
        break
      case 'f':
      case 'p':
        candidates = branchReading(candidates, [['ㅍ']])
        break
      case 'g':
        candidates = branchReading(candidates, [['ㄱ'], ['ㅈ']])
        break
      case 'h':
        candidates = branchReading(candidates, [['ㅎ']])
        break
      case 'j':
      case 'z':
        candidates = branchReading(candidates, [['ㅈ']])
        break
      case 'k':
        candidates = branchReading(candidates, [['ㅋ']])
        break
      case 'l':
      case 'r':
        candidates = branchReading(candidates, [['ㄹ']])
        break
      case 'm':
        candidates = branchReading(candidates, [['ㅁ']])
        break
      case 'n':
        candidates = branchReading(candidates, [['ㄴ']])
        break
      case 'q':
        candidates = branchReading(candidates, [['ㅋ'], ['ㅋ', 'ㅜ']])
        return 4
      case 's':
        candidates = branchReading(candidates, [['ㅅ']])
        return 11
      case 't':
        candidates = branchReading(candidates, [['ㅌ']])
        break
      case 'w':
        candidates = branchReading(candidates, [['ㅜ']])
        return 2
      case 'x':
        candidates = branchReading(candidates, [['ㅋ', 'ㅅ']])
        return 5
      case 'y':
        candidates = branchReading(candidates, [['ㅇ', 'ㅣ']])
        return 2
    }
  }

  function handleVowel(c: string) {
    switch (c) {
      case 'a':
        candidates = branchReading(candidates, [['ㅏ'], ['ㅔ']])
        return 6
      case 'e':
        candidates = branchReading(candidates, [['ㅣ'], ['ㅔ']])
        return 7
      case 'i':
        candidates = branchReading(candidates, [['ㅣ'], ['ㅏ', 'ㅇ', 'ㅣ']])
        return 0
      case 'o':
        candidates = branchReading(candidates, [['ㅗ'], ['ㅏ']])
        return 8
      case 'u':
        candidates = branchReading(candidates, [['ㅜ'], ['ㅓ']])
        return 9
      default:
        return undefined
    }
  }

  const fsm: ((c: string) => number)[] = [
    (c: string): number => {
      if (Vowels.includes(c)) {
        candidates = branchReading(candidates, [['ㅇ']])
        return handleVowel(c) ?? fsm[0](c) ?? 0
      }
      if (SemiVowels.includes(c)) {
        candidates = branchReading(candidates, [['ㅇ']])
        return 2
      }
      return handleConsonant(c) ?? 10
    },
    // 1 모음으로 인입
    (c: string) => {
      return handleVowel(c) ?? fsm[0](c)
    },
    // 2 반모음
    (c: string) => {
      switch (c) {
        case 'a':
          candidates = branchReading(candidates, [['ㅑ'], ['ㅘ']])
          return 0
        case 'e':
          candidates = branchReading(candidates, [['ㅖ'], ['ㅞ']])
          return 0
        case 'i':
          candidates = branchReading(candidates, [['ㅢ']])
          return 0
        case 'o':
          candidates = branchReading(candidates, [['ㅛ'], ['ㅝ']])
          return 0
        case 'u':
          candidates = branchReading(candidates, [['ㅠ']])
          return 0
      }
      candidates = branchReading(candidates, [['ㅇ', 'ㅣ']])
      return handleConsonant(c) ?? 3
    },
    // 3 자음
    (c: string) => {
      if (Vowels.includes(c)) {
        handleVowel(c)
        return 0
      }
      if (SemiVowels.includes(c)) {
        return fsm[2](c)
      }
      return handleConsonant(c) ?? 3
    },
    // 4 q
    (c: string) => {
      if (c === 'u') {
        candidates = branchReading(candidates, [['ㅋ', 'ㅜ']])
        return 9
      }
      return fsm[3](c)
    },
    // 5 x
    (c: string) => {
      if (Vowels.includes(c)) {
        candidates = branchReading(candidates, [['ㅈ']])
        return fsm[1](c)
      }
      if (c === 'y') {
        candidates = branchReading(candidates, [['ㅈ', 'ㅏ', 'ㅇ', 'ㅣ']])
        return 0
      }
      if (SemiVowels.includes(c)) {
        candidates = branchReading(candidates, [['ㅇ', 'ㅔ', 'ㄱ', 'ㅅ', 'ㅡ']])
        return fsm[2](c)
      }
      candidates = branchReading(candidates, [['ㅇ', 'ㅔ', 'ㄱ', 'ㅅ', 'ㅡ']])
      return fsm[1](c)
    },
    // 6 a
    (c: string) => {
      switch (c) {
        case 'a':
        case 'e':
          return 0
        case 'i':
          candidates = branchReading(candidates, [['ㅇ', 'ㅣ']])
          return 0
        case 'o':
          candidates = branchReading(candidates, [['ㅇ', 'ㅗ']])
          return 0
        case 'u':
          candidates = branchReading(candidates, [['ㅇ', 'ㅜ']])
          return 0
        case 'y':
          return fsm[2](c)
        case 'w':
          candidates = branchReading(candidates, [['ㅇ', 'ㅜ']])
          return 0
      }
      handleConsonant(c)
      return 3
    },
    // 7 e
    (c: string) => {
      switch (c) {
        case 'e':
          candidates = branchReading(candidates, [['ㅇ', 'ㅣ']])
          return 0
        case 'i':
          candidates = branchReading(candidates, [['ㅇ', 'ㅣ']])
          return 0
        case 'y':
          candidates = branchReading(candidates, [['ㅇ', 'ㅣ']])
          return 0
      }
      return fsm[3](c)
    },
    // 8 o
    (c: string) => {
      switch (c) {
        case 'o':
          candidates = branchReading(candidates, [['ㅇ', 'ㅜ']])
          return 0
        case 'i':
          candidates = branchReading(candidates, [['ㅇ', 'ㅗ', 'ㅇ', 'ㅣ']])
          return 0
        case 'y':
          candidates = branchReading(candidates, [['ㅇ', 'ㅗ', 'ㅇ', 'ㅣ']])
          return 0
      }
      return fsm[3](c)
    },
    // 9 u
    (c: string) => {
      switch (c) {
        // 모음
        case 'a':
          candidates = branchReading(candidates, [['ㅘ'], ['ㅜ', 'ㅇ', 'ㅏ']])
          return 0
        case 'e':
          candidates = branchReading(candidates, [['ㅝ'], ['ㅜ', 'ㅇ', 'ㅔ']])
          return 0
        case 'i':
          candidates = branchReading(candidates, [['ㅟ'], ['ㅜ', 'ㅇ', 'ㅣ']])
          return 0
        case 'o':
          candidates = branchReading(candidates, [['ㅝ'], ['ㅜ', 'ㅇ', 'ㅗ']])
          return 0
        case 'u':
          candidates = branchReading(candidates, [['ㅜ']])
          return 0
        // 반모음
        case 'w':
          candidates = branchReading(candidates, [['ㅜ']])
          return 2
        case 'y':
          candidates = branchReading(candidates, [['ㅜ', 'ㅇ', 'ㅣ']])
          return 0
      }
      candidates = branchReading(candidates, [['ㅜ'], ['ㅠ']])
      return handleConsonant(c) ?? 3
    },
    // 10
    (c: string) => {
      if (Vowels.includes(c)) {
        handleVowel(c)
        return 0
      }
      if (SemiVowels.includes(c)) {
        return fsm[2](c)
      }
      candidates = branchReading(candidates, [['ㅡ']])
      return handleConsonant(c) ?? 0
    },
    // 11
    (c: string) => {
      candidates = branchReading(candidates, [['ㅣ'], ['ㅟ']])
      return 12
    },
    // 12
    (c: string) => {
      if (Vowels.includes(c)) {
        return 0
      }
      return fsm[0](c)
    },
  ]

  for (let i = 0; i < s.length; ++i) {
    const c = s[i]
    const code = c.charCodeAt(0)

    if (isHangul(code)) {
      candidates = branchReading(candidates, [encodeHangulTrace(c)])
      currentState = 0
      continue
    }

    if (!isEnglish(c)) {
      candidates = branchReading(candidates, [[c]])
      currentState = 0
      continue
    }

    const cl = c.toLowerCase()

    currentState = fsm[currentState](cl)
  }
  return candidates.map((candidate) => decodeHangulTrace(candidate))
}

function isEnglish(c: string) {
  return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z')
}
