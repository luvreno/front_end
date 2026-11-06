import { ProductArt } from '../illustrations/Products';
import type { ProductArt as Kind } from '../content';

/** Illustrative dashboard panels built from HTML and SVG. Sample data only. */

const customers = [
  { id: 'Customer 1042', seg: 'Home and living', n: 6 },
  { id: 'Customer 2187', seg: 'Frequent buyers', n: 14 },
  { id: 'Customer 3310', seg: 'First purchase', n: 1 },
  { id: 'Customer 4096', seg: 'Home and living', n: 3 },
];
const products: { kind: Kind; name: string; cat: string; stock: string }[] = [
  { kind: 'mug', name: 'Stoneware mug', cat: 'Home', stock: 'In stock' },
  { kind: 'sneaker', name: 'Canvas sneaker', cat: 'Fashion', stock: 'Low stock' },
  { kind: 'lamp', name: 'Desk lamp', cat: 'Home', stock: 'In stock' },
  { kind: 'notebook', name: 'Linen notebook', cat: 'Books', stock: 'In stock' },
];

export function MockCustomers() {
  return (
    <div className="mock-panel">
      <p className="mock-title mono">Customers</p>
      <table className="mock-table">
        <thead><tr><th scope="col">Profile</th><th scope="col">Segment</th><th scope="col">Orders</th></tr></thead>
        <tbody>
          {customers.map((c, i) => (
            <tr key={c.id} style={{ ['--d' as string]: `${i * 0.08}s` }}>
              <td className="mono">{c.id}</td>
              <td><span className="seg-chip">{c.seg}</span></td>
              <td className="mono">{c.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MockCatalog() {
  return (
    <div className="mock-panel">
      <p className="mock-title mono">Catalog</p>
      <ul className="mock-catalog">
        {products.map((p, i) => (
          <li key={p.name} style={{ ['--d' as string]: `${i * 0.08}s` }}>
            <span className="mock-thumb"><ProductArt kind={p.kind} size={40} /></span>
            <span className="mock-pname">{p.name}</span>
            <span className="mono mock-cat">{p.cat}</span>
            <span className="mono mock-stock">{p.stock}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MockSegments() {
  const segs = [
    { name: 'Frequent buyers', type: 'Calculated', size: 'Criteria: 5+ orders' },
    { name: 'Home and living interest', type: 'Calculated', size: 'Criteria: interest = Home' },
    { name: 'VIP launch list', type: 'Manual', size: 'Assigned by team' },
  ];
  return (
    <div className="mock-panel">
      <p className="mock-title mono">Segments</p>
      <ul className="mock-segs">
        {segs.map((s, i) => (
          <li key={s.name} style={{ ['--d' as string]: `${i * 0.1}s` }}>
            <span className="mock-pname">{s.name}</span>
            <span className={`seg-chip${s.type === 'Manual' ? ' seg-manual' : ''}`}>{s.type}</span>
            <span className="mono mock-cat">{s.size}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MockRule() {
  return (
    <div className="mock-panel mock-rule">
      <p className="mock-title mono">Rule: Complementary product</p>
      <div className="mock-rule-row"><span className="mono">When</span><span className="seg-chip">Home and living</span><span className="mono">buys</span><span className="mock-pname">Desk lamp</span></div>
      <div className="mock-rule-row"><span className="mono">Show</span><span className="mock-thumb"><ProductArt kind="plant" size={36} /></span><span className="mock-thumb"><ProductArt kind="mug" size={36} /></span></div>
      <div className="mock-rule-row"><span className="mono">Status</span><span className="seg-chip seg-on">Active</span></div>
    </div>
  );
}

export function MockChart() {
  const imp = [30, 42, 38, 55, 61, 58, 72];
  const clk = [12, 18, 15, 24, 27, 25, 33];
  const conv = [3, 5, 4, 7, 8, 7, 10];
  const toPath = (arr: number[]) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${10 + i * 40} ${110 - v * 1.3}`).join(' ');
  return (
    <div className="mock-panel">
      <p className="mock-title mono">Report: last 7 days (sample)</p>
      <svg viewBox="0 0 270 120" className="mock-chart" role="img" aria-label="Sample line chart of impressions, clicks and conversions rising over seven days">
        <path d="M10 110 H 260" stroke="rgba(22,22,22,.3)" />
        <path d={toPath(imp)} className="chart-line" stroke="var(--c2)" />
        <path d={toPath(clk)} className="chart-line" stroke="var(--c3)" />
        <path d={toPath(conv)} className="chart-line" stroke="var(--c1)" strokeDasharray="4 4" />
      </svg>
      <ul className="mock-legend mono">
        <li><span style={{ background: 'var(--c2)' }} />Impressions</li>
        <li><span style={{ background: 'var(--c3)' }} />Clicks</li>
        <li><span style={{ background: 'var(--c1)' }} />Conversions</li>
      </ul>
    </div>
  );
}

export function DashboardMock() {
  return (
    <div className="mock-frame" data-testid="product-mockup">
      <div className="mock-bar" aria-hidden="true"><span /><span /><span /><span className="mock-url mono">portal.luvreno.net</span></div>
      <div className="mock-grid">
        <MockCustomers />
        <MockCatalog />
        <MockRule />
        <MockChart />
      </div>
    </div>
  );
}
