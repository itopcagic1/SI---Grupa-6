import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

// Dekodira JWT payload iz localStorage da bi dobio ulogu
function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

// Vrati true ako korisnik smije exportovati PDF
export function canExportPDF() {
  const user = getUserFromToken();
  return user?.uloga === 'ADMINISTRATOR' || user?.uloga === 'ORGANIZATOR';
}

// Interni helper – preuzme blob i triggeruje download u browseru
async function downloadBlob(url, params, filename) {
  const response = await axios.get(url, {
    params,
    headers: getAuthHeaders(),
    responseType: 'blob',
  });

  const blobUrl = URL.createObjectURL(
    new Blob([response.data], { type: 'application/pdf' }),
  );
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}

// Preuzmi PDF tabele za dato takmičenje
export async function downloadTabelaPDF(takmicenjeId) {
  await downloadBlob(
    `${API_URL}/pdf/tabela`,
    { takmicenjeId },
    'tabela.pdf',
  );
}

// Preuzmi PDF rezultata; datumOd i datumDo su opcionalni (format: 'YYYY-MM-DD')
export async function downloadRezultatiPDF(takmicenjeId, datumOd, datumDo) {
  const params = { takmicenjeId };
  if (datumOd) params.datumOd = datumOd;
  if (datumDo) params.datumDo = datumDo;

  await downloadBlob(
    `${API_URL}/pdf/rezultati`,
    params,
    'rezultati.pdf',
  );
}