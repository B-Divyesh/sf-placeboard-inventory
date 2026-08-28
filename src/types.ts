export interface Place {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  archivedAt?: string;
}

export interface Item {
  id: string;
  name: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface Stock {
  itemId: string;
  placeId: string;
  quantity: number;
}

export interface Move {
  id: string;
  itemId: string;
  fromPlaceId: string | null;
  toPlaceId: string | null;
  quantity: number;
  note: string;
  at: string;
}

export interface InventoryData {
  version: 1;
  places: Place[];
  items: Item[];
  stocks: Stock[];
  moves: Move[];
}
