export interface Person {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  participants: string[]; // Array of person IDs
}

export interface PersonSummary extends Person {
  total: number;
  items: ItemWithSplit[];
}

export interface ItemWithSplit extends Item {
  splitPrice: number;
}

export interface HostPaymentMethod {
  type: 'qrcode' | 'promptpay' | 'bank' | 'other';
  image: string | null;
  details: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AddPersonModalProps extends ModalProps {
  onAdd: (name: string) => void;
  editPerson?: Person | null;
}

export interface AddItemModalProps extends ModalProps {
  onAdd: (item: Omit<Item, 'id'>) => void;
  people: Person[];
  editItem?: Item | null;
}

export type ViewType = 'main' | 'summary';

export interface BillSummary {
  [personId: string]: {
    name: string;
    items: {
      name: string;
      price: number;
      totalPrice: number;
      sharedWith: number;
    }[];
    total: number;
  };
}