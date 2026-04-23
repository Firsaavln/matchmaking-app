// src/lib/utils.ts

/**
 * Fungsi untuk export data JSON/Array of Objects ke format CSV
 * @param data - Data yang mau di-export (array of objects)
 * @param filename - Nama file pas didownload nanti
 */
export const exportCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    return alert('Data kosong, tidak ada yang bisa diekspor!');
  }

  // 1. Ambil Header (Key dari object pertama)
  const headers = Object.keys(data[0]).join(',');

  // 2. Format baris data
  const rows = data.map(obj => {
    return Object.values(obj)
      .map(val => {
        // Bersihkan data dari koma atau kutipan biar gak berantakan di Excel
        const cleanVal = String(val).replace(/"/g, '""');
        return `"${cleanVal}"`;
      })
      .join(',');
  }).join('\n');

  // 3. Gabungkan Header dan Baris
  const csvContent = `${headers}\n${rows}`;

  // 4. Proses Download menggunakan Blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Cleanup memory
  URL.revokeObjectURL(url);
};