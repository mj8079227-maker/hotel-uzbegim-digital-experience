import { Check } from 'lucide-react';
import type { Room } from '../types/hotel';
import { ResilientImage } from './ResilientImage';

interface RoomsSectionProps {
  rooms: Room[];
  onCheckAvailability: (roomId: string) => void;
}

export function formatRoomRate(room: Room): string {
  if (room.pricePerNight === null) {
    return 'Rate supplied by hotel management';
  }
  if (room.currency === 'UZS') {
    return `${new Intl.NumberFormat('en-US').format(room.pricePerNight)} UZS / night`;
  }
  return `$${new Intl.NumberFormat('en-US').format(room.pricePerNight)} / night`;
}

export function RoomsSection({ rooms, onCheckAvailability }: RoomsSectionProps) {
  return (
    <section id="rooms" className="border-t border-[#0F291E]/10 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7432]">
              Accommodations
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#0F291E] sm:text-4xl lg:text-5xl">
              Rooms &amp; Suites
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#526058]">
            Each room and suite is designed for quiet rest in Urgench. Nightly rates and stay terms are set and confirmed directly by Hotel Uzbegim management.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <article
              key={room.id}
              className="group flex flex-col border border-[#0F291E]/12 bg-[#FAF7F0] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#F1EBE0]">
                <ResilientImage
                  src={room.imageUrl}
                  alt={room.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  aspectClassName="h-full w-full"
                />
              </div>

              <div className="flex flex-1 flex-col p-6 lg:p-7">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#526058]">
                  <span>{room.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{room.bedConfiguration}</span>
                </div>

                <h3 className="mt-2 font-serif text-2xl font-medium text-[#0F291E]">
                  {room.name}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-[#17221B]/80">
                  {room.description}
                </p>

                <div className="mt-5 border-t border-[#0F291E]/10 pt-4 text-xs text-[#526058]">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-[#0F291E]">Guest Capacity</span>
                    <span className="tabular-nums">
                      Up to {room.capacityAdults} {room.capacityAdults === 1 ? 'Adult' : 'Adults'}
                      {room.capacityChildren > 0
                        ? `, ${room.capacityChildren} ${room.capacityChildren === 1 ? 'Child' : 'Children'}`
                        : ''}
                    </span>
                  </div>
                </div>

                <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-[#0F291E]/10 pt-4 text-xs text-[#17221B]/80">
                  {room.facilities.map((facility) => (
                    <li key={facility} className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#9A7432]" aria-hidden="true" />
                      <span className="truncate">{facility}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <div className="mb-4 border-t border-[#0F291E]/10 pt-4">
                    <span className="block text-xs uppercase tracking-wider text-[#526058]">
                      Tariff
                    </span>
                    <span className="mt-1 block font-serif text-xl font-medium tabular-nums text-[#0F291E]">
                      {formatRoomRate(room)}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={!room.available}
                    onClick={() => onCheckAvailability(room.id)}
                    className="flex min-h-[44px] w-full items-center justify-center rounded-sm bg-[#0F291E] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#FAF7F0] whitespace-nowrap transition-colors duration-150 hover:bg-[#193D2D] disabled:cursor-not-allowed disabled:bg-[#526058]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B38A3E]"
                  >
                    {room.available ? 'Check Availability' : 'Currently Unavailable'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
