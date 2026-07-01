import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import pool from './config/db';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- RUTE KRITERIA ---
app.get('/api/kriteria', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT * FROM kriteria');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil kriteria' });
    }
});

app.post('/api/kriteria', async (req: Request, res: Response) => {
    try {
        const { kode, nama, tipe } = req.body;
        await pool.query('INSERT INTO kriteria (kode, nama, tipe) VALUES (?, ?, ?)', [kode, nama, tipe]);
        res.json({ success: true, message: 'Kriteria berhasil ditambah' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal menambah kriteria' });
    }
});

app.delete('/api/kriteria/:kode', async (req: Request, res: Response) => {
    try {
        const { kode } = req.params;
        await pool.query('DELETE FROM kriteria WHERE kode = ?', [kode]);
        res.json({ success: true, message: 'Kriteria berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal menghapus kriteria' });
    }
});

app.put('/api/kriteria/:kode', async (req: Request, res: Response) => {
    try {
        const { kode } = req.params;
        const { nama, tipe } = req.body; // Terima nama atau tipe
        
        // Kita gunakan logika dinamis agar bisa update salah satu atau keduanya
        if (nama) await pool.query('UPDATE kriteria SET nama = ? WHERE kode = ?', [nama, kode]);
        if (tipe) await pool.query('UPDATE kriteria SET tipe = ? WHERE kode = ?', [tipe, kode]);
        
        res.json({ success: true, message: 'Data kriteria berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal update data' });
    }
});

// --- RUTE AHP ---
app.post('/api/ahp', async (req: Request, res: Response) => {
    try {
        // TERIMA matriks DAN daftar kode kriteria dari frontend
        const { matriks, kriteria_kodes } = req.body; 
        
        const n = matriks.length;
        const colSums = new Array(n).fill(0);
        const weights = new Array(n).fill(0);

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) colSums[j] += matriks[i][j];
        }

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) weights[i] += (matriks[i][j] / colSums[j]);
            weights[i] /= n;
        }

        /*// Simpan ke DB MENGGUNAKAN 'kode' (C1, C2, dst), BUKAN 'id' angka
        for (let i = 0; i < n; i++) {
            await pool.query('UPDATE kriteria SET bobot_ahp = ? WHERE kode = ?', [weights[i], kriteria_kodes[i]]);
        }*/

        res.json({ success: true, message: 'Bobot AHP disimpan', data: weights });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error perhitungan AHP' });
    }
});

    // Endpoint untuk menyimpan nilai perbandingan ke database
app.post('/api/ahp_matriks', async (req: Request, res: Response) => {
    try {
        const { kriteria_id_1, kriteria_id_2, nilai_perbandingan } = req.body;

        // Cek apakah data perbandingan ini sudah ada di database
        const [existing] = await pool.query(
            'SELECT * FROM ahp_matriks WHERE kriteria_id_1 = ? AND kriteria_id_2 = ?',
            [kriteria_id_1, kriteria_id_2]
        );

        if ((existing as any[]).length > 0) {
            // Jika sudah ada, lakukan UPDATE
            await pool.query(
                'UPDATE ahp_matriks SET nilai_perbandingan = ? WHERE kriteria_id_1 = ? AND kriteria_id_2 = ?',
                [nilai_perbandingan, kriteria_id_1, kriteria_id_2]
            );
        } else {
            // Jika belum ada, lakukan INSERT
            await pool.query(
                'INSERT INTO ahp_matriks (kriteria_id_1, kriteria_id_2, nilai_perbandingan) VALUES (?, ?, ?)',
                [kriteria_id_1, kriteria_id_2, nilai_perbandingan]
            );
        }

        res.json({ success: true, message: 'Matriks berhasil disimpan' });
    } catch (error) {
        console.error("ERROR DARI DATABASE:", error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan matriks' });
    }
});

    // Endpoint untuk mengambil data matriks saat web di-refresh
app.get('/api/ahp_matriks', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT * FROM ahp_matriks');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal mengambil matriks' });
    }
});

    // Tambahkan rute ini di server.ts
app.get('/api/alternatif', async (req: Request, res: Response) => {
    try {
        // Query ini menggabungkan tabel alternatif dan penilaian
        const query = `
            SELECT a.id, a.nama_peserta, p.kriteria_id, p.nilai 
            FROM alternatif a 
            LEFT JOIN penilaian p ON a.id = p.alternatif_id
        `;
        const [rows]: any = await pool.query(query);

        // Mengelompokkan nilai berdasarkan peserta agar formatnya sesuai dengan frontend
        const groupedData = rows.reduce((acc: any, row: any) => {
            if (!acc[row.id]) {
                acc[row.id] = { id: `A${row.id}`, name: row.nama_peserta, values: {} };
            }
            if (row.kriteria_id) {
                acc[row.id].values[row.kriteria_id] = row.nilai;
            }
            return acc;
        }, {});

        res.json({ success: true, data: Object.values(groupedData) });
    } catch (error) {
        console.error("Error mengambil alternatif:", error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data' });
    }
});

    // Tambahkan di server.ts
app.delete('/api/alternatif/:id', async (req: Request, res: Response) => {
    try {
        const rawId = String(req.params.id);
        const altId = rawId.replace('A', ''); 

        // 1. Hapus jejak kalkulasi di tabel hasil_akhir terlebih dahulu
        await pool.query('DELETE FROM hasil_akhir WHERE alternatif_id = ?', [altId]);

        // 2. Hapus jejak nilai mentah di tabel penilaian
        await pool.query('DELETE FROM penilaian WHERE alternatif_id = ?', [altId]);
        
        // 3. Setelah semua jejak bersih, baru kita bisa menghapus nama pesertanya
        await pool.query('DELETE FROM alternatif WHERE id = ?', [altId]);

        res.json({ success: true, message: 'Peserta berhasil dihapus permanen' });
    } catch (error) {
        // INI ADALAH MATA ANDA. Selalu baca terminal jika terjadi error.
        console.error("Error menghapus alternatif:", error); 
        res.status(500).json({ success: false, message: 'Gagal menghapus data di database' });
    }
});

app.get('/api/saw', async (req: Request, res: Response) => {
    try {
        console.log("--- PROSES SAW DIMULAI ---");
        
        const [kriteriaRows]: any = await pool.query('SELECT kode, tipe, bobot_ahp FROM kriteria');
        const [penilaianRows]: any = await pool.query('SELECT p.alternatif_id, a.nama_peserta, p.kriteria_id, p.nilai FROM penilaian p JOIN alternatif a ON p.alternatif_id = a.id');

        const minMax: Record<string, { max: number, min: number }> = {};
        kriteriaRows.forEach((k: any) => {
            const nilai = penilaianRows.filter((p: any) => p.kriteria_id === k.kode).map((p: any) => Number(p.nilai) || 0);
            if (nilai.length > 0) minMax[k.kode] = { max: Math.max(...nilai), min: Math.min(...nilai) };
        });

        const hasilPeserta: Record<number, any> = {};
        penilaianRows.forEach((p: any) => {
            if (!hasilPeserta[p.alternatif_id]) {
                hasilPeserta[p.alternatif_id] = { id: p.alternatif_id, nama_peserta: p.nama_peserta, nilai_total: 0 };
            }
            const k = kriteriaRows.find((k: any) => k.kode === p.kriteria_id);
            if (!k) return;

            const batas = minMax[k.kode];
            const isCost = String(k.tipe).toLowerCase().trim() === 'cost';
            const val = Number(p.nilai) || 0;

            const norm = !isCost 
                ? (val / (batas?.max || 1)) 
                : ((batas?.min || 1) / (val || 1));

            hasilPeserta[p.alternatif_id].nilai_total += (norm * k.bobot_ahp);
        });

        const ranking = Object.values(hasilPeserta).sort((a: any, b: any) => b.nilai_total - a.nilai_total);

        // --- PROSES SIMPAN KE DATABASE ---
        console.log("Mulai menyimpan ke database...");
        
        // 1. Bersihkan tabel lama
        await pool.query('TRUNCATE TABLE hasil_akhir');
        console.log("Tabel hasil_akhir berhasil dikosongkan.");

        // 2. Simpan hasil perhitungan
        for (const r of ranking) {
            const status = r.nilai_total >= 0.5 ? 'Lolos' : 'Cadangan';
            await pool.query(
                'INSERT INTO hasil_akhir (alternatif_id, nilai_total, status) VALUES (?, ?, ?)',
                [r.id, r.nilai_total, status]
            );
            console.log(`Berhasil simpan: ${r.nama_peserta} (${r.nilai_total})`);
        }
        
        console.log("--- PROSES SELESAI ---");
        res.json({ success: true, data: ranking });

    } catch (error) {
        console.error("ERROR TERJADI:", error);
        res.status(500).json({ success: false, message: 'Error perhitungan', error: error });
    }
});
    // Endpoint untuk menyimpan data alternatif dan nilainya
app.post('/api/penilaian', async (req: Request, res: Response) => {
    try {
        const { alternatives } = req.body; // Menerima data dari frontend

        for (const alt of alternatives) {
            // Frontend mengirim ID dengan format 'A1', 'A2', dst. Kita hapus huruf 'A'-nya.
            const altId = alt.id.replace('A', ''); 

            // 1. Simpan atau Update Nama Peserta di tabel alternatif
            const [existingAlt]: any = await pool.query('SELECT * FROM alternatif WHERE id = ?', [altId]);
            if (existingAlt.length > 0) {
                await pool.query('UPDATE alternatif SET nama_peserta = ? WHERE id = ?', [alt.name, altId]);
            } else {
                await pool.query('INSERT INTO alternatif (id, nama_peserta) VALUES (?, ?)', [altId, alt.name]);
            }

            // 2. Simpan atau Update Nilai di tabel penilaian
            for (const [kriteria_id, nilai] of Object.entries(alt.values)) {
                const [existingNilai]: any = await pool.query('SELECT * FROM penilaian WHERE alternatif_id = ? AND kriteria_id = ?', [altId, kriteria_id]);
                
                if (existingNilai.length > 0) {
                    await pool.query('UPDATE penilaian SET nilai = ? WHERE alternatif_id = ? AND kriteria_id = ?', [nilai, altId, kriteria_id]);
                } else {
                    await pool.query('INSERT INTO penilaian (alternatif_id, kriteria_id, nilai) VALUES (?, ?, ?)', [altId, kriteria_id, nilai]);
                }
            }
        }
        res.json({ success: true, message: 'Data peserta dan nilai berhasil disimpan' });
    } catch (error) {
        console.error("Error menyimpan penilaian:", error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server backend berjalan di http://localhost:${PORT}`);
});