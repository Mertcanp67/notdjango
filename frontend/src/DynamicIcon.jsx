import React from 'react';
import * as MuiIcons from '@mui/icons-material';
import LabelIcon from '@mui/icons-material/Label'; // Varsayılan ikon

// İkon isimlerini küçük harfe çevirerek bir harita oluşturuyoruz (örn: "Star" veya "star" çalışır)
const IconMap = Object.keys(MuiIcons).reduce((acc, key) => {
  acc[key.toLowerCase()] = MuiIcons[key];
  return acc;
}, {});

const DynamicIcon = ({ name, ...props }) => {
  // İkon adını küçük harfe çevirerek arama yapıyoruz
  const IconComponent = name ? IconMap[name.toLowerCase()] : null;

  // İkon bulunamazsa veya adı belirtilmemişse varsayılan ikonu kullan
  return IconComponent ? <IconComponent {...props} /> : <LabelIcon {...props} />;
};

export default DynamicIcon;
