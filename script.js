// 1. STATE GLOBAL
let chartInstances = {};
let isCalculatorSynced = false; 

// 2. FUNGSI UTILITAS UMUM
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

function destroyChart(chartId) {
    if (chartInstances[chartId]) {
        chartInstances[chartId].destroy();
    }
}

// 3. NAVIGASI SINGLE PAGE APPLICATION (SPA)
function switchPage(targetPageId, selectedElement) {
    const allPages = document.querySelectorAll('.page-content');
    allPages.forEach(page => page.style.display = 'none');

    const targetPage = document.getElementById(targetPageId);
    if (targetPage) targetPage.style.display = 'block';

    const menuItems = document.querySelectorAll('#sidebarMenu li');
    menuItems.forEach(item => item.classList.remove('active'));
    selectedElement.classList.add('active');

    if(targetPageId === 'page-simulator') {
        kalkulasiSimulator();
    } else if (targetPageId === 'page-behavioral') {
        fetchBehavioralData(); 
    }
}

// 4. INTEGRASI DATABASE & REAL-TIME POLLING
async function fetchDatabaseData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/v1/metrik-sdm');
        const result = await response.json();

        if (result.status === 'success') {
            const dbRealData = result.data;
            updateDashboardFaktual(dbRealData);
        }
    } catch (error) {
        console.error("[!] Gagal menarik data real-time dari API:", error);
    }
}

function syncToCalculatorInputs(data) {
    if (isCalculatorSynced || !document.getElementById('inpKaryawan')) return;
    
    const populasi = data.metrik_karyawan.populasi_aktif;
    const resign = data.metrik_karyawan.jumlah_resign;
    const hariAbsen = data.metrik_absensi.total_hari_absen;
    const defisitUpah = data.metrik_absensi.defisit_upah_rupiah;

    const absensiRate = populasi > 0 ? (hariAbsen / (240 * populasi)) * 100 : 0; 
    const turnoverRate = populasi > 0 ? (resign / populasi) * 100 : 0;
    const rataGajiHarian = hariAbsen > 0 ? (defisitUpah / hariAbsen) : 250000;
    
    document.getElementById('inpKaryawan').value = populasi;
    document.getElementById('inpGaji').value = Math.round(rataGajiHarian * 20);
    document.getElementById('inpAbsensi').value = absensiRate.toFixed(2);
    document.getElementById('inpTurnover').value = turnoverRate.toFixed(2);
    document.getElementById('inpInvestasi').value = Math.round(data.parameter_finansial.anggaran_investasi_rupiah);
    document.getElementById('inpRekrutmen').value = Math.round(data.parameter_finansial.biaya_rekrutmen_rupiah);

    isCalculatorSynced = true; 
}


// 5. LOGIKA DASBOR EKSEKUTIF (GRID LAYOUT)
function updateDashboardFaktual(data) {
    const populasi = data.metrik_karyawan.populasi_aktif;
    const resign = data.metrik_karyawan.jumlah_resign;
    const hariAbsen = data.metrik_absensi.total_hari_absen;
    const defisitUpah = data.metrik_absensi.defisit_upah_rupiah;
    const investasi = data.parameter_finansial.anggaran_investasi_rupiah;
    const biayaRekrutmen = data.parameter_finansial.biaya_rekrutmen_rupiah;

    const CA = defisitUpah + (defisitUpah * 0.5); 
    const CT = resign * biayaRekrutmen; 
    const absensiRate = populasi > 0 ? (hariAbsen / (240 * populasi)) * 100 : 0;
    const turnoverRate = populasi > 0 ? (resign / populasi) * 100 : 0;

    const hematRekrutmen = CT * 0.15;
    const hematVacancy = CT * 0.05;
    const hematUpahAbsen = CA * 0.12;
    const pemulihanProduktivitas = CA * 0.08;
    const totalHemat = hematRekrutmen + hematVacancy + hematUpahAbsen + pemulihanProduktivitas;
    
    const ROI = investasi > 0 ? ((totalHemat - investasi) / investasi) * 100 : 0;

    if (document.getElementById('dashInvestasi')) {
        document.getElementById('dashInvestasi').innerText = formatRupiah(investasi);
        document.getElementById('dashHemat').innerText = formatRupiah(totalHemat);
        document.getElementById('dashAbsensi').innerText = absensiRate.toFixed(1) + "%";
        document.getElementById('dashTurnover').innerText = turnoverRate.toFixed(1) + "%";
        document.getElementById('dashROI').innerText = ROI.toFixed(1) + "%";
    }

    renderSparkline('sparkInvestasi', [10, 20, 30, 40, 50], '#a0aec0');
    renderSparkline('sparkHemat', [5, 15, 25, 60, 100], '#237FEA');
    renderSparkline('sparkAbsensi', [8, 7, 6, 5.5, absensiRate], '#e74c3c');
    renderSparkline('sparkTurnover', [18, 17, 16, 15.5, turnoverRate], '#e74c3c');
    renderSparkline('sparkROI', [0, 50, 100, 150, ROI], '#237FEA');

    renderDonutBreakdown([hematRekrutmen, hematVacancy, hematUpahAbsen, pemulihanProduktivitas]);
    renderBenchmarkDivisi(turnoverRate);
    renderEfisiensiProgram();
    renderTabelRisiko(turnoverRate, absensiRate);
}

// Visualisasi Dasbor
function renderSparkline(canvasId, dataArr, color) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || ctx.offsetParent === null) return;
    
    destroyChart(canvasId);
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: { labels: ['1', '2', '3', '4', '5'], datasets: [{ data: dataArr, borderColor: color, borderWidth: 2, tension: 0.4, pointRadius: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
    });
}

function renderDonutBreakdown(dataArr) {
    const canvasId = 'donutBreakdown';
    const ctx = document.getElementById(canvasId);
    if (!ctx || ctx.offsetParent === null) return;

    destroyChart(canvasId);
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Biaya Rekrutmen', 'Biaya Kekosongan', 'Upah Absensi', 'Pemulihan Produktivitas'],
            datasets: [{ data: dataArr, backgroundColor: ['#237FEA', '#08C7E1', '#FF7E54', '#2c3e50'], borderWidth: 0 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { font: { weight: 'normal', family: "'Poppins', sans-serif", size: 11 }, boxWidth: 12, padding: 15 } },
                tooltip: { bodyFont: { weight: 'normal' }, titleFont: { weight: 'normal' }, callbacks: { label: function(c) { return ' ' + formatRupiah(c.raw); } } }
            }
        }
    });
}

function renderBenchmarkDivisi(avgTurnover) {
    const canvasId = 'barBenchmark';
    const ctx = document.getElementById(canvasId);
    if (!ctx || ctx.offsetParent === null) return;

    const divisiData = [avgTurnover + 4, avgTurnover - 2, avgTurnover + 1, avgTurnover - 5, avgTurnover]; 

    destroyChart(canvasId);
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ops', 'Keuangan', 'Teknologi', 'Statistik', 'Pemasaran'],
            datasets: [
                { type: 'line', label: 'Batas Toleransi Industri', data: [10, 10, 10, 10, 10], borderColor: '#e74c3c', borderWidth: 2, borderDash: [5, 5], fill: false, pointRadius: 0 },
                { type: 'bar', label: 'Tingkat Turnover (%)', data: divisiData, backgroundColor: '#2c3e50', borderRadius: 4, barPercentage: 0.5 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 25, ticks: { font: { weight: 'normal', family: "'Poppins'", size: 10 } } },
                x: { 
                    ticks: { font: { weight: 'normal', family: "'Poppins'", size: 10 }, maxRotation: 0, minRotation: 0 },
                    grid: { display: false } 
                }
            },
            plugins: { legend: { position: 'bottom', labels: { font: { weight: 'normal', size: 11 }, boxWidth: 12 } }, tooltip: { bodyFont: { weight: 'normal' }, titleFont: { weight: 'normal' } } }
        }
    });
}

function renderEfisiensiProgram() {
    const canvasId = 'barEfisiensi';
    const ctx = document.getElementById(canvasId);
    if (!ctx || ctx.offsetParent === null) return;

    destroyChart(canvasId);
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Konseling EAP', 'Program RTW', 'Ergonomis', 'Subsidi Gym'],
            datasets: [{ data: [85000000, 60000000, 35000000, 15000000], backgroundColor: '#08C7E1', borderRadius: 4, barPercentage: 0.6 }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            scales: { 
                x: { display: false }, 
                y: { ticks: { font: { weight: 'normal', family: "'Poppins'", size: 11 } }, grid: { display: false } }
            },
            plugins: { 
                legend: { display: false },
                tooltip: { bodyFont: { weight: 'normal' }, titleFont: { weight: 'normal' }, callbacks: { label: function(c) { return ' ' + formatRupiah(c.raw); } } } 
            }
        }
    });
}

// Logika batas toleransi di dasbor (Maksimal vs Minimal)
function dapatkanStatusToleransi(indikator, nilaiAktual, nilaiBatas) {
    // Pastikan data dibaca murni sebagai angka ukur
    let aktual = parseFloat(nilaiAktual);
    let batas = parseFloat(nilaiBatas);

    let namaIndikator = indikator.toLowerCase();

    // Kasus 1: Indikator Negatif (Absensi, Turnover, Flight Risk)
    if (namaIndikator.includes("absen") || namaIndikator.includes("turnover") || namaIndikator.includes("risiko")) {
        if (aktual > batas) {
            return '<span style="color: #e74c3c; font-weight: bold;">🔴 Di Atas Batas (Kritis)</span>';
        } else if (aktual === batas) {
            return '<span style="color: #f39c12; font-weight: bold;">🟡 Tepat di Batas (Waspada)</span>';
        } else {
            return '<span style="color: #2ecc71; font-weight: bold;">🟢 Aman</span>';
        }
    } 

    // Kasus 2: Indikator Positif (Skor KPI, Produktivitas, Keuntungan)
    else if (namaIndikator.includes("kpi") || namaIndikator.includes("kinerja") || namaIndikator.includes("skor")) {
        if (aktual < batas) {
            return '<span style="color: #e74c3c; font-weight: bold;">🔴 Di Bawah Batas (Kritis)</span>';
        } else if (aktual === batas) {
            return '<span style="color: #f39c12; font-weight: bold;">🟡 Tepat di Batas (Waspada)</span>';
        } else {
            return '<span style="color: #2ecc71; font-weight: bold;">🟢 Aman</span>';
        }
    }

    // Jika tipe indikator tidak dikenali
    return `<span style="color: #95a5a6;">Status Tidak Diketahui</span>`;
}


function renderTabelRisiko() {
    const tableBody = document.getElementById('risk-table-body');
    if (!tableBody) return;

    let monthStr = (currentMonth + 1).toString().padStart(2, '0');
    let prefixCari = `${currentYear}-${monthStr}`;
    
    // Minta hasil perhitungan otomatis
    let analitikDivisi = hitungAnalitikDivisi(prefixCari);
    let risikoData = [];

    // Evaluasi setiap divisi berdasarkan data mentah yang sudah dikalkulasi
    analitikDivisi.forEach(d => {
        // Jika Turnover > 10% ATAU Absen Divisi > 5 hari ATAU rata-rata KPI < 80
        if (d.prediksiTurnover > 10 || d.totalAbsen > 5 || d.rataKpi < 80) {
            let potensi = "";
            let rekomendasi = "";

            if (d.divisi === "Operasional") {
                potensi = "Kecelakaan Kerja / Fatigue"; rekomendasi = "Audit K3 & Penyesuaian Shift";
            } else if (d.divisi === "Teknologi") {
                potensi = "Flight Risk / Burnout"; rekomendasi = "Intervensi Konseling EAP";
            } else if (d.divisi === "Pemasaran") {
                potensi = "Revenue Loss / Stres Target"; rekomendasi = "Pelatihan Resilience & Bonus";
            } else if (d.divisi === "Keuangan") {
                potensi = "Human Error / Audit Risk"; rekomendasi = "Program Kesejahteraan Visual";
            } else {
                potensi = "Analytic Burnout"; rekomendasi = "Jadwal Kerja Fleksibel";
            }

            risikoData.push({ divisi: d.divisi, potensi: potensi, rekomendasi: rekomendasi });
        }
    });

    if (risikoData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: #2ecc71;">Semua Divisi Berada di Zona Aman</td></tr>`;
    } else {
        tableBody.innerHTML = risikoData.map(r => `
            <tr>
                <td style="font-weight:600;">${r.divisi}</td>
                <td style="color: #e74c3c; font-weight: bold;">${r.potensi}</td>
                <td style="font-size: 0.85rem;">${r.rekomendasi}</td>
            </tr>
        `).join('');
    }
}

// 6. LOGIKA EKSKLUSIF KALKULATOR ROI (SANDBOX)
function hitungKalkulatorManual() {
    const jmlKaryawan = parseFloat(document.getElementById('inpKaryawan').value) || 0;
    const gajiBulan = parseFloat(document.getElementById('inpGaji').value) || 0;
    const absensiPct = parseFloat(document.getElementById('inpAbsensi').value) || 0;
    const turnoverPct = parseFloat(document.getElementById('inpTurnover').value) || 0;
    const biayaRekrutmen = parseFloat(document.getElementById('inpRekrutmen').value) || 0;
    const investasi = parseFloat(document.getElementById('inpInvestasi').value) || 0;

    const upahHarian = gajiBulan / 22; 
    const totalHariAbsen = (absensiPct / 100) * 264 * jmlKaryawan; 
    const lossProductivity = 0.5 * upahHarian;
    
    const CA = totalHariAbsen * (upahHarian + lossProductivity);
    const CT = ((turnoverPct / 100) * jmlKaryawan) * biayaRekrutmen;
    const COI = CA + CT;

    const totalPenghematan = (CT * 0.10) + (CA * 0.10);
    const ROI = investasi > 0 ? ((totalPenghematan - investasi) / investasi) * 100 : 0;

    const panelHasil = document.getElementById('kalkulator-hasil');
    if (panelHasil) {
        panelHasil.style.display = 'block';
        document.getElementById('calcCA').innerText = formatRupiah(CA);
        document.getElementById('calcCT').innerText = formatRupiah(CT);
        document.getElementById('calcCOI').innerText = formatRupiah(COI);
        document.getElementById('calcROI').innerText = ROI.toFixed(1) + "%";
    }
}

function resetKalkulator() {
    document.getElementById('inpKaryawan').value = '';
    document.getElementById('inpGaji').value = '';
    document.getElementById('inpAbsensi').value = '';
    document.getElementById('inpTurnover').value = '';
    document.getElementById('inpRekrutmen').value = '';
    document.getElementById('inpInvestasi').value = '';
    
    const panelHasil = document.getElementById('kalkulator-hasil');
    if (panelHasil) {
        panelHasil.style.display = 'none';
    }
}

// 7. LOGIKA SIMULATOR INTERAKTIF
function updateSlider() {
    const valElement = document.getElementById('valSlider');
    const sliderElement = document.getElementById('sliderTurnover');
    if(valElement && sliderElement) {
        valElement.innerText = sliderElement.value;
        kalkulasiSimulator(); 
    }
}

function kalkulasiSimulator() {
    const inpKaryawan = document.getElementById('inpKaryawan');
    if (!inpKaryawan) return; 

    const jmlKaryawan = parseFloat(inpKaryawan.value) || 0;
    const gajiBulan = parseFloat(document.getElementById('inpGaji').value) || 0;
    const absensiPct = parseFloat(document.getElementById('inpAbsensi').value) || 0;
    const turnoverPct = parseFloat(document.getElementById('inpTurnover').value) || 0;
    const biayaRekrutmen = parseFloat(document.getElementById('inpRekrutmen').value) || 0;
    const simTurunTurnover = parseFloat(document.getElementById('sliderTurnover').value) || 0;

    const upahHarian = gajiBulan / 20; 
    const totalHariAbsen = (absensiPct / 100) * 240 * jmlKaryawan; 
    const lossProductivity = 0.5 * upahHarian;
    
    const CA = totalHariAbsen * (upahHarian + lossProductivity);
    const CT = ((turnoverPct / 100) * jmlKaryawan) * biayaRekrutmen;
    const CostOfInaction = CA + CT;

    const NTBaru = ((turnoverPct - simTurunTurnover) / 100) * jmlKaryawan;
    const CTBaru = (NTBaru > 0 ? NTBaru : 0) * biayaRekrutmen; 
    
    const totalPenghematan = (CT - CTBaru) + (CA * 0.10);

    let rekomendasiSim = (CA > CT) 
        ? "Analisis Simulator: Proporsi Cost of Absenteeism mendominasi beban kerugian operasional. Strategi utama harus difokuskan pada program Return-to-Work (RTW)." 
        : "Analisis Simulator: Tingkat pergantian karyawan (turnover) merupakan beban finansial tertinggi. Prioritaskan program Employee Assistance Program (EAP) untuk retensi.";

    if (document.getElementById('txtRekomendasi')) {
        document.getElementById('txtRekomendasi').innerText = rekomendasiSim;
        renderSimulasiChart(CostOfInaction, (CostOfInaction - totalPenghematan));
    }
}

function renderSimulasiChart(coiAwal, coiSimulasi) {
    const canvasId = 'simulasiChart';
    const canvasElement = document.getElementById(canvasId);
    if (!canvasElement || canvasElement.offsetParent === null) return;

    const ctx = canvasElement.getContext('2d');
    destroyChart(canvasId);

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Cost of Inaction (Tanpa Intervensi)', 'Proyeksi Biaya (Skenario)'],
            datasets: [{
                label: 'Nominal Biaya (Rp)',
                data: [coiAwal, coiSimulasi],
                backgroundColor: ['#FF7E54', '#08C7E1'],
                borderWidth: 0,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { font: { weight: 'normal', family: "'Poppins'" } } },
                x: { ticks: { font: { weight: 'normal', family: "'Poppins'" } }, grid: { display: false } }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    bodyFont: { weight: 'normal', family: "'Poppins'" },
                    titleFont: { weight: 'normal', family: "'Poppins'" },
                    callbacks: { label: function(c) { return ' ' + formatRupiah(c.raw); } }
                }
            }
        }
    });
}

// 8. INISIALISASI SAAT HALAMAN DIMUAT
window.onload = function() {
    fetchDatabaseData(); 
    fetchBehavioralData();
    
    setInterval(() => {
        fetchDatabaseData();
        fetchBehavioralData();
    }, 10000); 
};


// 9. LOGIKA EKSKLUSIF BEHAVIORAL TRACKER

// 1. Pastikan semua variabel global wajib diakhiri array kosong [] 
// agar tidak pernah dianggap 'undefined'
let currentMonth = 3; 
let currentYear = 2026;
let globalTrenHarian = []; 
let globalSemuaPresensi = []; 
let globalSemuaKaryawan = [];
let globalSemuaKinerja = [];

async function fetchBehavioralData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/v1/analitik-presensi');
        const result = await response.json();

        // 2. Trik Jitu: Menangkap data entah itu dibungkus 'result.data' atau langsung 'result'
        const bData = result.data ? result.data : result;

        if (bData) {
            // 3. Gunakan fallback || [] (Jika data tidak ada, otomatis jadikan array kosong)
            globalTrenHarian = bData.tren_harian || []; 
            globalSemuaPresensi = bData.semua_presensi || []; 
            globalSemuaKaryawan = bData.semua_karyawan || [];
            globalSemuaKinerja = bData.semua_kinerja || [];
            
            renderPieDinamis(); 
            renderHeatmap(); 
            renderTabelDinamis();
        }
    } catch (error) {
        console.error("[!] Gagal menarik data Behavioral:", error);
    }
}

// Fungsi: Navigasi Bulan
function ubahBulan(arah) {
    currentMonth += arah;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; } 
    else if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    
    renderHeatmap(); 
    renderPieDinamis(); 
    
    setTimeout(() => {
        renderTabelDinamis(); 
    }, 50); 
}

// Fungsi: Filter Data Pie Chart Sesuai Bulan
function renderPieDinamis() {
    let rekap = { 'Sakit': 0, 'Alpha': 0, 'Izin': 0, 'Cuti': 0 };

    let monthStr = (currentMonth + 1).toString().padStart(2, '0');
    let prefixCari = `${currentYear}-${monthStr}`;

    globalSemuaPresensi.forEach(item => {
        if (item.tanggal.startsWith(prefixCari)) {
            if (rekap[item.status_kehadiran] !== undefined) {
                rekap[item.status_kehadiran]++;
            } else {
                rekap[item.status_kehadiran] = 1;
            }
        }
    });

    renderPieRasio(rekap);
}

// 1. Render Pie Chart Rasio (Biarkan fungsi bawaannya tetap utuh)
function renderPieRasio(rasioData) {
    const canvasId = 'pieAbsensi';
    const ctx = document.getElementById(canvasId);
    if (!ctx || ctx.offsetParent === null) return;

    const sakit = rasioData['Sakit'] || 0;
    const alpha = rasioData['Alpha'] || 0;
    const izin = rasioData['Izin'] || 0; 
    const cuti = rasioData['Cuti'] || 0;

    destroyChart(canvasId);
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Sakit Mendadak', 'Tanpa Keterangan (Alpha)', 'Izin Pribadi', 'Cuti Terencana'],
            datasets: [{
                data: [sakit, alpha, izin, cuti],
                backgroundColor: ['#FF7E54', '#b71c1c', '#08C7E1', '#2ecc71'],
                borderWidth: 2, borderColor: '#ffffff'
            }]
        },
        options: {
            animation: false,
            responsive: true, 
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { font: { weight: 'normal', family: "'Poppins'" }, boxWidth: 12 } },
                tooltip: { bodyFont: { weight: 'normal' } }
            }
        }
    });
}

// 2. Render Calendar Heatmap (Bentuk Kalender Matriks)
function renderHeatmap() {
    const container = document.getElementById('calendarHeatmap');
    if (!container) return;

    // 1. Perbarui Label Teks Navigasi
    const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const label = document.getElementById('labelBulan');
    if (label) label.innerText = `${namaBulan[currentMonth]} ${currentYear}`;

    // 2. Pemetaan Data Mentah
    const mapTren = {};
    globalTrenHarian.forEach(item => { mapTren[item.tanggal] = item.jumlah_absen; });

    // 3. Logika Penentuan Hari Kalender
    const hariPertama = new Date(currentYear, currentMonth, 1).getDay(); 
    const jumlahHari = new Date(currentYear, currentMonth + 1, 0).getDate(); 

    let htmlGrid = '<div class="calendar-grid">';

    // Render Baris Nama Hari
    const hariArr = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    hariArr.forEach(hari => { htmlGrid += `<div class="cal-day-header">${hari}</div>`; });

    // Render Ruang Kosong (Offset Awal Bulan)
    for (let i = 0; i < hariPertama; i++) {
        htmlGrid += `<div class="cal-empty"></div>`;
    }

    // Render Kotak Tanggal
    for(let i = 1; i <= jumlahHari; i++) {
        // Format string tanggal "YYYY-MM-DD" untuk mencocokkan dengan format Database
        let monthStr = (currentMonth + 1).toString().padStart(2, '0');
        let dayStr = i.toString().padStart(2, '0');
        let tglPenuh = `${currentYear}-${monthStr}-${dayStr}`;
        let jumlahAbsen = mapTren[tglPenuh] || 0;
        
        let heatClass = 'heat-lvl-0';
        if(jumlahAbsen === 1) heatClass = 'heat-lvl-1';
        else if(jumlahAbsen === 2) heatClass = 'heat-lvl-2';
        else if(jumlahAbsen === 3) heatClass = 'heat-lvl-3';
        else if(jumlahAbsen > 3) heatClass = 'heat-lvl-4';

        htmlGrid += `
            <div class="heat-box ${heatClass}" title="Tanggal ${dayStr} ${namaBulan[currentMonth]}: ${jumlahAbsen} Karyawan Absen">
                ${i}
            </div>
        `;
    }
    
    htmlGrid += '</div>';
    container.innerHTML = htmlGrid;
}

// 3. Render Tabel Karyawan Individu
function renderTabelKaryawan(dataKaryawan) {
    const tbl = document.getElementById('tblKaryawanRawan');
    if (!tbl) return;
    
    let htmlContent = "";
    dataKaryawan.forEach(k => {
        let keparahan = k.total_absen >= 3 
            ? '<span class="badge-kritis">Perlu Intervensi (SP/EAP)</span>' 
            : '<span class="badge-aman">Batas Wajar</span>';
            
        htmlContent += `
        <tr>
            <td style="font-weight: 600; color: #01120A;">${k.nama_karyawan}</td>
            <td>${k.departemen}</td>
            <td>${k.status_aktif}</td>
            <td style="text-align: center; font-weight: bold;">${k.total_absen} Hari</td>
            <td>${keparahan}</td>
        </tr>`;
    });
    
    tbl.innerHTML = htmlContent;
}

// Fungsi Render Tabel Korelasi Dinamis
function renderTabelDinamis() {
    const tbl = document.getElementById('tblKaryawanRawan');
    if (!tbl) return;

    // Tentukan bulan apa yang sedang dilihat di layar (Format: YYYY-MM)
    let monthStr = (currentMonth + 1).toString().padStart(2, '0');
    let prefixCari = `${currentYear}-${monthStr}`;

    // 1. Hitung akumulasi absen (Sakit/Alpha) tiap karyawan di bulan tersebut
    let absenMap = {};
    globalSemuaPresensi.forEach(p => {
        if (p.tanggal.startsWith(prefixCari) && (p.status_kehadiran === 'Sakit' || p.status_kehadiran === 'Alpha')) {
            absenMap[p.id_karyawan] = (absenMap[p.id_karyawan] || 0) + 1;
        }
    });

    // 2. Ambil Skor KPI tiap karyawan di bulan tersebut (Hasil hitungan otomatis SQL)
    let kpiMap = {};
    globalSemuaKinerja.forEach(k => {
        if (k.periode_bulan === prefixCari) {
            kpiMap[k.id_karyawan] = k.skor_kpi;
        }
    });

    // 3. Gabungkan Data (Tambahkan Kalkulasi Kerugian Finansial)
    let dataTabel = [];
    globalSemuaKaryawan.forEach(emp => {
        let totalAbsen = absenMap[emp.id_karyawan] || 0;
        let skorKpi = kpiMap[emp.id_karyawan];

        // Hitung Cost of Absenteeism (Kerugian akibat absen)
        let kerugianRupiah = totalAbsen * (emp.gaji_harian || 0);

        if (totalAbsen > 0 || skorKpi !== undefined) {
            dataTabel.push({
                nama: emp.nama_karyawan, 
                dept: emp.departemen, 
                absen: totalAbsen, 
                kpi: skorKpi !== undefined ? skorKpi : '-',
                kerugian: kerugianRupiah
            });
        }
    });

    // Urutkan tabel: Skor KPI Bulanan dari Tertinggi ke Terendah (Descending)
    dataTabel.sort((a, b) => {
        let skorA = (a.kpi === '-') ? 0 : parseFloat(a.kpi);
        let skorB = (b.kpi === '-') ? 0 : parseFloat(b.kpi);
        return skorB - skorA; 
    });

    // 4. Render HTML dengan Analitik Preskriptif (Versi Strict Parsing / Anti-Bug)
    let htmlContent = "";
    dataTabel.forEach(k => {
        let absenNum = parseInt(k.absen) || 0; 
        let isKpiKosong = (k.kpi === '-' || k.kpi === '' || k.kpi == null || k.kpi === undefined);
        let kpiNum = isKpiKosong ? 100 : parseFloat(k.kpi); // Jika kosong, anggap 100 agar tidak memicu alarm error
        
        let isKpiBuruk = (!isKpiKosong && kpiNum < 75);
        let isAbsenBuruk = (absenNum >= 3);
        let keparahan = "";

        // Logika absen dan skor KPI
        if (isAbsenBuruk && isKpiBuruk) {
            keparahan = '<span class="badge-kritis" style="color: #e74c3c; font-weight: bold;">Kritis (Absen & Underperform)</span>';
        } else if (isAbsenBuruk) {
            keparahan = '<span class="badge-kritis" style="color: #e74c3c; font-weight: bold;">Risiko Kesehatan/Indisipliner</span>';
        } else if (isKpiBuruk) {
            keparahan = '<span class="badge-kritis" style="color: #e74c3c; font-weight: bold;">Presenteeism / Perlu Coaching</span>';
        } else if (isKpiKosong) {
            keparahan = '<span class="badge-menunggu" style="color: #f39c12; font-weight: bold;">Menunggu Evaluasi Kinerja</span>';
        } else {
            keparahan = '<span class="badge-aman" style="color: #2ecc71; font-weight: bold;">Aman & Produktif</span>';
        }

        let warnaKpi = isKpiBuruk 
            ? 'color: #e74c3c; font-weight: bold;' 
            : (isKpiKosong ? 'color: #95a5a6;' : 'color: #2ecc71; font-weight: bold;');

        htmlContent += `
        <tr>
            <td style="font-weight: 600; color: #01120A;">${k.nama}</td>
            <td>${k.dept}</td>
            <td style="text-align: center; font-weight: bold; ${isAbsenBuruk ? 'color:#e74c3c;' : ''}">${absenNum} Hari</td>
            <td style="text-align: center; ${warnaKpi}">${isKpiKosong ? '-' : kpiNum}</td>
            <td>${keparahan}</td>
        </tr>`;
    });
    
    tbl.innerHTML = htmlContent;
}


// Menghitung Risiko & Turnover
function hitungAnalitikDivisi(prefixCari) {
    let stats = {};

    // Inisialisasi
    globalSemuaKaryawan.forEach(emp => {
        if (!stats[emp.departemen]) {
            stats[emp.departemen] = {
                totalKaryawan: 0,
                totalAbsen: 0,
                totalKpi: 0,
                kpiCount: 0,
                karyawanKritis: 0 // Menghitung orang yang berisiko resign/burnout
            };
        }
        stats[emp.departemen].totalKaryawan++;

        // 2. Tarik Data Absen Individu Ini
        let absen = globalSemuaPresensi.filter(p => p.id_karyawan === emp.id_karyawan && p.tanggal.startsWith(prefixCari) && (p.status_kehadiran === 'Sakit' || p.status_kehadiran === 'Alpha')).length;
        stats[emp.departemen].totalAbsen += absen;

        // 3. Tarik Data KPI Individu Ini
        let kpiObj = globalSemuaKinerja.find(k => k.id_karyawan === emp.id_karyawan && k.periode_bulan === prefixCari);
        let kpiVal = kpiObj ? kpiObj.skor_kpi : 100; // Asumsi 100 jika data belum ada
        
        if (kpiObj) {
            stats[emp.departemen].totalKpi += kpiVal;
            stats[emp.departemen].kpiCount++;
        }

        // 4. Logika: Jika orang ini sering absen (>=3) ATAU kinerjanya skor KPI hancur (<75),
        // maka dia dihitung sebagai "Karyawan Kritis" yang berpotensi tinggi untuk Resign (Turnover).
        if (absen >= 3 || kpiVal < 75) {
            stats[emp.departemen].karyawanKritis++;
        }
    });

    // 5. Kalkulasi Persentase Akhir
    let hasilDivisi = [];
    for (let div in stats) {
        let data = stats[div];
        let avgKpi = data.kpiCount > 0 ? (data.totalKpi / data.kpiCount) : 100;
        
        // Rumus Prediksi Turnover = (Jumlah Orang Kritis / Total Orang di Divisi) * 100
        // Jika 0, kita beri nilai base wajar industri (misal 2.5%)
        let rasioTurnover = (data.karyawanKritis / data.totalKaryawan) * 100; 
        if (rasioTurnover === 0) rasioTurnover = (Math.random() * 3) + 1;
        hasilDivisi.push({
            divisi: div,
            rataKpi: avgKpi,
            totalAbsen: data.totalAbsen,
            prediksiTurnover: rasioTurnover
        });
    }

    return hasilDivisi;
}