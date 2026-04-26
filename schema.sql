-- 1. STRUKTUR TABEL

-- Tabel dimensi karyawan
CREATE TABLE IF NOT EXISTS dim_karyawan (
    id_karyawan VARCHAR(20) PRIMARY KEY,
    nama_karyawan VARCHAR(100) NOT NULL,
    departemen VARCHAR(50) NOT NULL,
    posisi VARCHAR(50) NOT NULL,
    gaji_harian REAL NOT NULL,
    status_aktif VARCHAR(15) DEFAULT 'Aktif',
    tanggal_resign DATE NULL
);

-- tabel fakta presensi
CREATE TABLE IF NOT EXISTS fact_presensi (
    id_presensi INTEGER PRIMARY KEY AUTOINCREMENT,
    id_karyawan VARCHAR(20),
    tanggal DATE NOT NULL,
    status_kehadiran VARCHAR(20) NOT NULL,
    UNIQUE(id_karyawan, tanggal),
    FOREIGN KEY (id_karyawan) REFERENCES dim_karyawan(id_karyawan) ON DELETE CASCADE
);

-- Tabel parameter perusahaan
CREATE TABLE IF NOT EXISTS sys_parameter (
    id_parameter INTEGER PRIMARY KEY DEFAULT 1,
    anggaran_investasi REAL NOT NULL,
    biaya_rekrutmen_per_orang REAL NOT NULL,
    tahun_fiskal INTEGER NOT NULL
);

-- 4. Tabel dimensi KPI: Data Indikator per Divisi
CREATE TABLE IF NOT EXISTS dim_kpi (
    id_kpi VARCHAR(10) PRIMARY KEY,
    departemen VARCHAR(50) NOT NULL,
    nama_kpi VARCHAR(100) NOT NULL,
    target_bulanan NUMERIC NOT NULL,
    bobot_persen NUMERIC NOT NULL
);

-- 5. Tabel fakta kerja: pencapaian aktual karyawan
CREATE TABLE IF NOT EXISTS fact_kinerja (
    id_kinerja INTEGER PRIMARY KEY AUTOINCREMENT,
    id_karyawan VARCHAR(20) NOT NULL,
    id_kpi VARCHAR(10) NOT NULL,
    periode_bulan VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    pencapaian_aktual NUMERIC NOT NULL,
    UNIQUE(id_karyawan, id_kpi, periode_bulan),
    FOREIGN KEY (id_karyawan) REFERENCES dim_karyawan(id_karyawan) ON DELETE CASCADE,
    FOREIGN KEY (id_kpi) REFERENCES dim_kpi(id_kpi) ON DELETE CASCADE
);



-- KPI

INSERT OR IGNORE INTO dim_kpi (id_kpi, departemen, nama_kpi, target_bulanan, bobot_persen) VALUES 
-- 1. DIVISI OPERASIONAL
('KPI-OP1', 'Operasional', 'Pencapaian Target Produksi (Unit)', 1000, 50),
('KPI-OP2', 'Operasional', 'Produk Lolos Uji Mutu / Tanpa Cacat (Unit)', 1000, 30),
('KPI-OP3', 'Operasional', 'Kepatuhan Protokol K3 (%)', 100, 20),

-- 2. DIVISI TEKNOLOGI
('KPI-TK1', 'Teknologi', 'Sprint Task Selesai Tepat Waktu (Task)', 50, 45),
('KPI-TK2', 'Teknologi', 'Resolusi Bug Sesuai SLA (%)', 100, 35),
('KPI-TK3', 'Teknologi', 'Uptime Keandalan Server (%)', 100, 20),

-- 3. DIVISI PEMASARAN
('KPI-MK1', 'Pemasaran', 'Sales Quota / Pendapatan (Juta Rupiah)', 500, 50),
('KPI-MK2', 'Pemasaran', 'Akuisisi Klien Baru (Perusahaan)', 20, 30),
('KPI-MK3', 'Pemasaran', 'Skor Kepuasan Klien / NPS (Skala 1-10)', 10, 20),

-- 4. DIVISI KEUANGAN
('KPI-KU1', 'Keuangan', 'Akurasi Laporan Keuangan Bebas Temuan (%)', 100, 45),
('KPI-KU2', 'Keuangan', 'Ketepatan Waktu Tutup Buku Bulanan (%)', 100, 35),
('KPI-KU3', 'Keuangan', 'Efisiensi Penagihan Piutang (Juta Rupiah)', 200, 20),

-- 5. DIVISI STATISTIK (Data & Analytics)
('KPI-ST1', 'Statistik', 'Akurasi Model Prediksi Analitik (%)', 100, 45),
('KPI-ST2', 'Statistik', 'Ketepatan Waktu Rilis Dashboard (%)', 100, 35),
('KPI-ST3', 'Statistik', 'Rekomendasi Strategis yang Diterima (Ide)', 5, 20);

-- 2. VARIABEL DUMMY: 50 DATA KARYAWAN

INSERT OR IGNORE INTO dim_karyawan (id_karyawan, nama_karyawan, departemen, posisi, gaji_harian, status_aktif, tanggal_resign) VALUES 
-- Divisi Operasional (15 Orang)
('EMP-001', 'Budi Santoso', 'Operasional', 'Supervisor', 400000, 'Aktif', NULL),
('EMP-002', 'Dedi Pratama', 'Operasional', 'Staf', 250000, 'Aktif', NULL),
('EMP-003', 'Lina Marlina', 'Operasional', 'Staf', 250000, 'Aktif', NULL),
('EMP-004', 'Agus Setiawan', 'Operasional', 'Staf', 250000, 'Aktif', NULL),
('EMP-005', 'Rina Wati', 'Operasional', 'Staf', 250000, 'Aktif', NULL),
('EMP-006', 'Hendra Gunawan', 'Operasional', 'Staf', 260000, 'Resign', '2026-02-15'),
('EMP-007', 'Sari Indah', 'Operasional', 'Staf', 250000, 'Aktif', NULL),
('EMP-008', 'Joko Susilo', 'Operasional', 'Kepala Shift', 350000, 'Aktif', NULL),
('EMP-009', 'Ratna Galih', 'Operasional', 'Staf', 250000, 'Aktif', NULL),
('EMP-010', 'Eko Prasetyo', 'Operasional', 'Staf', 250000, 'Resign', '2026-03-20'),
('EMP-011', 'Fitri Handayani', 'Operasional', 'Staf', 250000, 'Aktif', NULL),
('EMP-012', 'Ahmad Dani', 'Operasional', 'Staf', 250000, 'Aktif', NULL),
('EMP-013', 'Dewi Lestari', 'Operasional', 'Staf', 250000, 'Aktif', NULL),
('EMP-014', 'Rizky Maulana', 'Operasional', 'Staf', 250000, 'Aktif', NULL),
('EMP-015', 'Nita Permata', 'Operasional', 'Staf', 250000, 'Aktif', NULL),

-- Divisi Teknologi (12 Orang)
('EMP-016', 'Andi Wijaya', 'Teknologi', 'Senior Developer', 600000, 'Aktif', NULL),
('EMP-017', 'Reza Pahlevi', 'Teknologi', 'Developer', 450000, 'Resign', '2026-04-10'),
('EMP-018', 'Dimas Anggara', 'Teknologi', 'Data Engineer', 550000, 'Aktif', NULL),
('EMP-019', 'Putri Diana', 'Teknologi', 'UI/UX Designer', 400000, 'Aktif', NULL),
('EMP-020', 'Fajar Sidik', 'Teknologi', 'System Analyst', 500000, 'Aktif', NULL),
('EMP-021', 'Bagas Putra', 'Teknologi', 'Developer', 450000, 'Aktif', NULL),
('EMP-022', 'Citra Kirana', 'Teknologi', 'QA Tester', 350000, 'Aktif', NULL),
('EMP-023', 'Gilang Ramadhan', 'Teknologi', 'Developer', 450000, 'Resign', '2026-01-25'),
('EMP-024', 'Hani Nabila', 'Teknologi', 'Scrum Master', 550000, 'Aktif', NULL),
('EMP-025', 'Iqbal Ramadhan', 'Teknologi', 'DevOps', 600000, 'Aktif', NULL),
('EMP-026', 'Kiki Fatmala', 'Teknologi', 'Developer', 450000, 'Aktif', NULL),
('EMP-027', 'Lukman Hakim', 'Teknologi', 'IT Support', 300000, 'Aktif', NULL),

-- Divisi Keuangan (8 Orang)
('EMP-028', 'Siti Aminah', 'Keuangan', 'Manajer', 500000, 'Aktif', NULL),
('EMP-029', 'Tomi Setiawan', 'Keuangan', 'Analis', 350000, 'Aktif', NULL),
('EMP-030', 'Vina Panduwinata', 'Keuangan', 'Staf Akunting', 300000, 'Aktif', NULL),
('EMP-031', 'Wawan Darmawan', 'Keuangan', 'Staf Akunting', 300000, 'Aktif', NULL),
('EMP-032', 'Yuni Shara', 'Keuangan', 'Auditor Internal', 400000, 'Resign', '2026-02-28'),
('EMP-033', 'Zainal Abidin', 'Keuangan', 'Staf Pajak', 320000, 'Aktif', NULL),
('EMP-034', 'Anita Sari', 'Keuangan', 'Kasir', 250000, 'Aktif', NULL),
('EMP-035', 'Beni Jatmiko', 'Keuangan', 'Staf Akunting', 300000, 'Aktif', NULL),

-- Divisi Pemasaran (10 Orang)
('EMP-036', 'Maya Sari', 'Pemasaran', 'Manajer Pemasaran', 450000, 'Aktif', NULL),
('EMP-037', 'Coki Pardede', 'Pemasaran', 'Copywriter', 300000, 'Aktif', NULL),
('EMP-038', 'Dina Lorenza', 'Pemasaran', 'Staf Promosi', 280000, 'Aktif', NULL),
('EMP-039', 'Edi Brokoli', 'Pemasaran', 'Desainer Grafis', 320000, 'Resign', '2026-03-05'),
('EMP-040', 'Farah Quinn', 'Pemasaran', 'Digital Marketer', 350000, 'Aktif', NULL),
('EMP-041', 'Giring Ganesha', 'Pemasaran', 'Staf Promosi', 280000, 'Aktif', NULL),
('EMP-042', 'Hesti Purwadinata', 'Pemasaran', 'Public Relations', 400000, 'Aktif', NULL),
('EMP-043', 'Indra Bekti', 'Pemasaran', 'Event Organizer', 350000, 'Resign', '2026-04-01'),
('EMP-044', 'Jessica Iskandar', 'Pemasaran', 'Social Media', 300000, 'Aktif', NULL),
('EMP-045', 'Kevin Julio', 'Pemasaran', 'Staf Promosi', 280000, 'Aktif', NULL),

-- Divisi Statistik / Data (5 Orang)
('EMP-046', 'Rina Melati', 'Statistik', 'Lead Analis Data', 450000, 'Aktif', NULL),
('EMP-047', 'Sule Sutisna', 'Statistik', 'Data Entry', 250000, 'Aktif', NULL),
('EMP-048', 'Tukul Arwana', 'Statistik', 'Data Collector', 250000, 'Resign', '2026-01-10'),
('EMP-049', 'Uya Kuya', 'Statistik', 'Analis Data', 350000, 'Aktif', NULL),
('EMP-050', 'Vicky Prasetyo', 'Statistik', 'Surveyor', 280000, 'Aktif', NULL);

-- 3. DATA PRESENSI: 35 Rekaman

INSERT OR IGNORE INTO fact_presensi (id_karyawan, tanggal, status_kehadiran) VALUES 
('EMP-002', '2026-01-15', 'Sakit'), ('EMP-002', '2026-01-16', 'Sakit'),
('EMP-004', '2026-02-10', 'Alpha'), ('EMP-004', '2026-02-11', 'Alpha'),
('EMP-007', '2026-03-05', 'Sakit'),
('EMP-012', '2026-03-20', 'Sakit'), ('EMP-012', '2026-03-21', 'Sakit'), ('EMP-012', '2026-03-22', 'Sakit'),
('EMP-015', '2026-04-01', 'Alpha'),
('EMP-018', '2026-01-12', 'Sakit'), ('EMP-018', '2026-01-13', 'Sakit'),
('EMP-021', '2026-02-28', 'Sakit'),
('EMP-024', '2026-03-15', 'Sakit'), ('EMP-024', '2026-03-16', 'Sakit'),
('EMP-027', '2026-04-05', 'Alpha'),
('EMP-029', '2026-01-20', 'Sakit'),
('EMP-031', '2026-02-14', 'Sakit'), ('EMP-031', '2026-02-15', 'Sakit'),
('EMP-034', '2026-03-10', 'Alpha'), ('EMP-034', '2026-03-11', 'Alpha'),
('EMP-037', '2026-01-05', 'Sakit'),
('EMP-040', '2026-02-20', 'Sakit'), ('EMP-040', '2026-02-21', 'Sakit'), ('EMP-040', '2026-02-22', 'Sakit'),
('EMP-042', '2026-03-30', 'Alpha'),
('EMP-045', '2026-04-12', 'Sakit'),
('EMP-047', '2026-01-25', 'Sakit'), ('EMP-047', '2026-01-26', 'Sakit'),
('EMP-049', '2026-03-02', 'Sakit'), ('EMP-049', '2026-03-03', 'Sakit'),
('EMP-050', '2026-04-18', 'Alpha'),
('EMP-005', '2026-04-20', 'Sakit'), ('EMP-005', '2026-04-21', 'Sakit'),
('EMP-019', '2026-04-20', 'Sakit'),
('EMP-033', '2026-04-21', 'Alpha');



-- KPI

-- PENGISIAN PENCAPAIAN AKTUAL KARYAWAN (SELURUH 10 KARYAWAN)
-- Menyimulasikan kinerja bulan Maret 2026 vs April 2026

INSERT OR IGNORE INTO fact_kinerja (id_karyawan, id_kpi, periode_bulan, pencapaian_aktual) VALUES 

-- ==========================================
-- 1. DIVISI OPERASIONAL
-- ==========================================
-- EMP-001 (Ahmad Dani) - Aktif (April anjlok karena sakit)
('EMP-001', 'KPI-OP1', '2026-03', 980), 
('EMP-001', 'KPI-OP2', '2026-03', 950), 
('EMP-001', 'KPI-OP3', '2026-03', 100),
('EMP-001', 'KPI-OP1', '2026-04', 600), 
('EMP-001', 'KPI-OP2', '2026-04', 500), 
('EMP-001', 'KPI-OP3', '2026-04', 60),

-- EMP-006 (Rina Nose) - Resign (Kinerja memburuk sebelum akhirnya resign)
('EMP-006', 'KPI-OP1', '2026-03', 700), ('EMP-006', 'KPI-OP2', '2026-03', 650), ('EMP-006', 'KPI-OP3', '2026-03', 80),
('EMP-006', 'KPI-OP1', '2026-04', 300), ('EMP-006', 'KPI-OP2', '2026-04', 200), ('EMP-006', 'KPI-OP3', '2026-04', 50),

-- ==========================================
-- 2. DIVISI TEKNOLOGI
-- ==========================================
-- EMP-003 (Dedi Pratama) - Aktif (Kinerja stabil tinggi)
('EMP-003', 'KPI-TK1', '2026-03', 48), ('EMP-003', 'KPI-TK2', '2026-03', 95), ('EMP-003', 'KPI-TK3', '2026-03', 100),
('EMP-003', 'KPI-TK1', '2026-04', 46), ('EMP-003', 'KPI-TK2', '2026-04', 92), ('EMP-003', 'KPI-TK3', '2026-04', 100),

-- EMP-007 (Gilang Dirga) - Resign (Kinerja mulai turun karena burnout)
('EMP-007', 'KPI-TK1', '2026-03', 40),
('EMP-007', 'KPI-TK2', '2026-03', 80),
('EMP-007', 'KPI-TK3', '2026-03', 98),
('EMP-007', 'KPI-TK1', '2026-04', 20),
('EMP-007', 'KPI-TK2', '2026-04', 60),
('EMP-007', 'KPI-TK3', '2026-04', 95),

-- EMP-009 (Reza Rahadian) - Aktif (Karyawan bintang/Performa maksimal)
('EMP-009', 'KPI-TK1', '2026-03', 50), 
('EMP-009', 'KPI-TK2', '2026-03', 100),
('EMP-009', 'KPI-TK3', '2026-03', 100),
('EMP-009', 'KPI-TK1', '2026-04', 50), 
('EMP-009', 'KPI-TK2', '2026-04', 98), 
('EMP-009', 'KPI-TK3', '2026-04', 100),

-- ==========================================
-- 3. DIVISI PEMASARAN
-- ==========================================
-- EMP-002 (Farah Quinn) - Aktif (April anjlok karena stres/sakit)
('EMP-002', 'KPI-MK1', '2026-03', 500), ('EMP-002', 'KPI-MK2', '2026-03', 20), ('EMP-002', 'KPI-MK3', '2026-03', 9),
('EMP-002', 'KPI-MK1', '2026-04', 250), ('EMP-002', 'KPI-MK2', '2026-04', 8),  ('EMP-002', 'KPI-MK3', '2026-04', 6),

-- EMP-008 (Ayu Ting Ting) - Aktif (Konsisten mencapai target)
('EMP-008', 'KPI-MK1', '2026-03', 480), ('EMP-008', 'KPI-MK2', '2026-03', 18), ('EMP-008', 'KPI-MK3', '2026-03', 8.5),
('EMP-008', 'KPI-MK1', '2026-04', 490), ('EMP-008', 'KPI-MK2', '2026-04', 19), ('EMP-008', 'KPI-MK3', '2026-04', 9.0),

-- ==========================================
-- 4. DIVISI KEUANGAN
-- ==========================================
-- EMP-004 (Siti Nurhaliza) - Aktif (Akurasi sangat tinggi)
('EMP-004', 'KPI-KU1', '2026-03', 100), ('EMP-004', 'KPI-KU2', '2026-03', 100), ('EMP-004', 'KPI-KU3', '2026-03', 195),
('EMP-004', 'KPI-KU1', '2026-04', 98),  ('EMP-004', 'KPI-KU2', '2026-04', 100), ('EMP-004', 'KPI-KU3', '2026-04', 190),

-- EMP-010 (Tara Basro) - Resign (Banyak error sebelum resign)
('EMP-010', 'KPI-KU1', '2026-03', 80),  ('EMP-010', 'KPI-KU2', '2026-03', 90),  ('EMP-010', 'KPI-KU3', '2026-03', 150),
('EMP-010', 'KPI-KU1', '2026-04', 60),  ('EMP-010', 'KPI-KU2', '2026-04', 50),  ('EMP-010', 'KPI-KU3', '2026-04', 100),

-- ==========================================
-- 5. DIVISI STATISTIK
-- ==========================================
-- EMP-005 (Budi Santoso) - Aktif (Stabil)
('EMP-005', 'KPI-ST1', '2026-03', 95),  ('EMP-005', 'KPI-ST2', '2026-03', 100), ('EMP-005', 'KPI-ST3', '2026-03', 5),
('EMP-005', 'KPI-ST1', '2026-04', 92),  ('EMP-005', 'KPI-ST2', '2026-04', 95),  ('EMP-005', 'KPI-ST3', '2026-04', 4);




-- 4. PARAMETER SISTEM FINANSIAL
-- Anggaran Investasi Program: Rp 150.000.000
-- Estimasi Biaya Rekrutmen/Orang: Rp 12.500.000
INSERT OR IGNORE INTO sys_parameter (id_parameter, anggaran_investasi, biaya_rekrutmen_per_orang, tahun_fiskal) VALUES 
(1, 150000000, 12500000, 2026);




-- ============================================================================
-- PENGUJIAN FITUR AREA RISIKO TINGGI (BULAN MEI 2026)
-- Semua divisi dipaksa melanggar batas toleransi (Absen > 5 atau KPI < 75)
-- ============================================================================

-- 1. SUNTIKAN DATA ABSENSI BURUK BULAN MEI 2026 (Sakit & Alpha)
INSERT OR IGNORE INTO fact_presensi (id_karyawan, tanggal, status_kehadiran) VALUES 
-- Operasional: Total 6 Hari Absen (Akan memicu alarm Kecelakaan Kerja)
('EMP-001', '2026-05-04', 'Sakit'), ('EMP-001', '2026-05-05', 'Sakit'), ('EMP-001', '2026-05-06', 'Sakit'),
('EMP-006', '2026-05-11', 'Sakit'), ('EMP-006', '2026-05-12', 'Sakit'), ('EMP-006', '2026-05-13', 'Sakit'),

-- Pemasaran: Total 6 Hari Absen (Akan memicu alarm Revenue Loss)
('EMP-002', '2026-05-07', 'Alpha'), ('EMP-002', '2026-05-08', 'Alpha'), ('EMP-002', '2026-05-09', 'Alpha'),
('EMP-008', '2026-05-14', 'Sakit'), ('EMP-008', '2026-05-15', 'Sakit'), ('EMP-008', '2026-05-16', 'Sakit'),

-- Statistik: Total 6 Hari Absen (Akan memicu alarm Analytic Burnout)
('EMP-005', '2026-05-18', 'Sakit'), ('EMP-005', '2026-05-19', 'Sakit'), ('EMP-005', '2026-05-20', 'Sakit'),
('EMP-005', '2026-05-21', 'Sakit'), ('EMP-005', '2026-05-22', 'Sakit'), ('EMP-005', '2026-05-23', 'Sakit');


-- 2. SUNTIKAN DATA KINERJA BURUK BULAN MEI 2026 (Skor < 75)
INSERT OR IGNORE INTO fact_kinerja (id_karyawan, id_kpi, periode_bulan, pencapaian_aktual) VALUES 

-- Teknologi: Kinerja hancur massal (Akan memicu alarm Flight Risk)
('EMP-003', 'KPI-TK1', '2026-05', 15), ('EMP-003', 'KPI-TK2', '2026-05', 40), ('EMP-003', 'KPI-TK3', '2026-05', 70),
('EMP-007', 'KPI-TK1', '2026-05', 10), ('EMP-007', 'KPI-TK2', '2026-05', 30), ('EMP-007', 'KPI-TK3', '2026-05', 60),
('EMP-009', 'KPI-TK1', '2026-05', 20), ('EMP-009', 'KPI-TK2', '2026-05', 50), ('EMP-009', 'KPI-TK3', '2026-05', 80),

-- Keuangan: Akurasi hancur (Akan memicu alarm Human Error / Audit Risk)
('EMP-004', 'KPI-KU1', '2026-05', 50), ('EMP-004', 'KPI-KU2', '2026-05', 50), ('EMP-004', 'KPI-KU3', '2026-05', 100),
('EMP-010', 'KPI-KU1', '2026-05', 40), ('EMP-010', 'KPI-KU2', '2026-05', 40), ('EMP-010', 'KPI-KU3', '2026-05', 80),

-- (Pengisi data pelengkap agar divisi lain tidak bernilai kosong/NaN di bulan Mei)
('EMP-001', 'KPI-OP1', '2026-05', 900), ('EMP-001', 'KPI-OP2', '2026-05', 900), ('EMP-001', 'KPI-OP3', '2026-05', 100),
('EMP-002', 'KPI-MK1', '2026-05', 400), ('EMP-002', 'KPI-MK2', '2026-05', 15),  ('EMP-002', 'KPI-MK3', '2026-05', 8),
('EMP-005', 'KPI-ST1', '2026-05', 40),  ('EMP-005', 'KPI-ST2', '2026-05', 50),  ('EMP-005', 'KPI-ST3', '2026-05', 2);