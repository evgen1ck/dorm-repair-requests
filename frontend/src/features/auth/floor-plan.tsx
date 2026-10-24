import { cn } from "@/lib/utils";

const ROOM_WIDTH = 72;
const ROOM_HEIGHT = 88;
const CORRIDOR_HEIGHT = 48;
const ROOMS_PER_ROW = 8;
const DOOR_WIDTH = 16;
const FIRST_ROOM_NUMBER = 101;
const ACTIVE_ROOM_NUMBER = 105;

const WIDTH = ROOM_WIDTH * ROOMS_PER_ROW;
const LOWER_ROW_TOP = ROOM_HEIGHT + CORRIDOR_HEIGHT;
const HEIGHT = LOWER_ROW_TOP + ROOM_HEIGHT;

const rooms = Array.from({ length: ROOMS_PER_ROW * 2 }, (_, index) => {
  const column = index % ROOMS_PER_ROW;
  const upperRow = index < ROOMS_PER_ROW;
  return {
    number: FIRST_ROOM_NUMBER + index,
    x: column * ROOM_WIDTH,
    y: upperRow ? 0 : LOWER_ROW_TOP,
    doorY: upperRow ? ROOM_HEIGHT : LOWER_ROW_TOP,
  };
});

const activeRoom = rooms.find((room) => room.number === ACTIVE_ROOM_NUMBER)!;
const markerX = activeRoom.x + ROOM_WIDTH / 2;
const markerY = activeRoom.y + ROOM_HEIGHT / 2 + 6;

export function FloorPlan({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox={`-1 -1 ${WIDTH + 2} ${HEIGHT + 2}`}
      className={cn("text-brand-panel-line", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {rooms.map((room) => (
        <g key={room.number}>
          <rect
            x={room.x}
            y={room.y}
            width={ROOM_WIDTH}
            height={ROOM_HEIGHT}
            className="fill-transparent transition-[fill] duration-200 ease-(--ease-out-quart) hover:fill-brand-panel-foreground/6"
          />
          <line
            x1={room.x + ROOM_WIDTH / 2 - DOOR_WIDTH / 2}
            x2={room.x + ROOM_WIDTH / 2 + DOOR_WIDTH / 2}
            y1={room.doorY}
            y2={room.doorY}
            strokeWidth="4"
            stroke="var(--brand-panel)"
          />
          <text
            x={room.x + 8}
            y={room.y + 18}
            stroke="none"
            className="pointer-events-none fill-brand-panel-muted/70 font-mono text-[10px] tabular-nums"
          >
            {room.number}
          </text>
        </g>
      ))}
      <line x1={0} x2={WIDTH} y1={ROOM_HEIGHT} y2={ROOM_HEIGHT} />
      <line x1={0} x2={WIDTH} y1={LOWER_ROW_TOP} y2={LOWER_ROW_TOP} />
      <g className="pointer-events-none" stroke="none">
        <circle
          cx={markerX}
          cy={markerY}
          r={11}
          className="origin-center fill-brand-panel-accent/30 animate-marker-pulse [transform-box:fill-box] motion-reduce:animate-none"
        />
        <circle cx={markerX} cy={markerY} r={3.5} className="fill-brand-panel-accent" />
      </g>
    </svg>
  );
}
