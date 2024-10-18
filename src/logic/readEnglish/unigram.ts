import { encodeHangulTrace } from '../hangul/encode'
import { isHangul } from '../hangul/utils'
import { SemiVowels, Vowels } from './consts'
import { branchReading } from './shared'

export function readEnglishUniGram(s: string) {
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
      case 'k':
        candidates = branchReading(candidates, [['ㅋ']])
        return 4
      case 's':
        candidates = branchReading(candidates, [['ㅅ']])
        break
      case 't':
        candidates = branchReading(candidates, [['ㅌ']])
        break
      case 'x':
        return 5
    }
  }

  const fsm = [
    (c: string) => {
      if (Vowels.includes(c)) {
        return 1
      }
      if (SemiVowels.includes(c)) {
        return 2
      }
      return handleConsonant(c) ?? 3
    },
    // 모음
    (c: string) => {
      switch (c) {
        case 'a':
          return 6
        case 'e':
          return 7
        case 'i':
          candidates = branchReading(candidates, [['ㅇ', 'ㅣ']])
          break
        case 'o':
          return 8
        case 'u':
          candidates = branchReading(candidates, [['ㅇ']])
          return 9
      }
    },
    // 반모음
    (c: string) => {},
    // 자음
    () => {},
    // q
    () => {},
    // x
    () => {},
    // a
    () => {},
    // e
    () => {},
    // o
    () => {},
    // u
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
          candidates = branchReading(candidates, [['ㅜ', 'ㅇ', 'ㅣ']])
          return 0
        case 'o':
          candidates = branchReading(candidates, [['ㅝ'], ['ㅜ', 'ㅇ', 'ㅗ']])
          return 0
        case 'u':
          candidates = branchReading(candidates, [['ㅜ', 'ㅇ', 'ㅜ']])
          return 0
        // 반모음
        case 'w':
          candidates = branchReading(candidates, [['ㅜ']])
          return 2
        case 'y':
          candidates = branchReading(candidates, [['ㅓ', 'ㅇ', 'ㅣ']])
          return 0
      }
      candidates = branchReading(candidates, [['ㅜ'], ['ㅠ']])
      return handleConsonant(c) ?? 3
    },
  ]

  for (let i = 0; i < s.length; ++i) {
    const c = s[i]
    const code = c.charCodeAt(0)

    if (isHangul(code)) {
      candidates = branchReading(candidates, [encodeHangulTrace(c)])
      continue
    }

    if (!isEnglish(c)) {
      candidates = branchReading(candidates, [[c]])
      continue
    }

    currentState = 0
    const cl = c.toLowerCase()

    currentState = fsm[currentState](cl)
  }
}

function isEnglish(c: string) {
  return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z')
}
