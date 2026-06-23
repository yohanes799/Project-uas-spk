import React from 'react';
import type { Alternative, Criterion, CriterionConfig } from '../types';

interface AlternativesInputProps {
  criteria: Criterion[];
  criteriaConfig: CriterionConfig[];
  alternatives: Alternative[];
  onAlternativesChange: (alts: Alternative[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const CRITERION_OPTIONS: Record<string, Array<{ label: string; value: number }>> = {
  C2: [
    { label: 'Tidak Ada Penyakit (100)', value: 100 },
    { label: 'Ada Penyakit (50)',         value: 50  },
  ],
  C3: [
    { label: 'Sangat Baik (100)', value: 100 },
    { label: 'Baik (80)',          value: 80  },
    { label: 'Cukup (60)',         value: 60  },
    { label: 'Buruk (40)',         value: 40  },
    { label: 'Sangat Buruk (20)',  value: 20  },
  ],
  C4: [
    { label: 'Sangat Baik (100)', value: 100 },
    { label: 'Baik (80)',          value: 80  },
    { label: 'Cukup (60)',         value: 60  },
    { label: 'Buruk (40)',         value: 40  },
    { label: 'Sangat Buruk (20)',  value: 20  },
  ],
};

const getOptions = (critId: string) => CRITERION_OPTIONS[critId] ?? null;

const inputCls = "w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition";
const selectCls = "w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer transition";

const AlternativesInput: React.FC<AlternativesInputProps> = ({
  criteria, criteriaConfig, alternatives, onAlternativesChange, onBack, onNext,
}) => {
  const addAlternative = () => {
    const newId = `A${alternatives.length + 1}`;
    const values: Record<string, number> = {};
    criteria.forEach((c) => { values[c.id] = getOptions(c.id)?.[0].value ?? 0; });
    onAlternativesChange([...alternatives, { id: newId, name: '', values }]);
  };

  const removeAlternative = (id: string) => {
    if (alternatives.length <= 2) { alert('Minimal harus ada 2 alternatif.'); return; }
    onAlternativesChange(alternatives.filter((a) => a.id !== id));
  };

  const updateName = (id: string, name: string) =>
    onAlternativesChange(alternatives.map((a) => (a.id === id ? { ...a, name } : a)));

  const updateValue = (altId: string, critId: string, raw: string) => {
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    onAlternativesChange(
      alternatives.map((a) => a.id === altId ? { ...a, values: { ...a.values, [critId]: num } } : a)
    );
  };

  const canProceed =
    alternatives.length >= 2 &&
    alternatives.every((a) =>
      a.name.trim() !== '' &&
      criteria.every((c) => a.values[c.id] !== undefined && !isNaN(a.values[c.id]))
    );

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Langkah 3: Input Data Alternatif</h2>
        <p className="text-gray-500 text-sm">
          Masukkan nilai setiap calon peserta. Kriteria yang memiliki opsi preset menggunakan dropdown pilihan.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-3 py-3 text-left font-semibold w-10">#</th>
              <th className="px-3 py-3 text-left font-semibold min-w-[160px]">Nama Peserta</th>
              {criteria.map((c) => {
                const config = criteriaConfig.find((cc) => cc.id === c.id);
                return (
                  <th key={c.id} className="px-3 py-3 text-center font-semibold min-w-[170px]">
                    <div className="text-gray-700">{c.name}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">{c.id}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${config?.type === 'benefit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {config?.type ?? 'benefit'}
                      </span>
                    </div>
                  </th>
                );
              })}
              <th className="px-3 py-3 text-left font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {alternatives.map((alt, idx) => (
              <tr key={alt.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-3 py-3 text-gray-400 font-semibold text-center">{idx + 1}</td>
                <td className="px-3 py-3">
                  <input
                    type="text"
                    value={alt.name}
                    onChange={(e) => updateName(alt.id, e.target.value)}
                    placeholder="Nama peserta..."
                    className={inputCls}
                    aria-label={`Nama peserta ${idx + 1}`}
                  />
                </td>
                {criteria.map((crit) => {
                  const opts = getOptions(crit.id);
                  const currentVal = alt.values[crit.id] ?? 0;
                  const matchedVal = opts
                    ? (opts.find((o) => o.value === currentVal) ? currentVal : opts[0].value)
                    : currentVal;

                  return (
                    <td key={crit.id} className="px-3 py-3">
                      {opts ? (
                        <select
                          value={matchedVal}
                          onChange={(e) => updateValue(alt.id, crit.id, e.target.value)}
                          className={selectCls}
                          aria-label={`${crit.name} untuk peserta ${idx + 1}`}
                        >
                          {opts.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          value={currentVal}
                          onChange={(e) => updateValue(alt.id, crit.id, e.target.value)}
                          className={`${inputCls} text-center`}
                          min={0}
                          aria-label={`${crit.name} untuk peserta ${idx + 1}`}
                        />
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-3">
                  <button
                    onClick={() => removeAlternative(alt.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add button */}
      <button
        onClick={addAlternative}
        className="self-start px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
      >
        + Tambah Peserta
      </button>

      {/* Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <h4 className="font-bold mb-2">📋 Panduan Nilai</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Tinggi Badan (C1)</strong>: Angka dalam cm (mis. 165, 170)</li>
          <li><strong>Riwayat Penyakit (C2)</strong>: Pilih dari dropdown</li>
          <li><strong>Mahir Baris Berbaris (C3)</strong>: Pilih dari dropdown</li>
          <li><strong>Berpenampilan Menarik (C4)</strong>: Pilih dari dropdown</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onBack} className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
          ← Kembali
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition"
        >
          Hitung Hasil →
        </button>
      </div>

      {!canProceed && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span>⚠</span>
          <span>Pastikan semua peserta memiliki nama dan nilai yang valid.</span>
        </div>
      )}
    </div>
  );
};

export default AlternativesInput;
