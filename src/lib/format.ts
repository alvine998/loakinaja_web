export const formatRupiah = (value: number) =>
  `Rp ${value.toLocaleString('id-ID')}`;

export const formatThousandsInput = (value: string) => {
  const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseThousandsInput = (value: string) =>
  Number(value.replace(/\D/g, ''));

export const formatCountdown = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export const formatPaymentCode = (code: string) =>
  code.replace(/(.{4})/g, '$1 ').trim();

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
