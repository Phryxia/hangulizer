import { useState } from 'react'
import { readEnglishUnigramAI } from './logic/readEnglish/unigram-ai'

export default function App() {
  const [s, setS] = useState('')

  const o = readEnglishUnigramAI(s)
  console.log(o)

  return (
    <>
      <div>
        <input value={s} onChange={(e) => setS(e.target.value)} />
      </div>
      {/* <div>{encodeHangulTrace(s).join(',')}</div> */}
      <div>
        {o.map((oo, i) => (
          <div key={i}>{oo}</div>
        ))}
      </div>
    </>
  )
}
