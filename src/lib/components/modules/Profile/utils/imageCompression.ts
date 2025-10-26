const MAX_IMAGE_SIZE = 300;
const COMPRESSION_QUALITY = 0.75;
const FILE_SIZE_THRESHOLD = 5 * 1024 * 1024;

export const compressAndConvertImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const compressed = resizeAndCompress(img);
        resolve(compressed);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const compressImageFromBase64 = (base64: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const compressed = resizeAndCompress(img);
      resolve(compressed);
    };
    img.src = base64;
  });
};

export const handleImageUpload = async (file: File): Promise<string> => {
  if (file.size > FILE_SIZE_THRESHOLD) {
    return compressAndConvertImage(file);
  } else {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = async (event) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          const compressed = await compressImageFromBase64(result);
          resolve(compressed);
        }
      };
      reader.readAsDataURL(file);
    });
  }
};

const resizeAndCompress = (img: HTMLImageElement): string => {
  const canvas = document.createElement("canvas");
  let { width, height } = img;

  if (width > height) {
    if (width > MAX_IMAGE_SIZE) {
      height = Math.round((height * MAX_IMAGE_SIZE) / width);
      width = MAX_IMAGE_SIZE;
    }
  } else {
    if (height > MAX_IMAGE_SIZE) {
      width = Math.round((width * MAX_IMAGE_SIZE) / height);
      height = MAX_IMAGE_SIZE;
    }
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/webp", COMPRESSION_QUALITY);
  }
  return "";
};
