
export const detectLanguage = (text: string): string => {
  const isHindi = /[\u0900-\u097F]/.test(text);
  const isTelugu = /[\u0C00-\u0C7F]/.test(text);
  const isTamil = /[\u0B80-\u0BFF]/.test(text);
  const isBengali = /[\u0980-\u09FF]/.test(text);
  
  if (isHindi) {
    return 'hi-IN';
  } else if (isTelugu) {
    return 'te-IN';
  } else if (isTamil) {
    return 'ta-IN';
  } else if (isBengali) {
    return 'bn-IN';
  } else {
    return 'en-IN';
  }
};
