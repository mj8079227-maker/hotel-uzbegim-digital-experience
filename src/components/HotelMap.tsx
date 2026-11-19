import { useEffect, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ExternalLink, MapPin } from 'lucide-react';

interface HotelMapProps {
  hotelName: string;
  address: string;
  telephone: string;
}

interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface ResolvedPlace {
  location: LatLngLiteral;
  formattedAddress: string;
  displayName: string;
}

function HotelLocationContent({ hotelName, address, telephone }: HotelMapProps) {
  const placesLib = useMapsLibrary('places');
  const [resolved, setResolved] = useState<ResolvedPlace | null>(null);
  const [lookupState, setLookupState] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(true);

  useEffect(() => {
    if (!placesLib) return;

    let cancelled = false;

    async function locateHotel() {
      try {
        const { places } = await placesLib!.Place.searchByText({
          textQuery: `${hotelName}, ${address}`,
          fields: ['displayName', 'formattedAddress', 'location'],
        });

        let match = places?.[0];
        if (!match || !match.location) {
          const fallbackSearch = await placesLib!.Place.searchByText({
            textQuery: address,
            fields: ['displayName', 'formattedAddress', 'location'],
          });
          match = fallbackSearch.places?.[0];
        }

        if (!cancelled && match?.location) {
          setResolved({
            location: {
              lat: match.location.lat(),
              lng: match.location.lng(),
            },
            formattedAddress: match.formattedAddress || address,
            displayName: match.displayName || hotelName,
          });
          setLookupState('ready');
        } else if (!cancelled) {
          setLookupState('fallback');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('OVER_QUERY_LIMIT') || msg.includes('429')) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        if (!cancelled) {
          setLookupState('fallback');
        }
      }
    }

    locateHotel();
    return () => {
      cancelled = true;
    };
  }, [placesLib, hotelName, address]);

  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${hotelName}, ${address}`
  )}`;

  if (lookupState === 'loading') {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-sm border border-[#0F291E]/15 bg-[#F1EBE0] p-6 text-center">
        <MapPin className="mb-3 h-7 w-7 text-[#0F291E]" />
        <p className="font-serif text-xl text-[#0F291E]">Locating {hotelName}</p>
        <p className="mt-1 text-sm text-[#526058]">{address}</p>
      </div>
    );
  }

  if (lookupState === 'fallback' || !resolved) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-sm border border-[#0F291E]/15 bg-[#F1EBE0] p-8 text-center">
        <MapPin className="mb-4 h-8 w-8 text-[#B38A3E]" />
        <h4 className="font-serif text-2xl font-medium text-[#0F291E]">{hotelName}</h4>
        <p className="mt-2 max-w-sm text-sm text-[#17221B]/80">{address}</p>
        <p className="mt-1 text-sm tabular-nums text-[#526058]">{telephone}</p>
        <a
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-sm bg-[#0F291E] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FAF7F0] transition-colors hover:bg-[#193D2D]"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-sm border border-[#0F291E]/15">
      <GoogleMap
        defaultCenter={resolved.location}
        defaultZoom={15}
        mapId="DEMO_MAP_ID"
        gestureHandling="cooperative"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
      >
        <AdvancedMarker
          ref={markerRef}
          position={resolved.location}
          onClick={() => setInfoOpen((prev) => !prev)}
          title={hotelName}
        >
          <Pin background="#0F291E" borderColor="#B38A3E" glyphColor="#FAF7F0" scale={1.15} />
        </AdvancedMarker>

        {infoOpen && marker && (
          <InfoWindow anchor={marker} onCloseClick={() => setInfoOpen(false)} maxWidth={260}>
            <div className="p-1 text-[#17221B]">
              <p className="font-serif text-base font-semibold text-[#0F291E]">{hotelName}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#526058]">{address}</p>
              <p className="mt-1 text-xs font-medium tabular-nums text-[#0F291E]">{telephone}</p>
              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#B38A3E] underline"
              >
                <span>Directions</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export function HotelMap({ hotelName, address, telephone }: HotelMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${hotelName}, ${address}`
  )}`;

  if (!apiKey) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-sm border border-[#0F291E]/15 bg-[#F1EBE0] p-8 text-center">
        <MapPin className="mb-4 h-8 w-8 text-[#B38A3E]" />
        <h4 className="font-serif text-2xl font-medium text-[#0F291E]">{hotelName}</h4>
        <p className="mt-2 text-sm text-[#17221B]/80">{address}</p>
        <a
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-sm bg-[#0F291E] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FAF7F0] hover:bg-[#193D2D]"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['marker', 'places']} language="en" region="UZ">
      <HotelLocationContent hotelName={hotelName} address={address} telephone={telephone} />
    </APIProvider>
  );
}
