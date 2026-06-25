export interface UserEstablishmentProfileDisplay {
  genreLabel: string;
  genreColor: string;
  coverUrl: string | null;
  photosUrls: string[];
  addressLabel: string;
  nome: string;
  rating: number;
  abertura: string;
  fechamento: string;
  capacidade?: number;
  descricao: string;
  generos: string[];
  telefone: string;
}

export const EMPTY_DISPLAY: UserEstablishmentProfileDisplay = {
  genreLabel: "",
  genreColor: "#7B61FF",
  coverUrl: null,
  photosUrls: [],
  addressLabel: "",
  nome: "",
  rating: 0,
  abertura: "--:--",
  fechamento: "--:--",
  descricao: "",
  generos: [],
  telefone: "",
};
