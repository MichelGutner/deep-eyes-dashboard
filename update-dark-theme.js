import fs from 'fs';
import path from 'path';

const componentsDir = './src/components';
const files = fs.readdirSync(componentsDir).filter(file => file.endsWith('.tsx'));

const colorMappings = [
  // Headers and titles
  { from: 'text-2xl font-bold text-gray-900', to: 'text-2xl font-bold text-gray-900 dark:text-white' },
  { from: 'text-lg font-medium text-gray-900', to: 'text-lg font-medium text-gray-900 dark:text-white' },
  { from: 'text-gray-600', to: 'text-gray-600 dark:text-gray-400' },
  
  // Text colors
  { from: 'text-gray-900', to: 'text-gray-900 dark:text-white' },
  { from: 'text-gray-500', to: 'text-gray-500 dark:text-gray-400' },
  { from: 'text-gray-700', to: 'text-gray-700 dark:text-gray-300' },
  
  // Borders
  { from: 'border-gray-200', to: 'border-gray-200 dark:border-gray-700' },
  { from: 'border-gray-300', to: 'border-gray-300 dark:border-gray-600' },
  
  // Backgrounds
  { from: 'bg-gray-50', to: 'bg-gray-50 dark:bg-gray-800' },
  { from: 'bg-gray-100', to: 'bg-gray-100 dark:bg-gray-700' },
  
  // Form elements
  { from: 'bg-white', to: 'bg-white dark:bg-gray-700' },
  
  // Icons
  { from: 'text-gray-600', to: 'text-gray-600 dark:text-gray-400' },
  { from: 'text-gray-400', to: 'text-gray-400 dark:text-gray-500' },
  
  // Hover states
  { from: 'hover:bg-gray-50', to: 'hover:bg-gray-50 dark:hover:bg-gray-700' },
  { from: 'hover:text-gray-900', to: 'hover:text-gray-900 dark:hover:text-white' },
];

files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  colorMappings.forEach(mapping => {
    const regex = new RegExp(`\\b${mapping.from}\\b`, 'g');
    content = content.replace(regex, mapping.to);
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});

console.log('Dark theme updates completed!'); 