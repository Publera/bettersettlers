export default function AboutSection({ onClose }: { onClose: () => void }) {
  return (
    <section
      aria-label="About the algorithm"
      className="overflow-y-auto"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        borderBottom: '1px solid var(--color-border-light)',
        maxHeight: '50dvh',
      }}
    >
      <div className="max-w-lg mx-auto px-4 py-5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
            How It Works
          </h2>
          <button
            onClick={onClose}
            aria-label="Close info panel"
            className="touch-target p-1.5 -mr-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="mb-3">
          This tool generates balanced Settlers of Catan board layouts so gameplay
          is fairer and more competitive. The algorithm ensures no resource clustering,
          balanced probability distribution, and fair harbor placement.
        </p>

        <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Fair Distribution
        </h3>
        <ul className="space-y-1.5 mb-4 text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <li className="flex gap-2">
            <span style={{ color: 'var(--color-brand)' }} aria-hidden="true">&#x2022;</span>
            <span><strong>No same-resource adjacency</strong> &mdash; identical resources never neighbor each other</span>
          </li>
          <li className="flex gap-2">
            <span style={{ color: 'var(--color-brand)' }} aria-hidden="true">&#x2022;</span>
            <span><strong>No duplicate numbers</strong> &mdash; each resource type gets unique probability tokens</span>
          </li>
          <li className="flex gap-2">
            <span style={{ color: 'var(--color-brand)' }} aria-hidden="true">&#x2022;</span>
            <span><strong>Balanced probability spread</strong> &mdash; every resource group&rsquo;s total dots fall within a fair range</span>
          </li>
          <li className="flex gap-2">
            <span style={{ color: 'var(--color-brand)' }} aria-hidden="true">&#x2022;</span>
            <span><strong>Intersection balance</strong> &mdash; at every vertex where 3 hexes meet, probability is bounded</span>
          </li>
          <li className="flex gap-2">
            <span style={{ color: 'var(--color-brand)' }} aria-hidden="true">&#x2022;</span>
            <span><strong>Harbor fairness</strong> &mdash; 2:1 harbors won&rsquo;t sit next to high-probability matching resources</span>
          </li>
        </ul>

        <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Other Modes
        </h3>
        <p className="text-xs leading-relaxed mb-3">
          <strong>Traditional</strong> follows the official Catan rulebook spiral placement.
          <strong> Random</strong> is a pure shuffle with no constraints.
        </p>

        <p className="text-[10px] italic" style={{ color: 'var(--color-text-muted)' }}>
          Originally built as a Flash app in 2009. Rebuilt for the modern web.
        </p>
      </div>
    </section>
  );
}
