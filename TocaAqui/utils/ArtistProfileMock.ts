export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  description: string;
  instruments: string[];
}

export const DEFAULT_ARTIST: Artist = {
  id: "mock-id-000",
  name: "Alok",
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Alok_at_Story_Miami_2023.jpg/800px-Alok_at_Story_Miami_2023.jpg",
  rating: 4.8,
  description:
    "DJ e produtor musical brasileiro, conhecido mundialmente por seu sucesso 'Hear Me Now'.",
  instruments: ["DJ Controller", "Synthesizer", "Piano"],
};

export const ARTISTS_LIST: Artist[] = [
  DEFAULT_ARTIST,
  {
    id: "mock-id-001",
    name: "Vintage Culture",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Vintage_Culture_2019.jpg/600px-Vintage_Culture_2019.jpg",
    rating: 4.7,
    description:
      "Lukas Ruiz, conhecido como Vintage Culture, é um DJ e produtor brasileiro de música eletrônica.",
    instruments: ["Mixer", "Software"],
  },
  {
    id: "mock-id-003",
    name: "Gusttavo Lima",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Gusttavo_Lima_2019.jpg/600px-Gusttavo_Lima_2019.jpg",
    rating: 5.0,
    description:
      "Cantor e compositor de sertanejo universitário, conhecido por hits como Balada e Inventor dos Amores.",
    instruments: ["Violão", "Vocal"],
  },
];

export const DEFAULT_EVENT = {
  id: "mock-event-001",
  titulo_evento: "Sextou do João",
  descricao_evento:
    "Toda sexta, a partir das 19h, o Bar do João vira o ponto de encontro dos amantes do sertanejo. Música ao vivo, os maiores sucessos do gênero e aquela vibe de roça que só João sabe proporcionar! Cerveja gelada, cachaça da casa e muita animação! Não fique de fora, porque Sextou é dia de sertanejo!",
  data_show: new Date().toISOString(),
  horario_inicio: "19:00",
  horario_fim: "02:00",
  banda: {
    id: "mock-id-003",
    nome_banda: "Gusttavo Lima",
    imagem:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Gusttavo_Lima_2019.jpg/600px-Gusttavo_Lima_2019.jpg",
  },
};
