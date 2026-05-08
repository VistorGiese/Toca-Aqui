interface NominatimResult {
  lat: string;
  lon: string;
}

interface Coordenadas {
  latitude: number;
  longitude: number;
}

export async function geocodificarEndereco(
  rua: string,
  numero: string,
  cidade: string,
  estado: string,
  cep?: string
): Promise<Coordenadas | null> {
  const query = `${rua}, ${numero}, ${cidade}, ${estado}, Brasil`;

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'br');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'TocaAqui/1.0 (tcc@tocaaqui.com.br)',
        'Accept-Language': 'pt-BR',
      },
    });

    if (!response.ok) return null;

    const results = await response.json() as NominatimResult[];

    if (!results.length) return null;

    return {
      latitude: parseFloat(results[0].lat),
      longitude: parseFloat(results[0].lon),
    };
  } catch {
    return null;
  }
}
