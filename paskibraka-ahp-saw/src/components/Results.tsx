import React, { useState } from 'react';
import type { AHPResult, Criterion, CriterionConfig, SAWResult } from '../types';

interface ResultsProps {
  criteria: Criterion[];
  criteriaConfig: CriterionConfig[];
  ahpResult: AHPResult;
  sawResult: SAWResult;
  onBack: () => void;
  onReset: () => void;
}

type TabType = 'ranking' | 'saw-normalized' | 'ahp-normalized' | 'summary';

const Results: React.FC<ResultsProps> = ({
  criteria, criteriaConfig, ahpResult, sawResult, onBack, onReset,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('ranking');
  const topScore = sawResult.rankings[0]?.preferenceValue ?? 1;

  const tabBtn = (id: TabType, label: string) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition whitespace-nowrap
        ${activeTab === id
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
      {label}
    </button>
  );

  const medalEmoji = (rank: number) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Langkah 4: Hasil Hybrid AHP-SAW</h2>
        <p className="text-gray-500 text-sm">
          Hasil seleksi peserta paskibraka berdasarkan kombinasi metode AHP (pembobotan) dan SAW (perangkingan).
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sawResult.rankings.slice(0, 3).map((entry) => (
          <div
            key={entry.alternativeId}
            className={`rounded-2xl border-2 p-5 text-center transition hover:shadow-md
              ${entry.rank === 1 ? 'bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-400' : ''}
              ${entry.rank === 2 ? 'bg-gradient-to-br from-slate-50 to-gray-100 border-slate-400' : ''}
              ${entry.rank === 3 ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300' : ''}
            `}
          >
            <div className="text-4xl mb-2">{medalEmoji(entry.rank)}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">#{entry.rank}</div>
            <div className="text-xl font-black text-gray-800 mb-1">{entry.alternativeName}</div>
            <div className="text-xs font-mono text-gray-500">{entry.preferenceValue.toFixed(6)}</div>
            {entry.preferenceValue >= 0.9999 && (
              <span className="mt-2 inline-block px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                Nilai Sempurna!
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-1 overflow-x-auto">
        {tabBtn('ranking', 'Rangking Final')}
        {tabBtn('saw-normalized', 'Matriks SAW')}
        {tabBtn('ahp-normalized', 'Matriks AHP')}
        {tabBtn('summary', 'Ringkasan')}
      </div>

      {/* ── Tab: Ranking ── */}
      {activeTab === 'ranking' && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Rangking</th>
                <th className="px-4 py-3 text-left font-semibold">Nama Peserta</th>
                <th className="px-4 py-3 text-left font-semibold">Total Nilai (Vi)</th>
                <th className="px-4 py-3 text-left font-semibold min-w-[160px]">Persentase</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sawResult.rankings.map((entry) => {
                const pct = (entry.preferenceValue / topScore) * 100;
                const rowBg =
                  entry.rank === 1 ? 'bg-yellow-50' :
                  entry.rank === 2 ? 'bg-slate-50' :
                  entry.rank === 3 ? 'bg-orange-50' : '';

                return (
                  <tr key={entry.alternativeId} className={`${rowBg} hover:brightness-95 transition`}>
                    <td className="px-4 py-3 font-bold text-lg">
                      {entry.rank <= 3 ? medalEmoji(entry.rank) : `#${entry.rank}`}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{entry.alternativeName}</td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-700">{entry.preferenceValue.toFixed(6)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-mono text-gray-500 w-12 text-right">{pct.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {entry.rank <= 3 ? (
                        <span className="px-2.5 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">Lolos</span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-bold bg-gray-100 text-gray-500 rounded-full">Cadangan</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab: SAW Normalized ── */}
      {activeTab === 'saw-normalized' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
            Normalisasi SAW: benefit = x<sub>ij</sub> / max(x<sub>j</sub>), cost = min(x<sub>j</sub>) / x<sub>ij</sub>
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Peserta</th>
                  {criteria.map((c) => {
                    const conf = criteriaConfig.find((cc) => cc.id === c.id);
                    return (
                      <th key={c.id} className="px-3 py-3 text-center font-semibold">
                        <div>{c.name} ({c.id})</div>
                        <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${conf?.type === 'benefit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {conf?.type}
                        </span>
                      </th>
                    );
                  })}
                  <th className="px-3 py-3 text-center font-semibold text-blue-700">Vi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sawResult.rankings.map((entry) => (
                  <tr key={entry.alternativeId} className={`hover:bg-gray-50 transition ${entry.rank === 1 ? 'bg-yellow-50' : ''}`}>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {entry.rank <= 3 && <span className="mr-1">{medalEmoji(entry.rank)}</span>}
                      {entry.alternativeName}
                    </td>
                    {criteria.map((c) => (
                      <td key={c.id} className="px-3 py-3 text-center font-mono text-xs text-gray-600">
                        {(sawResult.normalizedMatrix[entry.alternativeId]?.[c.id] ?? 0).toFixed(7)}
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center font-bold font-mono text-blue-700">
                      {entry.preferenceValue.toFixed(6)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50 font-bold">
                  <td className="px-4 py-3 text-blue-800">Bobot (wj)</td>
                  {criteria.map((c) => (
                    <td key={c.id} className="px-3 py-3 text-center font-mono text-xs text-blue-700">
                      {(ahpResult.weights[c.id] ?? 0).toFixed(6)}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center text-blue-400">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: AHP Normalized ── */}
      {activeTab === 'ahp-normalized' && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
            Matriks AHP yang dinormalisasi. Bobot = rata-rata baris.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Kriteria</th>
                  {criteria.map((c) => (
                    <th key={c.id} className="px-3 py-3 text-center font-semibold">{c.name} ({c.id})</th>
                  ))}
                  <th className="px-3 py-3 text-center font-semibold text-blue-700">Bobot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {criteria.map((rowCrit) => (
                  <tr key={rowCrit.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-semibold text-gray-800">{rowCrit.name} ({rowCrit.id})</td>
                    {criteria.map((colCrit) => (
                      <td key={colCrit.id} className="px-3 py-3 text-center font-mono text-xs text-gray-600">
                        {(ahpResult.normalizedMatrix[rowCrit.id]?.[colCrit.id] ?? 0).toFixed(3)}
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center font-bold font-mono text-blue-700">
                      {(ahpResult.weights[rowCrit.id] ?? 0).toFixed(6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Consistency metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'n (kriteria)', value: criteria.length.toString() },
              { label: 'λ Maks', value: ahpResult.lambdaMax.toFixed(4) },
              { label: 'CI', value: ahpResult.consistencyIndex.toFixed(4) },
              { label: 'CR', value: ahpResult.consistencyRatio.toFixed(4) },
            ].map((m) => (
              <div key={m.label} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{m.label}</span>
                <span className={`text-lg font-bold font-mono ${m.label === 'CR' ? (ahpResult.isConsistent ? 'text-green-600' : 'text-amber-600') : 'text-gray-800'}`}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Summary ── */}
      {activeTab === 'summary' && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <h4 className="font-bold text-gray-800 mb-3">🏆 Kesimpulan</h4>
            <p className="text-sm text-gray-600 mb-3">
              Kandidat terbaik untuk peserta lomba paskibraka:
            </p>
            <ol className="space-y-2">
              {sawResult.rankings.slice(0, 3).map((entry) => (
                <li key={entry.alternativeId} className="flex items-center gap-2 text-sm">
                  <span className="text-xl">{medalEmoji(entry.rank)}</span>
                  <span className="font-semibold text-gray-800">{entry.alternativeName}</span>
                  <span className="ml-auto font-mono text-gray-500">{entry.preferenceValue.toFixed(6)}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <h4 className="font-bold text-gray-800 mb-3">⚖️ Bobot Kriteria (AHP)</h4>
            <ul className="space-y-2">
              {criteria.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{c.id}</span>
                  <span className="flex-1 text-gray-700">{c.name}</span>
                  <span className="font-bold font-mono text-blue-600">{((ahpResult.weights[c.id] ?? 0) * 100).toFixed(2)}%</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:col-span-2">
            <h4 className="font-bold text-gray-800 mb-3">📊 Konsistensi AHP</h4>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-600">CR = <strong className="font-mono">{ahpResult.consistencyRatio.toFixed(4)}</strong></span>
              {ahpResult.isConsistent ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Konsisten (CR ≤ 0.1)</span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">CR &gt; 0.1 (perlu ditinjau)</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap pt-2">
        <button onClick={onBack} className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
          ← Kembali
        </button>
        <button onClick={onReset} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition">
          🔄 Mulai Ulang
        </button>
      </div>
    </div>
  );
};

export default Results;
