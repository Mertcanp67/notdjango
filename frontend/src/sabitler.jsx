export const CATEGORY_CHOICES = [
    { value: 'GEN', label: 'Genel' },
    { value: 'IMP', label: 'Önemli' },
    { value: 'TODO', label: 'Yapılacak' },
    { value: 'IDE', label: 'Fikir' },
];

export const CategoryMap = {
    GEN: { label: 'GENEL', color: '#8be9fd' },
    IMP: { label: 'ÖNEMLİ', color: '#ff5555' },
    TODO: { label: 'YAPILACAK', color: '#f1fa8c' },
    IDE: { label: 'FİKİR', color: '#50fa7b' }
};

export const LoadingSpinner = () => (
    <div className="loading-bar-container" style={{marginBottom: 20}}><div className="loading-bar"></div></div>
);