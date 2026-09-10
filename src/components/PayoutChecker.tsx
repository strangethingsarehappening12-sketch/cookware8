import { useState } from 'react'
import { formatCompactNumber, getHoodReceivedByAddress } from '../config'

export default function PayoutChecker() {
  const [address, setAddress] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [truncated, setTruncated] = useState(false)

  const handleCheck = async () => {
    if (!address.trim() || status === 'loading') return
    setStatus('loading')
    setError(null)
    setResult(null)
    setTruncated(false)

    const snapshot = await getHoodReceivedByAddress(address)

    if (snapshot.isLive) {
      setResult(snapshot.value ?? 0)
      setTruncated(Boolean(snapshot.truncated))
    } else {
      setError(snapshot.error ?? 'Something went wrong looking that address up.')
    }
    setStatus('done')
  }

  return (
    <div className="rounded-3xl border-[3px] border-ink bg-white p-8 shadow-thick sm:p-12">
      <h2 className="font-display text-3xl font-bold sm:text-4xl">COOKWARE ON-CHAIN</h2>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          inputMode="text"
          spellCheck={false}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          placeholder="0x..."
          className="min-w-0 flex-1 rounded-full border-[3px] border-ink bg-cream px-5 py-3 font-mono text-sm text-ink outline-none placeholder:text-ink/40"
        />
        <button
          onClick={handleCheck}
          disabled={!address.trim() || status === 'loading'}
          className="shrink-0 rounded-full border-[3px] border-ink bg-clay px-8 py-3 font-display text-base font-bold text-cream shadow-thickSm transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {status === 'loading' ? 'CHECKING…' : 'CHECK'}
        </button>
      </div>

      <p className="mt-3 text-sm text-ink/60">
        Paste a Robinhood wallet address. The pot keeps a ledger of every $HOOD payout since
        launch, read straight from the chain.
      </p>

      {status === 'done' && (
        <div className="mt-6 rounded-2xl border-2 border-ink px-6 py-5 text-center">
          {error ? (
            <p className="text-sm text-ink/70">{error}</p>
          ) : (
            <>
              <p className="font-mono text-xs tracking-wide text-ink/60">$HOOD RECEIVED</p>
              <p className="mt-1 font-display text-4xl font-bold text-clay sm:text-5xl">
                {formatCompactNumber(result ?? 0)}
              </p>
              {truncated && (
                <p className="mt-2 text-xs text-ink/50">
                  Based on recent payout history — very long-standing wallets may show a partial
                  total.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
