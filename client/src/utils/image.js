export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const dataUrlToBlob = async (dataUrl) => {
  if (!dataUrl) {
    return null;
  }
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return blob;
};














