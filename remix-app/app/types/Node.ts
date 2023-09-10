export type Node = {
  id: string;
  type: string;
  label: string;
  name: string;
  z: string;

  tab: string;

  selected: boolean;
};

export type NodesSortKeys = "id" | "type" | "tab" | "name";
