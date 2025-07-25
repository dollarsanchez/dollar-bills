import { Person, Item, PersonSummary, ItemWithSplit } from '../types';

export const calculatePersonTotal = (personId: string, items: Item[]): number => {
  return items
    .filter(item => item.participants.includes(personId))
    .reduce((total, item) => {
      const participantCount = item.participants.length;
      return total + (item.price / participantCount);
    }, 0);
};

export const calculatePersonItems = (personId: string, items: Item[]): ItemWithSplit[] => {
  return items
    .filter(item => item.participants.includes(personId))
    .map(item => ({
      ...item,
      splitPrice: item.price / item.participants.length
    }));
};

export const generateSummary = (people: Person[], items: Item[]): PersonSummary[] => {
  return people.map(person => ({
    ...person,
    total: calculatePersonTotal(person.id, items),
    items: calculatePersonItems(person.id, items)
  }));
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const exportToCSV = (people: Person[], items: Item[]): string => {
  const summary = generateSummary(people, items);
  let csvContent = "ชื่อ,รายการ,ราคาต่อคน,รวม\n";
  
  summary.forEach(person => {
    person.items.forEach((item, index) => {
      const name = index === 0 ? person.name : '';
      const total = index === 0 ? formatCurrency(person.total) : '';
      csvContent += `${name},"${item.name}",${formatCurrency(item.splitPrice)},${total}\n`;
    });
    csvContent += "\n";
  });
  
  return csvContent;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};