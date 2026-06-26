import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { UserStackParamList } from "@/navigation/UserNavigator";
import { Show } from "@/http/showService";
import { AvaliacoesResponse } from "@/http/avaliacaoService";

export type UserShowDetailProps = NativeStackScreenProps<
  UserStackParamList,
  "UserShowDetail"
>;

export type ConfirmedBand = NonNullable<
  NonNullable<Show["Contract"]>["Band"]
>;

export type UserShowDetailViewModel = {
  show: Show;
  avaliacoes: AvaliacoesResponse | null;
  loading: boolean;
  showId: number;
  isFree: boolean;
  soldOut: boolean;
  artistName: string | null;
  artistId: number | null;
  confirmedBand: ConfirmedBand | null;
  venue: string;
  address: string;
  attendees: number;
  rating: number | null;
  genreColor: string;
  coverUrl: string | null;
  imageColor: string;
  goBack: () => void;
  goToCheckout: () => void;
  goToArtist: () => void;
  goToComments: () => void;
};
