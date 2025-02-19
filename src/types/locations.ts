
export interface Location {
  id: string;
  name: string;
  state: string;
  created_at: string;
}

export interface LocationInput {
  name: string;
  state: string;
}
