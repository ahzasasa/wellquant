# app.py - API Controller WellQuant
from flask import Flask, jsonify
from flask_cors import CORS

# Mengimpor semua fungsi dari modul database
from database import init_db, ambil_metrik_dasbor, ambil_data_behavioral

app = Flask(__name__)
CORS(app) 

# Titik Akhir 1: Dasbor Eksekutif & Kalkulator
@app.route('/api/v1/metrik-sdm', methods=['GET'])
def get_hr_metrics():
    try:
        data_metrik = ambil_metrik_dasbor()
        return jsonify({"status": "success", "data": data_metrik}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Titik Akhir 2: Behavioral Tracker
@app.route('/api/v1/analitik-presensi', methods=['GET'])
def get_behavioral_data():
    try:
        data_behavioral = ambil_data_behavioral()
        return jsonify({"status": "success", "data": data_behavioral}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("[*] Menginisialisasi pemeriksaan skema basis data...")
    init_db()
    print("[*] Menjalankan server API WellQuant pada port 5000...")
    app.run(debug=True, port=5000)