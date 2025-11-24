import React from 'react';

const EtiketBulutu = ({ tags, onTagClick, selectedTag }) => {
  return (
    <div className="etiket-bulutu">
      <h4>Etiketler</h4>
      <div className="etiket-listesi">
        <button
          className={`etiket ${!selectedTag ? 'active' : ''}`}
          onClick={() => onTagClick(null)}
        >
          Tümü
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            className={`etiket ${selectedTag === tag ? 'active' : ''}`}
            onClick={() => onTagClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EtiketBulutu;
