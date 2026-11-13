export async function readKopImageFile(file: File): Promise<string> {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Format gambar harus PNG, JPG, atau WebP.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // If <= 1.2 MB, keep original crisp dataUrl
      if (file.size <= 1.2 * 1024 * 1024) {
        resolve(dataUrl);
        return;
      }

      // Otherwise, scale down to max 2000px width to fit cleanly in localStorage while staying print-sharp
      const img = new window.Image();
      img.onload = () => {
        const maxW = 2000;
        const ratio = img.width > maxW ? maxW / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(outputType, 0.92));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

