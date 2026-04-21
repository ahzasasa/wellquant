# database.py - Modul Manajemen Basis Data WellQuant
import sqlite3
import os

DB_NAME = 'database.db'

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if os.path.exists('schema.sql'):
        with open('schema.sql', 'r', encoding='utf-8') as file:
            sql_script = file.read()
            cursor.executescript(sql_script)
            print("[*] Berkas schema.sql berhasil dieksekusi.")
    else:
        print("[!] Galat: Berkas schema.sql tidak ditemukan di direktori kerja.")
        
    conn.commit()
    conn.close()

def ambil_metrik_dasbor():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(id_karyawan) as populasi FROM dim_karyawan WHERE status_aktif = 'Aktif'")
    populasi = cursor.fetchone()['populasi'] or 0
    
    cursor.execute("SELECT COUNT(id_karyawan) as total_resign FROM dim_karyawan WHERE status_aktif = 'Resign'")
    jumlah_resign = cursor.fetchone()['total_resign'] or 0
    
    kueri_absensi = '''
        SELECT 
            COUNT(p.id_presensi) AS total_hari_absen,
            SUM(k.gaji_harian) AS total_upah_hilang
            FROM fact_presensi p
            JOIN dim_karyawan k ON p.id_karyawan = k.id_karyawan
            WHERE p.status_kehadiran IN ('Sakit', 'Alpha')
    '''
    cursor.execute(kueri_absensi)
    hasil_absensi = cursor.fetchone()
    total_absensi = hasil_absensi['total_hari_absen'] or 0
    defisit_upah = hasil_absensi['total_upah_hilang'] or 0
    
    cursor.execute("SELECT anggaran_investasi, biaya_rekrutmen_per_orang FROM sys_parameter WHERE id_parameter = 1")
    param = cursor.fetchone()
    anggaran = param['anggaran_investasi'] if param else 0
    biaya_rekrutmen = param['biaya_rekrutmen_per_orang'] if param else 0

    conn.close()
    
    return {
        "metrik_karyawan": { "populasi_aktif": populasi, "jumlah_resign": jumlah_resign },
        "metrik_absensi": { "total_hari_absen": total_absensi, "defisit_upah_rupiah": defisit_upah },
        "parameter_finansial": { "anggaran_investasi_rupiah": anggaran, "biaya_rekrutmen_rupiah": biaya_rekrutmen }
    }

def ambil_data_behavioral():
    """Mengekstraksi data analitik perilaku (Heatmap, Pie, & Tabel Individu)"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Data Presensi Mentah (Dikirim utuh agar bisa di-filter per bulan oleh JavaScript)
    cursor.execute("SELECT tanggal, status_kehadiran FROM fact_presensi")
    semua_presensi = [dict(row) for row in cursor.fetchall()]
    
    # 2. Distribusi Heatmap (Tanggal vs Jumlah Absen)
    cursor.execute('''
        SELECT tanggal, COUNT(*) as jumlah_absen 
        FROM fact_presensi 
        WHERE status_kehadiran IN ('Sakit', 'Alpha') 
        GROUP BY tanggal ORDER BY tanggal ASC
    ''')
    tren_harian = [dict(row) for row in cursor.fetchall()]
    
    # 3. Tabel Karyawan Kritis (Top 10 Absensi Tertinggi Keseluruhan)
    cursor.execute('''
        SELECT k.nama_karyawan, k.departemen, k.status_aktif, COUNT(p.id_presensi) as total_absen
        FROM dim_karyawan k
        JOIN fact_presensi p ON k.id_karyawan = p.id_karyawan
        WHERE p.status_kehadiran IN ('Sakit', 'Alpha')
        GROUP BY k.id_karyawan
        ORDER BY total_absen DESC LIMIT 10
    ''')
    tabel_karyawan = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return {
        "semua_presensi": semua_presensi,  # <- Kunci ini yang kita ubah
        "tren_harian": tren_harian,
        "tabel_karyawan": tabel_karyawan
    }