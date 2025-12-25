export const CATEGORY_CHOICES = [
    { value: 'GEN', label: 'Genel' },
    { value: 'IMP', label: 'Önemli' },
    { value: 'TODO', label: 'Yapılacak' },
    { value: 'IDE', label: 'Fikir' },
];

export const CategoryMap = {
    GEN: { label: 'GENEL', color: 'var(--primary)' },
    IMP: { label: 'ÖNEMLİ', color: '#e5484d' },
    TODO: { label: 'YAPILACAK', color: '#f9a825' },
    IDE: { label: 'FİKİR', color: '#8e44ad' }
};

export const LoadingSpinner = () => (
    <div className="loading-bar-container" style={{marginBottom: 20}}><div className="loading-bar"></div></div>
);