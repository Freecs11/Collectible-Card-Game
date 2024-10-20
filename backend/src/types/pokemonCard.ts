export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  hp: string;
  types: string[];
  rarity: string;
  images: {
    small: string;
    large: string;
  };
  set: {
    id: string;
    name: string;
  };
}
