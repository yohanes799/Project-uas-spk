import React, { useEffect } from 'react';
import type { AHPPairwiseMatrix, AHPResult, Criterion } from '../types';
import { updateMatrixSymmetric } from '../utils/ahp';
import api from '../utils/api';

interface AHPMatrixProps {
  criteria: Criterion[];
  matrix: AHPPairwiseMatrix;
  ahpResult: AHPResult | null;
  onMatrixChange: (matrix: AHPPairwiseMatrix) => void;
  onBack: () => void;
  onNext: () => void;
}

const SAATY_VALUES = [
  { value: 9,     label: '9 – Mutlak lebih penting' },
  { value: 8,     label: '8' },
  { value: 7,     label: '7 – Sangat kuat lebih penting' },
  { value: 6,     label: '6' },
  { value: 5,     label: '5 – Kuat lebih penting' },
  { value: 4,     label: '4' },
  { value: 3,     label: '3 – Sedang lebih penting' },
  { value: 2,     label: '2' },
  { value: 1,     label: '1 – Sama penting' },
  { value: 1/2,   label: '1/2' },
  { value: 1/3,   label: '1/3 – Sedang kurang penting' },
  { value: 1/4,   label: '1/4' },
  { value: 1/5,   label: '1/5 – Kuat kurang penting' },
  { value: 1/6,   label: '1/6' },
  { value: 1/7,   label: '1/7 – Sangat kuat kurang penting' },
  { value: 1/8,   label: '1/8' },
  { value: 1/9,   label: '1/9 – Mutlak kurang penting' },
];

function findClosestSaaty(val: number): number {
  let closest = SAATY_VALUES[0].value;
  let minDiff = Infinity;
  for (const opt of SAATY_VALUES) {
    const diff = Math.abs(opt.value - val);
    if (diff < minDiff) { minDiff = diff; closest = opt.value; }
  }
  return closest;
}

const selectCls = "w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer transition";

const AHPMatrix: React.FC<AHPMatrixProps> = ({
  criteria, matrix, ahpResult, onMatrixChange, onBack, onNext,
}) => {

  // 1. FUNGSI UNTUK MENGAMBIL DATA DARI DATABASE SAAT HALAMAN DIMUAT
  useEffect(() => {
    const loadMatrixFromDB = async () => {
      try {
        const response = await api.get('/ahp_matriks');
        const dbData = response.data.data;
        
        if (dbData && dbData.length > 0) {
          // Buat salinan dari matriks default yang sudah ada
          let loadedMatrix = structuredClone(matrix);
          
          // Timpa nilainya dengan data dari database
          dbData.forEach((item: any) => {
            if (loadedMatrix[item.kriteria_id_1] && loadedMatrix[item.kriteria_id_1][item.kriteria_id_2] !== undefined) {
              loadedMatrix[item.kriteria_id_1][item.kriteria_id_2] = item.nilai_perbandingan;
              
              // Isi otomatis nilai resiprokal/kebalikannya
              if (item.kriteria_id_1 !== item.kriteria_id_2) {
                loadedMatrix[item.kriteria_id_2][item.kriteria_id_1] = 1 / item.nilai_perbandingan;
              }
            }
          });
          
          // Perbarui tampilan antarmuka
          onMatrixChange(loadedMatrix);
        }
      } catch (error) {
        console.error("Gagal memuat matriks dari database:", error);
      }
    };

    // Panggil fungsi saat komponen pertama kali di-render
    if (criteria.length > 0) {
      loadMatrixFromDB();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array kosong berarti hanya dijalankan 1x saat load


  // 2. UPDATE FUNGSI INI UNTUK MENYIMPAN KE DATABASE
  const handleCellChange = async (rowId: string, colId: string, value: number) => {
    // Update antarmuka secara instan (agar tidak ada jeda loading)
    const updatedMatrix = updateMatrixSymmetric(matrix, rowId, colId, value);
    onMatrixChange(updatedMatrix);

    // Kirim data ke database secara background
    try {
      await api.post('/ahp_matriks', {
        kriteria_id_1: rowId,
        kriteria_id_2: colId,
        nilai_perbandingan: value
      });
    } catch (error) {
      console.error("Gagal menyimpan ke database:", error);
      alert("Gagal menyimpan perubahan ke server.");
    }
  };

  // Tambahkan fungsi ini di dalam komponen AHPMatrix
  const handleNext = async () => {
    // 1. Ambil daftar kode kriteria (C1, C2, dst) secara berurutan
    const kodes = criteria.map(c => c.id);
    
    // 2. Ubah format matrix (objek) di React menjadi Array 2D untuk backend
    // Contoh hasil: [[1, 3, 5], [0.33, 1, 2], ...]
    const dataMatriksArray = kodes.map(rowId => {
      return kodes.map(colId => {
        return matrix[rowId]?.[colId] ?? 1;
      });
    });

    try {
      // 3. Kirim matriks dan urutan kode ke backend
      await api.post('/ahp', {
        matriks: dataMatriksArray,
        kriteria_kodes: kodes
      });
      
      // 4. Jika sukses tersimpan di database, baru pindah halaman
      onNext();
    } catch (error) {
      console.error("Gagal menyimpan bobot AHP:", error);
      alert("Gagal menyimpan perhitungan ke server. Silakan coba lagi.");
    }
  };

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Langkah 2: Matriks Perbandingan AHP</h2>
        <p className="text-gray-500 text-sm">
          Isi matriks perbandingan menggunakan skala Saaty (1–9). Diagonal = 1, segitiga bawah otomatis jadi kebalikan.
        </p>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 min-w-[140px]">
                Kriteria
              </th>
              {criteria.map((c) => (
                <th key={c.id} className="px-3 py-3 text-center text-xs font-semibold text-gray-600 border-b border-gray-200 min-w-[180px]">
                  <div>{c.name}</div>
                  <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{c.id}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {criteria.map((rowCrit, rowIdx) => (
              <tr key={rowCrit.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-700 text-sm whitespace-nowrap">
                  {rowCrit.name}
                  <br />
                  <span className="text-xs font-normal text-gray-400">{rowCrit.id}</span>
                </td>

                {criteria.map((colCrit, colIdx) => {
                  const isDiag = rowCrit.id === colCrit.id;
                  const isUpper = rowIdx < colIdx;
                  const cellVal = matrix[rowCrit.id]?.[colCrit.id] ?? 1;

                  if (isDiag) {
                    return (
                      <td key={colCrit.id} className="px-3 py-3 text-center bg-gray-100">
                        <span className="text-xl font-black text-gray-400">1</span>
                      </td>
                    );
                  }

                  {/* UPPER TRIANGLE */}
if (isUpper) {
  return (
    <td key={colCrit.id} className="px-3 py-3">
      <select
        value={findClosestSaaty(cellVal)}
        // Panggil fungsi handleCellChange, TIDAK PERLU tukar ID
        onChange={(e) => handleCellChange(rowCrit.id, colCrit.id, parseFloat(e.target.value))}
        className={selectCls}
      >
        {SAATY_VALUES.map((opt) => (
          <option key={opt.label} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </td>
  );
}

{/* LOWER TRIANGLE */}
// Lower triangle
return (
  <td key={colCrit.id} className="px-3 py-3 bg-slate-50">
    <select
      value={findClosestSaaty(cellVal)} 
      // Panggil fungsi handleCellChange, TIDAK PERLU tukar ID
      onChange={(e) => handleCellChange(rowCrit.id, colCrit.id, parseFloat(e.target.value))}
      className={`${selectCls} opacity-70 bg-slate-50`}
    >
      {SAATY_VALUES.map((opt) => (
        <option key={opt.label} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <span className="block text-center text-[10px] text-gray-400 mt-0.5">reciprocal</span>
  </td>
);
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AHP Result */}
      {ahpResult && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col gap-5">
          <h3 className="text-base font-bold text-gray-800">Hasil Perhitungan AHP</h3>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'λ Maks', value: ahpResult.lambdaMax.toFixed(4), color: 'text-gray-800' },
              { label: 'Consistency Index (CI)', value: ahpResult.consistencyIndex.toFixed(4), color: 'text-gray-800' },
              { label: 'Consistency Ratio (CR)', value: ahpResult.consistencyRatio.toFixed(4), color: ahpResult.isConsistent ? 'text-green-600' : 'text-amber-600' },
              { label: 'Status', value: ahpResult.isConsistent ? 'Konsisten ✓' : 'CR > 0.1 ⚠', color: ahpResult.isConsistent ? 'text-green-600' : 'text-amber-600' },
            ].map((m) => (
              <div key={m.label} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{m.label}</span>
                <span className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</span>
              </div>
            ))}
          </div>

          {/* Weights */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">Bobot Kriteria</h4>
            <div className="flex flex-col gap-2.5">
              {criteria.map((crit) => {
                const weight = ahpResult.weights[crit.id] ?? 0;
                return (
                  <div key={crit.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{crit.id}</span>
                      <span className="flex-1 text-sm font-medium text-gray-700">{crit.name}</span>
                      <span className="text-sm font-bold text-blue-600 font-mono">{(weight * 100).toFixed(2)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${weight * 100}%` }}
                        role="progressbar"
                        aria-valuenow={weight * 100}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onBack} className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
          ← Kembali
        </button>
        <button onClick={handleNext} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition">
  Lanjut ke Data Alternatif →
</button>
      </div>

      {ahpResult && !ahpResult.isConsistent && (
        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="mt-0.5">⚠</span>
          <span>
            CR = {ahpResult.consistencyRatio.toFixed(4)} &gt; 0.1. Penilaian kurang konsisten.
            Disarankan menyesuaikan matriks, namun Anda tetap bisa melanjutkan.
          </span>
        </div>
      )}
    </div>
  );
};

export default AHPMatrix;
