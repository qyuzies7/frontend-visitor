import React from "react";

function FormDetail() {
  const data = {
    nama: "Azida Kautsar",
    jenis: "Magang",
    tanggal: "08 Agustus 2025",
    stasiun: "St. Lempuyangan",
    dokumen: "dummy.pdf",
    status: "Menunggu",
    keterangan: "Mahasiswa magang jurusan Teknik Sipil UGM",
    kontak: "08123456789",
    email: "azida@email.com"
  };

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      padding: 24,
      maxWidth: 600,
      margin: "30px auto",
      boxShadow: "0 4px 12px rgba(0,0,0,0.09)"
    }}>
      <h2 style={{ fontFamily: "Poppins, 'Poppins Semibold', sans-serif", fontWeight: 600, marginBottom: 20 }}>Form Detail Visitor</h2>
      <div style={{marginBottom: 16}}>
        <strong style={{
          fontFamily: "Poppins, 'Poppins Semibold', sans-serif",
          color: "#474646"
        }}>Nama Pemohon:</strong>
        <span style={{
          fontFamily: "Poppins, 'Poppins Medium', sans-serif",
          color: "#474646",
          marginLeft: 12
        }}>{data.nama}</span>
      </div>
      <div style={{marginBottom: 16}}>
        <strong style={{
          fontFamily: "Poppins, 'Poppins Semibold', sans-serif",
          color: "#474646"
        }}>Jenis Kunjungan:</strong>
        <span style={{
          fontFamily: "Poppins, 'Poppins Medium', sans-serif",
          color: "#474646",
          marginLeft: 12
        }}>{data.jenis}</span>
      </div>
      <div style={{marginBottom: 16}}>
        <strong style={{
          fontFamily: "Poppins, 'Poppins Semibold', sans-serif",
          color: "#474646"
        }}>Tanggal Kunjungan:</strong>
        <span style={{
          fontFamily: "Poppins, 'Poppins Medium', sans-serif",
          color: "#474646",
          marginLeft: 12
        }}>{data.tanggal}</span>
      </div>
      <div style={{marginBottom: 16}}>
        <strong style={{
          fontFamily: "Poppins, 'Poppins Semibold', sans-serif",
          color: "#474646"
        }}>Stasiun Kunjungan:</strong>
        <span style={{
          fontFamily: "Poppins, 'Poppins Medium', sans-serif",
          color: "#474646",
          marginLeft: 12
        }}>{data.stasiun}</span>
      </div>
      <div style={{marginBottom: 16}}>
        <strong style={{
          fontFamily: "Poppins, 'Poppins Semibold', sans-serif",
          color: "#474646"
        }}>Keterangan:</strong>
        <span style={{
          fontFamily: "Poppins, 'Poppins Medium', sans-serif",
          color: "#474646",
          marginLeft: 12
        }}>{data.keterangan}</span>
      </div>
      <div style={{marginBottom: 16}}>
        <strong style={{
          fontFamily: "Poppins, 'Poppins Semibold', sans-serif",
          color: "#474646"
        }}>No. Telp:</strong>
        <span style={{
          fontFamily: "Poppins, 'Poppins Medium', sans-serif",
          color: "#474646",
          marginLeft: 12
        }}>{data.kontak}</span>
      </div>
      <div style={{marginBottom: 16}}>
        <strong style={{
          fontFamily: "Poppins, 'Poppins Semibold', sans-serif",
          color: "#474646"
        }}>Email:</strong>
        <span style={{
          fontFamily: "Poppins, 'Poppins Medium', sans-serif",
          color: "#474646",
          marginLeft: 12
        }}>{data.email}</span>
      </div>
      <div style={{marginBottom: 16}}>
        <strong style={{
          fontFamily: "Poppins, 'Poppins Semibold', sans-serif",
          color: "#474646"
        }}>Dokumen:</strong>
        <a href={"/dummy_files/" + data.dokumen} target="_blank" rel="noopener noreferrer" style={{
          fontFamily: "Poppins, 'Poppins Semibold', sans-serif",
          color: "#6A8BB0",
          marginLeft: 12,
          textDecoration: "underline"
        }}>Lihat Dokumen</a>
      </div>
    </div>
  );
}

export default FormDetail;