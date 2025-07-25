import { Person, Item, PersonSummary, ItemWithSplit } from "../types";

export const calculatePersonTotal = (
  personId: string,
  items: Item[]
): number => {
  return items
    .filter((item) => item.participants.includes(personId))
    .reduce((total, item) => {
      const participantCount = item.participants.length;
      return total + item.price / participantCount;
    }, 0);
};

export const calculatePersonOwed = (
  personId: string,
  items: Item[]
): number => {
  // Calculate how much this person owes others
  let owes = 0;

  items.forEach((item) => {
    if (item.participants.includes(personId)) {
      const shareAmount = item.price / item.participants.length;

      // If someone else paid, this person owes them
      if (item.paidBy && item.paidBy !== personId) {
        owes += shareAmount;
      }
    }
  });

  return owes;
};

export const calculatePersonLent = (
  personId: string,
  items: Item[]
): number => {
  // Calculate how much this person lent to others
  let lent = 0;

  items.forEach((item) => {
    if (item.paidBy === personId) {
      const shareAmount = item.price / item.participants.length;
      const othersCount = item.participants.filter(
        (id) => id !== personId
      ).length;
      lent += shareAmount * othersCount;
    }
  });

  return lent;
};

export const calculateNetBalance = (
  personId: string,
  items: Item[]
): number => {
  const lent = calculatePersonLent(personId, items);
  const owes = calculatePersonOwed(personId, items);
  return lent - owes;
};

export const calculatePersonItems = (
  personId: string,
  items: Item[]
): ItemWithSplit[] => {
  return items
    .filter((item) => item.participants.includes(personId))
    .map((item) => ({
      ...item,
      splitPrice: item.price / item.participants.length,
    }));
};

export const generateSummary = (
  people: Person[],
  items: Item[]
): PersonSummary[] => {
  return people.map((person) => ({
    ...person,
    total: calculatePersonTotal(person.id, items),
    items: calculatePersonItems(person.id, items),
    netBalance: calculateNetBalance(person.id, items),
    owes: calculatePersonOwed(person.id, items),
    lent: calculatePersonLent(person.id, items),
  }));
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const exportToCSV = (people: Person[], items: Item[]): string => {
  const summary = generateSummary(people, items);
  let csvContent = "ชื่อ,รายการ,ราคาต่อคน,สุทธิ,เงินให้ยืม,เงินที่ต้องจ่าย\n";

  summary.forEach((person) => {
    person.items.forEach((item, index) => {
      const name = index === 0 ? person.name : "";
      const netBalance =
        index === 0 ? formatCurrency(person.netBalance || 0) : "";
      const lent = index === 0 ? formatCurrency(person.lent || 0) : "";
      const owes = index === 0 ? formatCurrency(person.owes || 0) : "";
      csvContent += `${name},"${item.name}",${formatCurrency(
        item.splitPrice
      )},${netBalance},${lent},${owes}\n`;
    });
    csvContent += "\n";
  });

  return csvContent;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};