-- 1. STRUKTUR TABEL

CREATE TABLE IF NOT EXISTS dim_karyawan (
    id_karyawan VARCHAR(20) PRIMARY KEY,
    nama_karyawan VARCHAR(100) NOT NULL,
    departemen VARCHAR(50) NOT NULL,
    posisi VARCHAR(50) NOT NULL,
    gaji_harian REAL NOT NULL,
    status_aktif VARCHAR(15) DEFAULT 'Aktif',
    tanggal_resign DATE NULL
);

CREATE TABLE IF NOT EXISTS fact_presensi (
    id_presensi INTEGER PRIMARY KEY AUTOINCREMENT,
    id_karyawan VARCHAR(20),
    tanggal DATE NOT NULL,
    status_kehadiran VARCHAR(20) NOT NULL,
    UNIQUE(id_karyawan, tanggal), -- <--- TAMBAHKAN BARIS INI
    FOREIGN KEY (id_karyawan) REFERENCES dim_karyawan(id_karyawan) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sys_parameter (
    id_parameter INTEGER PRIMARY KEY DEFAULT 1,
    anggaran_investasi REAL NOT NULL,
    biaya_rekrutmen_per_orang REAL NOT NULL,
    tahun_fiskal INTEGER NOT NULL
);

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

-- 4. PARAMETER SISTEM FINANSIAL
-- Anggaran Investasi Program: Rp 150.000.000
-- Estimasi Biaya Rekrutmen/Orang: Rp 12.500.000
INSERT OR IGNORE INTO sys_parameter (id_parameter, anggaran_investasi, biaya_rekrutmen_per_orang, tahun_fiskal) VALUES 
(1, 150000000, 12500000, 2026);