import React, { useState } from 'react';

// Etiketlere tutarlı ama rastgele renkler atamak için bir yardımcı fonksiyon
const stringToHslColor = (str, s, l) => {
  if (!str) return `hsl(0, 0%, 80%)`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, ${s}%, ${l}%)`;
};

export const TagInput = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState('');

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const addTags = (newTags) => {
    const validTags = newTags
      .split(/[\s,]+/) // Boşluk veya virgülle ayır
      .map(tag => tag.trim().toLowerCase()) // Küçük harfe çevir ve boşlukları temizle
      .filter(tag => tag.length > 0 && !tags.includes(tag)); // Boş ve tekrar eden etiketleri engelle
    
    if (validTags.length > 0) {
      setTags([...tags, ...validTags]);
    }
    setInputValue(''); // Eklendikten sonra input'u temizle
  };

  const handleKeyDown = (e) => {
    // Enter, boşluk veya virgül tuşuna basıldığında etiket ekle
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      addTags(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Input boşken backspace'e basılırsa son etiketi sil
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="tag-input-container">
      <label>Etiketler (boşluk veya virgülle ayırın)</label>
      <div className="tag-input">
        <ul className="tag-list">
          {tags.map((tag, index) => (
            <li key={index} className="tag-item" style={{ backgroundColor: stringToHslColor(tag, 50, 30), color: stringToHslColor(tag, 50, 85) }}>
              {tag}
              <button type="button" className="remove-tag" onClick={() => removeTag(index)}>×</button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Yeni etiket ekle..."
        />
      </div>
    </div>
  );
};
