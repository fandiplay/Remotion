/**
 * sitara.tsx — Rumah Penasaran
 * "Anatomi Ketidaktahuan dan Konstruksi Logika Berpikir" (45 detik, 1080x1920, 30 fps)
 *
 * Satu file, tanpa aset eksternal: semua karakter, latar, dan efek digambar dengan SVG.
 * Tanpa voice over / audio. Subtitle + penanda scene ada di script ini.
 *
 * Daftarkan di Root.tsx:
 *   import {Sitara, SITARA} from './sitara';
 *   <Composition id={SITARA.id} component={Sitara}
 *     durationInFrames={SITARA.durationInFrames} fps={SITARA.fps}
 *     width={SITARA.width} height={SITARA.height} />
 *
 * PENANDA / CARA EDIT CEPAT
 *  - SCENES  : daftar 7 scene + waktu mulai/selesai (detik) -> bagian "PENANDA SCENE"
 *  - CUES    : semua subtitle + waktunya (detik)            -> bagian "SUBTITLE"
 *              *kata* = kuning (kata kunci), ~kata~ = merah muda (bahaya/cemas)
 *  - SHOW_MARKERS = true -> menampilkan label scene + timecode kecil di pojok (untuk debug)
 */
import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, spring, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Poppins';

const {fontFamily: POPPINS} = loadFont('normal', {
	weights: ['500', '600', '800'],
	subsets: ['latin'],
});

/* ============================================================================
 * KONFIGURASI
 * ========================================================================== */
const FPS = 30;
const W = 1080;
const H = 1920;
const OVERLAP = 8; // frame crossfade antar scene
const SHOW_MARKERS = false;

export const SITARA = {
	id: 'Sitara',
	fps: FPS,
	width: W,
	height: H,
	durationInFrames: 45 * FPS, // 1350
} as const;

// Palet resmi Rumah Penasaran (jangan ditambah). Merah muda = hanya makna buruk/bahaya.
const C = {
	indigo: '#1E1B4B',
	purple: '#4C1D95',
	yellow: '#FBBF24',
	white: '#FFFFFF',
	pink: '#FB7185',
	ink: '#0B0A24', // garis kartun / pupil
};

// Warna ilustrasi dunia historis (hanya untuk karakter & properti, bukan teks/UI)
const ART = {
	skinA: '#F1C9A5',
	skinB: '#C98F63',
	skinC: '#8D5A3B',
	cream: '#E9DDC3',
	rust: '#9A4A2B',
	moss: '#5B6B3A',
	dusk: '#4F6D9A',
	wine: '#7A2E3E',
	mustard: '#C99A2E',
	sitara: '#E8803A',
	teal: '#2F6F73',
	steel: '#CBD5E1',
	steelD: '#8A97AD',
	wood: '#6B4226',
	woodL: '#9A683B',
	stone: '#2E2A66',
	fire: '#F97316',
};

/* ============================================================================
 * HELPER ANIMASI
 * ========================================================================== */
const t = (s: number) => Math.round(s * FPS);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const ramp = (
	f: number,
	a: number,
	b: number,
	from = 0,
	to = 1,
	easing: (n: number) => number = Easing.out(Easing.cubic),
) =>
	interpolate(f, [a, b], [from, to], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing,
	});
const inOut = Easing.inOut(Easing.cubic);
const pop = (f: number, delay = 0, damping = 12, stiffness = 170) =>
	spring({frame: Math.max(0, f - delay), fps: FPS, config: {damping, stiffness, mass: 0.7}});
const shake = (f: number, start: number, dur: number, amp: number) => {
	const k = f - start;
	if (k < 0 || k > dur) return 0;
	return Math.sin(k * 2.9) * amp * (1 - k / dur);
};

const sparklePath = (x: number, y: number, r: number) =>
	`M${x} ${y - r} L${x + r * 0.28} ${y - r * 0.28} L${x + r} ${y} L${x + r * 0.28} ${y + r * 0.28} L${x} ${y + r} L${x - r * 0.28} ${y + r * 0.28} L${x - r} ${y} L${x - r * 0.28} ${y - r * 0.28} Z`;

/* ============================================================================
 * TEKS BERWARNA  (*kuning*  ~merah muda~)
 * ========================================================================== */
const RichText: React.FC<{text: string}> = ({text}) => {
	const parts = text.split(/(\*[^*]+\*|~[^~]+~)/g).filter(Boolean);
	return (
		<>
			{parts.map((p, i) => {
				if (p.startsWith('*'))
					return (
						<span key={i} style={{color: C.yellow}}>
							{p.slice(1, -1)}
						</span>
					);
				if (p.startsWith('~'))
					return (
						<span key={i} style={{color: C.pink}}>
							{p.slice(1, -1)}
						</span>
					);
				return <span key={i}>{p}</span>;
			})}
		</>
	);
};

/* ============================================================================
 * KAMERA (zoom/pan dunia 1080x1920, titik fokus dipetakan ke (540,760))
 * ========================================================================== */
const Camera: React.FC<{
	s: number;
	fx: number;
	fy: number;
	sx?: number;
	sy?: number;
	children: React.ReactNode;
}> = ({s, fx, fy, sx = 0, sy = 0, children}) => (
	<AbsoluteFill
		style={{
			transform: `translate(${540 - fx * s + sx}px, ${760 - fy * s + sy}px) scale(${s})`,
			transformOrigin: '0 0',
		}}
	>
		{children}
	</AbsoluteFill>
);

/* ============================================================================
 * LATAR 1 — DAPUR ABAD PERTENGAHAN (dipakai ulang di scene 1-3)
 * Lantai di y=1150. Rak di x480-780 (tempat seng), jendela, tungku, meja.
 * ========================================================================== */
const KitchenBG: React.FC = () => {
	const f = useCurrentFrame();
	const fl = 1 + Math.sin(f / 2.1) * 0.07 + Math.sin(f / 3.7) * 0.05;
	const flame = (cx: number, base: number, h: number, fill: string, k: number) => {
		const hh = h * (fl + Math.sin(f / 2 + k) * 0.06);
		return (
			<path
				d={`M${cx - 28} ${base} C${cx - 34} ${base - hh * 0.5} ${cx - 6} ${base - hh * 0.6} ${cx} ${base - hh} C${cx + 8} ${base - hh * 0.6} ${cx + 36} ${base - hh * 0.4} ${cx + 28} ${base} Z`}
				fill={fill}
			/>
		);
	};
	const planks: number[] = [];
	for (let i = 0; i < 9; i++) planks.push(1150 + i * i * 9 + i * 14);
	const rays: number[] = [];
	for (let x = -700; x <= 1800; x += 230) rays.push(x);
	return (
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<linearGradient id="kWall" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#15123A" />
					<stop offset="1" stopColor="#35207A" />
				</linearGradient>
				<linearGradient id="kFloor" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#2A1B5C" />
					<stop offset="1" stopColor="#120F33" />
				</linearGradient>
				<linearGradient id="kSky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={C.indigo} />
					<stop offset="1" stopColor="#5B2AA8" />
				</linearGradient>
				<radialGradient id="kFire" cx="0.18" cy="0.62" r="0.7">
					<stop offset="0" stopColor={C.yellow} stopOpacity={0.42 * fl} />
					<stop offset="1" stopColor={C.yellow} stopOpacity="0" />
				</radialGradient>
				<pattern id="kBrick" width="140" height="70" patternUnits="userSpaceOnUse">
					<path d="M0 0H140M0 35H140M0 0V35M70 35V70" stroke="#fff" strokeOpacity=".07" strokeWidth="3" fill="none" />
				</pattern>
			</defs>
			{/* dinding */}
			<rect width={W} height={1160} fill="url(#kWall)" />
			<rect width={W} height={1160} fill="url(#kBrick)" />
			{/* jendela malam */}
			<path d="M790 700 L790 440 A110 110 0 0 1 1010 440 L1010 700 Z" fill="url(#kSky)" stroke={ART.stone} strokeWidth="18" />
			<circle cx="930" cy="430" r="30" fill={C.yellow} />
			<circle cx="944" cy="422" r="27" fill="#4A2A9A" />
			{[[840, 400], [880, 470], [960, 510], [830, 560], [990, 600]].map(([x, y], i) => (
				<path key={i} d={sparklePath(x, y, 7)} fill={C.white} opacity={0.5 + 0.4 * Math.sin(f / 10 + i)} />
			))}
			<path d="M900 330 V700 M790 570 H1010" stroke={ART.wood} strokeWidth="10" />
			<rect x="772" y="696" width="256" height="18" rx="6" fill={ART.stone} />
			{/* tungku */}
			<path d="M120 330 L280 330 L350 660 L50 660 Z" fill={ART.stone} stroke={C.ink} strokeWidth="6" />
			<rect x="20" y="650" width="360" height="500" rx="18" fill={ART.stone} stroke={C.ink} strokeWidth="6" />
			<path d="M70 1150 L70 860 A130 130 0 0 1 330 860 L330 1150 Z" fill="#0A0820" />
			<ellipse cx="200" cy="1128" rx="110" ry="16" fill={ART.wood} />
			<g opacity={0.95}>
				{flame(150, 1118, 150, ART.fire, 0)}
				{flame(250, 1118, 130, ART.fire, 2)}
				{flame(200, 1118, 200, C.yellow, 1)}
				{flame(200, 1118, 100, C.white, 3)}
			</g>
			<path d="M200 860 V935" stroke={C.ink} strokeWidth="6" />
			<path d="M140 990 A60 55 0 0 0 260 990 Z" fill="#3A3A52" stroke={C.ink} strokeWidth="6" />
			<rect x="132" y="978" width="136" height="18" rx="8" fill="#55556E" stroke={C.ink} strokeWidth="5" />
			{/* rel gantung + peralatan */}
			<path d="M410 420 H770" stroke={ART.woodL} strokeWidth="10" strokeLinecap="round" />
			{[450, 520, 590, 660, 730].map((x, i) => (
				<g key={x} transform={`rotate(${Math.sin(f / 30 + i) * 1.2} ${x} 420)`}>
					<path d={`M${x} 420 V${470 + (i % 2) * 20}`} stroke={C.ink} strokeWidth="5" />
					{i % 2 === 0 ? (
						<>
							<path d={`M${x} 470 V520`} stroke={ART.steelD} strokeWidth="7" strokeLinecap="round" />
							<circle cx={x} cy="534" r="20" fill={ART.steelD} stroke={C.ink} strokeWidth="5" />
						</>
					) : (
						<>
							<circle cx={x} cy="520" r="30" fill={ART.steelD} stroke={C.ink} strokeWidth="5" />
							<circle cx={x} cy="520" r="18" fill="#6B778C" />
						</>
					)}
				</g>
			))}
			{/* rak tempat seng */}
			<rect x="480" y="556" width="310" height="18" rx="5" fill={ART.woodL} stroke={C.ink} strokeWidth="5" />
			<path d="M500 574 L530 620 M770 574 L740 620" stroke={ART.wood} strokeWidth="9" />
			{[[520, 50, ART.rust], [585, 36, ART.mustard], [640, 44, ART.dusk]].map(([x, h, col], i) => (
				<g key={i}>
					<rect x={Number(x) - 20} y={556 - Number(h)} width="40" height={h as number} rx="9" fill={col as string} stroke={C.ink} strokeWidth="4" />
					<rect x={Number(x) - 14} y={556 - Number(h) - 9} width="28" height="11" rx="4" fill={ART.cream} stroke={C.ink} strokeWidth="3" />
				</g>
			))}
			{/* meja */}
			<rect x="800" y="940" width="290" height="34" rx="8" fill={ART.woodL} stroke={C.ink} strokeWidth="6" />
			<rect x="830" y="974" width="34" height="176" fill={ART.wood} stroke={C.ink} strokeWidth="5" />
			<rect x="1030" y="974" width="34" height="176" fill={ART.wood} stroke={C.ink} strokeWidth="5" />
			<path d="M850 940 A44 40 0 0 1 938 940 Z" fill={ART.cream} stroke={C.ink} strokeWidth="5" />
			<rect x="985" y="888" width="50" height="52" rx="14" fill="#B9784A" stroke={C.ink} strokeWidth="5" />
			{/* lantai */}
			<rect y="1150" width={W} height={770} fill="url(#kFloor)" />
			{planks.map((y) => (
				<path key={y} d={`M0 ${y} H${W}`} stroke="#fff" strokeOpacity=".07" strokeWidth="3" />
			))}
			{rays.map((x) => (
				<path key={x} d={`M${540 + (x - 540) * 0.5} 1150 L${x} 1920`} stroke="#fff" strokeOpacity=".05" strokeWidth="3" />
			))}
			<rect width={W} height={H} fill="url(#kFire)" />
		</svg>
	);
};

/* ============================================================================
 * LATAR 2 — RUANG PENALARAN (abstrak, dipakai di scene 4-7)
 * ========================================================================== */
const ReasonBG: React.FC<{glow?: number}> = ({glow = 1}) => {
	const f = useCurrentFrame();
	return (
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<linearGradient id="rBg" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={C.indigo} />
					<stop offset="0.65" stopColor="#2A1670" />
					<stop offset="1" stopColor={C.purple} />
				</linearGradient>
				<radialGradient id="rGlow" cx="0.5" cy="0.4" r="0.6">
					<stop offset="0" stopColor={C.yellow} stopOpacity={0.2 * glow} />
					<stop offset="1" stopColor={C.yellow} stopOpacity="0" />
				</radialGradient>
				<pattern id="rGrid" width="90" height="90" patternUnits="userSpaceOnUse">
					<path d="M90 0H0V90" stroke="#fff" strokeOpacity=".05" strokeWidth="2" fill="none" />
				</pattern>
			</defs>
			<rect width={W} height={H} fill="url(#rBg)" />
			<rect width={W} height={H} fill="url(#rGrid)" />
			<rect width={W} height={H} fill="url(#rGlow)" />
			{Array.from({length: 28}).map((_, i) => {
				const x = (i * 337) % W;
				const y = H - ((i * 211 + f * (0.5 + (i % 4) * 0.25)) % H);
				return <circle key={i} cx={x} cy={y} r={2 + (i % 3) * 1.5} fill={C.yellow} opacity={0.12 + 0.14 * Math.sin(f / 14 + i)} />;
			})}
		</svg>
	);
};

/* ============================================================================
 * KEPO — maskot (bohlam kuning, antena ?)
 * ekspresi: penasaran | kaget | mikir | paham
 * ========================================================================== */
type Expr = 'penasaran' | 'kaget' | 'mikir' | 'paham';
const Kepo: React.FC<{
	x: number;
	y: number;
	w: number;
	expr: Expr;
	scale?: number;
	rotate?: number;
	dx?: number;
	dy?: number;
	opacity?: number;
	lookX?: number;
	lookY?: number;
}> = ({x, y, w, expr, scale = 1, rotate = 0, dx = 0, dy = 0, opacity = 1, lookX = 0, lookY = 0}) => {
	const f = useCurrentFrame();
	const h = (w * 450) / 300;
	let tilt = -14 + Math.sin(f / 9) * 3;
	let ry = 36;
	let rx = 30;
	let pr = 13;
	let px = lookX * 7;
	let py = lookY * 7;
	let jitter = 0;
	if (expr === 'kaget') {
		tilt = Math.sin(f * 1.4) * 8;
		ry = 47;
		rx = 35;
		pr = 8;
		jitter = Math.sin(f * 2.3) * 3;
	} else if (expr === 'mikir') {
		tilt = Math.sin(f / 4) * 15;
		ry = 31;
		px = 7 + lookX * 4;
		py = -15;
	} else if (expr === 'paham') {
		tilt = Math.sin(f / 10) * 2;
	}
	const glow = 0.45 + 0.25 * Math.sin(f / 5);
	const eye = (cx: number) => (
		<g key={cx}>
			<ellipse cx={cx} cy="182" rx={rx} ry={ry} fill={C.white} stroke={C.ink} strokeWidth="5" />
			<circle cx={cx + px} cy={182 + py} r={pr} fill={C.ink} />
			<circle cx={cx + px + 4} cy={182 + py - 4} r={pr / 3.2} fill={C.white} />
		</g>
	);
	const squint = (cx: number) => (
		<path key={cx} d={`M${cx - 30} 190 Q${cx} 150 ${cx + 30} 190`} fill="none" stroke={C.ink} strokeWidth="9" strokeLinecap="round" />
	);
	return (
		<div
			style={{
				position: 'absolute',
				left: x - w / 2 + jitter,
				top: y - h * 0.933,
				width: w,
				height: h,
				opacity,
				transform: `translate(${dx}px, ${dy}px) rotate(${rotate}deg) scale(${scale})`,
				transformOrigin: '50% 93%',
			}}
		>
			<svg width={w} height={h} viewBox="0 -70 300 450" style={{overflow: 'visible'}}>
				<defs>
					<filter id="kepoBlur" x="-60%" y="-60%" width="220%" height="220%">
						<feGaussianBlur stdDeviation="14" />
					</filter>
				</defs>
				<ellipse cx="150" cy="356" rx="100" ry="12" fill={C.ink} opacity=".28" />
				{/* antena */}
				<g transform={`rotate(${tilt} 150 84)`}>
					<path d="M150 90 L150 46" stroke={C.ink} strokeWidth="14" strokeLinecap="round" />
					<path d="M150 90 L150 46" stroke={C.yellow} strokeWidth="6" strokeLinecap="round" />
					{expr === 'paham' && <circle cx="150" cy="-4" r="58" fill={C.yellow} opacity={glow} filter="url(#kepoBlur)" />}
					<text
						x="150"
						y="44"
						textAnchor="middle"
						fontFamily={POPPINS}
						fontWeight={800}
						fontSize="118"
						fill={C.yellow}
						stroke={C.ink}
						strokeWidth="7"
						strokeLinejoin="round"
						paintOrder="stroke"
					>
						{expr === 'paham' ? '!' : '?'}
					</text>
				</g>
				{/* badan */}
				<path
					d="M150 70 C232 70 276 126 276 192 C276 246 236 272 216 298 L216 312 L84 312 L84 298 C64 272 24 246 24 192 C24 126 68 70 150 70 Z"
					fill={C.yellow}
					stroke={C.ink}
					strokeWidth="7"
					strokeLinejoin="round"
				/>
				<ellipse cx="82" cy="128" rx="30" ry="16" fill={C.white} opacity=".45" transform="rotate(-32 82 128)" />
				<rect x="92" y="302" width="116" height="48" rx="14" fill={C.purple} stroke={C.ink} strokeWidth="6" />
				<path d="M96 318H204M96 334H204" stroke={C.ink} strokeWidth="4" opacity=".45" />
				{/* wajah */}
				{expr === 'paham' ? (
					<>
						{squint(108)}
						{squint(192)}
					</>
				) : (
					<>
						{eye(108)}
						{eye(192)}
					</>
				)}
				{expr === 'kaget' && <ellipse cx="150" cy="248" rx="13" ry="18" fill={C.ink} />}
				{expr === 'penasaran' && <path d="M134 242 Q150 254 166 242" fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />}
				{expr === 'mikir' && <path d="M136 246 L164 240" fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />}
				{expr === 'paham' && <path d="M116 232 Q150 276 184 232 Z" fill={C.ink} stroke={C.ink} strokeWidth="6" strokeLinejoin="round" />}
			</svg>
		</div>
	);
};

/* ============================================================================
 * MANUSIA (dunia historis) — Sitara, Muhammad, warga
 * fear 0..1 (wajah+lengan panik), ears 0..1 (tutup telinga), point 0..1 (menunjuk)
 * ========================================================================== */
type Style = 'cap' | 'scarf' | 'bun' | 'bald' | 'beard';
type PersonProps = {
	x: number;
	y: number;
	w: number;
	kind: 'sitara' | 'scholar' | 'villager';
	robe: string;
	accent: string;
	skin: string;
	hair: string;
	style?: Style;
	fear?: number;
	ears?: number;
	point?: number;
	lookX?: number;
	lookY?: number;
	dx?: number;
	dy?: number;
	rotate?: number;
	scale?: number;
	opacity?: number;
};

const Arm: React.FC<{sx: number; sy: number; a1: number; a2: number; mirror: boolean; robe: string; skin: string}> = ({
	sx,
	sy,
	a1,
	a2,
	mirror,
	robe,
	skin,
}) => (
	<g transform={`translate(${sx} ${sy}) ${mirror ? 'scale(-1 1)' : ''}`}>
		<g transform={`rotate(${a1})`}>
			<line x1="0" y1="0" x2="0" y2="70" stroke={C.ink} strokeWidth="36" strokeLinecap="round" />
			<line x1="0" y1="0" x2="0" y2="70" stroke={robe} strokeWidth="28" strokeLinecap="round" />
			<g transform={`translate(0 70) rotate(${a2})`}>
				<line x1="0" y1="0" x2="0" y2="62" stroke={C.ink} strokeWidth="32" strokeLinecap="round" />
				<line x1="0" y1="0" x2="0" y2="62" stroke={robe} strokeWidth="24" strokeLinecap="round" />
				<circle cx="0" cy="72" r="16" fill={skin} stroke={C.ink} strokeWidth="4" />
			</g>
		</g>
	</g>
);

const Person: React.FC<PersonProps> = ({
	x,
	y,
	w,
	kind,
	robe,
	accent,
	skin,
	hair,
	style = 'cap',
	fear = 0,
	ears = 0,
	point = 0,
	lookX = 0,
	lookY = 0,
	dx = 0,
	dy = 0,
	rotate = 0,
	scale = 1,
	opacity = 1,
}) => {
	const f = useCurrentFrame();
	const h = (w * 520) / 240;
	const wv = Math.sin(f / 2.2) * 18;
	const aL1 = 8 + fear * 120 + ears * 126 + point * 62;
	const aL2 = -4 + fear * (46 + wv) + ears * 96 + point * -41;
	const aR1 = 8 + fear * 120 + ears * 126;
	const aR2 = -4 + fear * (46 - wv) + ears * 96;
	const blink = f % 110 < 4 ? 0.15 : 1;
	const eyeRy = lerp(8, 19, fear) * blink;
	const pup = lerp(5.5, 4, fear);
	const browY = 80 - fear * 9;
	const ink = C.ink;
	const eye = (cx: number) => (
		<g key={cx}>
			<ellipse cx={cx} cy="101" rx="10" ry={eyeRy} fill={C.white} stroke={ink} strokeWidth="3" />
			<circle cx={cx + lookX * 4} cy={101 + lookY * 3} r={Math.min(pup, eyeRy)} fill={ink} />
		</g>
	);
	return (
		<div
			style={{
				position: 'absolute',
				left: x - w / 2,
				top: y - h * 0.97,
				width: w,
				height: h,
				opacity,
				transform: `translate(${dx}px, ${dy}px) rotate(${rotate}deg) scale(${scale})`,
				transformOrigin: '50% 97%',
			}}
		>
			<svg width={w} height={h} viewBox="0 0 240 520" style={{overflow: 'visible'}}>
				<ellipse cx="120" cy="508" rx="92" ry="10" fill={ink} opacity=".28" />
				{/* rambut belakang */}
				{kind === 'sitara' && <ellipse cx="120" cy="108" rx="57" ry="60" fill={hair} stroke={ink} strokeWidth="4" />}
				{/* jubah */}
				<path d="M72 188 Q120 168 168 188 L208 494 L32 494 Z" fill={robe} stroke={ink} strokeWidth="5" strokeLinejoin="round" />
				<path d="M96 180 L120 232 L144 180" fill="none" stroke={accent} strokeWidth="11" strokeLinejoin="round" />
				<path d="M52 336 L188 336 L194 362 L46 362 Z" fill={accent} stroke={ink} strokeWidth="4" />
				<path d="M48 462 H192" stroke={accent} strokeWidth="6" opacity=".6" />
				{kind === 'scholar' && <path d="M58 192 Q120 160 182 192 L200 330 L40 330 Z" fill={accent} stroke={ink} strokeWidth="5" opacity=".92" />}
				<ellipse cx="92" cy="498" rx="22" ry="10" fill={ink} />
				<ellipse cx="148" cy="498" rx="22" ry="10" fill={ink} />
				{/* leher + kepala */}
				<rect x="106" y="140" width="28" height="46" fill={skin} stroke={ink} strokeWidth="4" />
				<circle cx="70" cy="104" r="10" fill={skin} stroke={ink} strokeWidth="4" />
				<circle cx="170" cy="104" r="10" fill={skin} stroke={ink} strokeWidth="4" />
				<circle cx="120" cy="100" r="50" fill={skin} stroke={ink} strokeWidth="5" />
				{/* wajah */}
				{eye(100)}
				{eye(140)}
				<path d={`M88 ${browY + 2} Q100 ${browY - 5} 112 ${browY + 2}`} fill="none" stroke={hair} strokeWidth="5" strokeLinecap="round" />
				<path d={`M128 ${browY + 2} Q140 ${browY - 5} 152 ${browY + 2}`} fill="none" stroke={hair} strokeWidth="5" strokeLinecap="round" />
				<path d="M120 108 Q116 118 122 120" fill="none" stroke={ink} strokeWidth="3" opacity=".55" strokeLinecap="round" />
				{fear > 0.35 ? (
					<ellipse cx="120" cy="134" rx="9" ry={4 + fear * 9} fill={ink} />
				) : (
					<path d="M106 131 Q120 140 134 131" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
				)}
				{/* atribut kepala */}
				{kind === 'sitara' && (
					<>
						<path d="M68 98 C62 52 96 38 120 38 C146 38 178 52 172 98 C162 76 142 66 120 64 C98 66 78 76 68 98 Z" fill={hair} stroke={ink} strokeWidth="4" />
						<path d="M70 82 Q120 58 170 82" fill="none" stroke={accent} strokeWidth="9" strokeLinecap="round" />
						{[150, 180, 210, 238].map((cy, i) => (
							<ellipse key={cy} cx={176 + i * 1.5} cy={cy} rx="12" ry="17" fill={hair} stroke={ink} strokeWidth="3" />
						))}
						<rect x="170" y="252" width="18" height="11" rx="4" fill={C.yellow} stroke={ink} strokeWidth="3" />
					</>
				)}
				{kind === 'scholar' && (
					<>
						<path d="M72 112 C72 178 168 178 168 112 C156 142 84 142 72 112 Z" fill={hair} stroke={ink} strokeWidth="4" />
						<path d="M100 122 Q120 112 140 122 Q120 129 100 122 Z" fill={hair} stroke={ink} strokeWidth="3" />
						<ellipse cx="120" cy="56" rx="62" ry="32" fill={ART.cream} stroke={ink} strokeWidth="5" />
						<path d="M66 60 Q120 96 174 56 M74 42 Q120 74 166 38" fill="none" stroke="#B7A98A" strokeWidth="4" />
					</>
				)}
				{kind === 'villager' && style === 'cap' && (
					<>
						<path d="M70 84 C70 36 170 36 170 84 L178 90 L62 90 Z" fill={accent} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
						<ellipse cx="72" cy="100" rx="7" ry="14" fill={hair} />
						<ellipse cx="168" cy="100" rx="7" ry="14" fill={hair} />
					</>
				)}
				{kind === 'villager' && style === 'scarf' && (
					<path d="M60 114 C46 28 194 28 180 114 C172 84 68 84 60 114 Z" fill={accent} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
				)}
				{kind === 'villager' && style === 'bun' && (
					<>
						<circle cx="120" cy="40" r="20" fill={hair} stroke={ink} strokeWidth="4" />
						<path d="M70 94 C70 44 170 44 170 94 C150 70 90 70 70 94 Z" fill={hair} stroke={ink} strokeWidth="4" />
					</>
				)}
				{kind === 'villager' && style === 'bald' && (
					<>
						<ellipse cx="72" cy="94" rx="8" ry="18" fill={hair} />
						<ellipse cx="168" cy="94" rx="8" ry="18" fill={hair} />
					</>
				)}
				{kind === 'villager' && style === 'beard' && (
					<>
						<path d="M70 94 C70 44 170 44 170 94 C150 72 90 72 70 94 Z" fill={hair} stroke={ink} strokeWidth="4" />
						<path d="M76 118 C78 160 162 160 164 118 C150 138 90 138 76 118 Z" fill={hair} stroke={ink} strokeWidth="4" />
					</>
				)}
				{/* lengan */}
				<Arm sx={72} sy={202} a1={aL1} a2={aL2} mirror={false} robe={robe} skin={skin} />
				<Arm sx={168} sy={202} a1={aR1} a2={aR2} mirror robe={robe} skin={skin} />
			</svg>
		</div>
	);
};

/* Tokoh-tokoh tetap (satu desain, tidak berubah antar scene) */
const sitara = (o: Partial<PersonProps> & {x: number; y: number; w: number}): React.ReactElement => (
	<Person kind="sitara" robe={ART.sitara} accent={C.purple} skin={ART.skinB} hair="#1C1226" {...o} />
);
const muhammad = (o: Partial<PersonProps> & {x: number; y: number; w: number}): React.ReactElement => (
	<Person kind="scholar" robe={ART.cream} accent={ART.teal} skin={ART.skinC} hair="#B9B2A5" {...o} />
);
const VILLAGERS: {robe: string; accent: string; skin: string; hair: string; style: Style}[] = [
	{robe: ART.rust, accent: C.yellow, skin: ART.skinB, hair: '#2B1B12', style: 'cap'},
	{robe: ART.dusk, accent: ART.cream, skin: ART.skinA, hair: '#3A2A1E', style: 'scarf'},
	{robe: ART.moss, accent: ART.mustard, skin: ART.skinC, hair: '#241810', style: 'beard'},
	{robe: ART.wine, accent: ART.cream, skin: ART.skinB, hair: '#4A3426', style: 'bun'},
	{robe: ART.mustard, accent: ART.rust, skin: ART.skinA, hair: '#2B1B12', style: 'bald'},
];

/* ============================================================================
 * PROPERTI — Seng (logam dapur), gelombang suara, kilau
 * ========================================================================== */
const TIN_REST = {x: 720, y: 1128};
const Tin: React.FC<{x: number; y: number; w: number; rot: number}> = ({x, y, w, rot}) => {
	const h = (w * 130) / 260;
	return (
		<div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg)`}}>
			<svg width={w} height={h} viewBox="0 0 260 130" style={{overflow: 'visible'}}>
				<ellipse cx="130" cy="124" rx="108" ry="8" fill={C.ink} opacity=".25" />
				<ellipse cx="130" cy="74" rx="122" ry="42" fill={ART.steelD} stroke={C.ink} strokeWidth="6" />
				<ellipse cx="130" cy="58" rx="122" ry="42" fill={ART.steel} stroke={C.ink} strokeWidth="6" />
				<ellipse cx="130" cy="60" rx="92" ry="28" fill="#8FA0B8" stroke={C.ink} strokeWidth="4" />
				<path d="M62 44 Q100 24 150 28" fill="none" stroke={C.white} strokeWidth="8" strokeLinecap="round" opacity=".8" />
				<circle cx="226" cy="52" r="7" fill={ART.steelD} stroke={C.ink} strokeWidth="4" />
			</svg>
		</div>
	);
};
const tinFall = (f: number, start: number, impact: number) => {
	const shelf = {x: 690, y: 516};
	if (f < start - 12) return {x: shelf.x, y: shelf.y, rot: 0};
	if (f < start) return {x: shelf.x + 6 * ramp(f, start - 12, start), y: shelf.y, rot: -12 * ramp(f, start - 12, start)};
	if (f < impact) {
		const p = (f - start) / (impact - start);
		const e = p * p;
		return {x: lerp(shelf.x + 6, TIN_REST.x, e), y: lerp(shelf.y, TIN_REST.y, e), rot: -12 - 348 * e};
	}
	return {x: TIN_REST.x, y: TIN_REST.y, rot: 0};
};
const tinWobble = (k: number, amp: number) => ({
	x: TIN_REST.x,
	y: TIN_REST.y - Math.abs(Math.sin(k * 0.55)) * 30 * Math.exp(-k / 9) * (amp / 14),
	rot: Math.sin(k * 0.8) * amp * Math.exp(-k / 20),
});

const Waves: React.FC<{
	x: number;
	y: number;
	start: number;
	count?: number;
	period?: number;
	maxR?: number;
	color?: string;
	life?: number;
}> = ({x, y, start, count = 4, period = 11, maxR = 460, color = C.yellow, life = 44}) => {
	const f = useCurrentFrame();
	return (
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
			{Array.from({length: count}).map((_, i) => {
				const k = f - start - i * period;
				if (k < 0 || k > life) return null;
				const p = k / life;
				const r = maxR * Easing.out(Easing.cubic)(p);
				return <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={i % 2 ? C.white : color} strokeWidth={2 + 16 * (1 - p)} opacity={(1 - p) * 0.9} />;
			})}
		</svg>
	);
};

const Sparkles: React.FC<{x: number; y: number; spread: number; n?: number; start?: number; rise?: number; color?: string}> = ({
	x,
	y,
	spread,
	n = 14,
	start = 0,
	rise = 300,
	color = C.yellow,
}) => {
	const f = useCurrentFrame();
	if (f < start) return null;
	const life = 70;
	return (
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
			{Array.from({length: n}).map((_, i) => {
				const k = (f - start + (i * life) / n) % life;
				const p = k / life;
				const px = x + Math.sin(i * 12.9) * spread + Math.sin(k / 9 + i) * 14;
				const py = y - p * rise;
				return <path key={i} d={sparklePath(px, py, 6 + (i % 3) * 4)} fill={color} opacity={Math.sin(p * Math.PI)} />;
			})}
		</svg>
	);
};

const Glow: React.FC<{x: number; y: number; rx: number; ry: number; opacity: number; color?: string}> = ({x, y, rx, ry, opacity, color = '251,191,36'}) => (
	<div
		style={{
			position: 'absolute',
			left: x - rx,
			top: y - ry,
			width: rx * 2,
			height: ry * 2,
			opacity,
			background: `radial-gradient(ellipse at center, rgba(${color},.5), rgba(${color},0) 70%)`,
		}}
	/>
);

/* ============================================================================
 * SCENE 1 — HOOK  (00:00–00:04)
 * Kepo di depan dapur, seng jatuh di belakangnya.
 * ========================================================================== */
const Scene1Hook: React.FC = () => {
	const f = useCurrentFrame();
	const IMPACT = 98;
	const tin = tinFall(f, 64, IMPACT);
	const k = f - IMPACT;
	const jump = k >= 0 ? -Math.abs(Math.sin(k * 0.33)) * 80 * Math.exp(-k / 14) : 0;
	const titleA = ramp(f, 4, 16) * ramp(f, 104, 114, 1, 0, Easing.linear);
	const flash = k >= 0 ? ramp(k, 0, 8, 0.4, 0, Easing.linear) : 0;
	const wig = k < 0 ? 0 : 1;
	return (
		<AbsoluteFill>
			<Camera s={1 + 0.08 * ramp(f, 0, 120, 0, 1, Easing.linear)} fx={560} fy={800} sx={shake(f, IMPACT, 16, 14) * wig} sy={shake(f, IMPACT + 2, 16, 10) * wig}>
				<KitchenBG />
				<Tin x={tin.x} y={f >= IMPACT ? tinWobble(k, 10).y : tin.y} w={220} rot={f >= IMPACT ? tinWobble(k, 10).rot : tin.rot} />
				<Waves x={TIN_REST.x} y={TIN_REST.y + 10} start={IMPACT} count={3} period={9} maxR={420} />
				<Kepo x={400} y={1190} w={380} expr={f < IMPACT ? 'penasaran' : 'kaget'} scale={pop(f, 2)} dy={jump} />
			</Camera>
			{/* HOOK: pertanyaan besar di layar */}
			<div
				style={{
					position: 'absolute',
					left: 40,
					width: 1000,
					top: 270,
					textAlign: 'center',
					fontFamily: POPPINS,
					fontWeight: 800,
					fontSize: 82,
					lineHeight: 1.12,
					color: C.white,
					opacity: titleA,
					transform: `translateY(${ramp(f, 4, 18, 30, 0)}px) scale(${lerp(0.9, 1, pop(f, 4))})`,
				}}
			>
				<RichText text="Kenapa suara jatuh" />
				<br />
				<RichText text="bikin ~panik?~" />
			</div>
			<AbsoluteFill style={{backgroundColor: C.white, opacity: flash}} />
		</AbsoluteFill>
	);
};

/* ============================================================================
 * SCENE 2 — PEMBUKA CERITA  (00:04–00:10)
 * Close-up seng → wide kerumunan panik → Sitara tetap tenang.
 * ========================================================================== */
const CROWD = [
	{x: 270, w: 210, y: 1150, dir: -1, delay: 0, v: 0},
	{x: 190, w: 160, y: 1108, dir: -1, delay: 6, v: 1},
	{x: 600, w: 165, y: 1105, dir: 1, delay: 3, v: 3},
	{x: 880, w: 215, y: 1150, dir: 1, delay: 2, v: 2},
	{x: 1000, w: 200, y: 1150, dir: 1, delay: 8, v: 4},
];
const SITARA_X = 480;
const Scene2Story: React.FC = () => {
	const f = useCurrentFrame();
	const p = ramp(f, 38, 118, 0, 1, inOut);
	const q = ramp(f, 134, 180, 0, 1, inOut);
	const s = lerp(lerp(2.5, 1, p), 1.32, q);
	const fx = lerp(lerp(TIN_REST.x, 540, p), SITARA_X, q);
	const fy = lerp(lerp(TIN_REST.y - 20, 760, p), 830, q);
	const earsIn = ramp(f, 28, 36);
	const earsOut = ramp(f, 140, 152);
	const ears = earsIn * (1 - earsOut);
	const tw = tinWobble(f, 12);
	const klang = pop(f, 6, 9, 200) * ramp(f, 56, 66, 1, 0, Easing.linear);
	return (
		<AbsoluteFill>
			<Camera s={s} fx={fx} fy={fy} sx={shake(f, 0, 18, 10) + shake(f, 42, 40, 9)} sy={shake(f, 2, 18, 8) + shake(f, 44, 40, 8)}>
				<KitchenBG />
				<Glow x={SITARA_X} y={880} rx={300} ry={420} opacity={ramp(f, 138, 160) * 0.6} />
				{CROWD.map((c, i) => {
					const v = VILLAGERS[c.v];
					const run0 = 88 + c.delay;
					const rp = ramp(f, run0, run0 + 44, 0, 1, Easing.in(Easing.quad));
					const vx = c.x + c.dir * rp * 1000;
					if (vx < -260 || vx > 1340) return null;
					const running = f >= run0;
					const startled = f >= 62 + c.delay;
					const bob = running ? -Math.abs(Math.sin(f * 0.8)) * 20 : startled ? -Math.abs(Math.sin(f * 0.45)) * 10 : 0;
					return (
						<Person
							key={i}
							kind="villager"
							x={vx}
							y={c.y}
							w={c.w}
							{...v}
							fear={ramp(f, 62 + c.delay, 70 + c.delay)}
							dy={bob}
							rotate={running ? c.dir * 12 : 0}
						/>
					);
				})}
				{sitara({x: SITARA_X, y: 1150, w: 240, ears, lookY: 0.4, dy: Math.sin(f / 14) * 2})}
				<Tin x={TIN_REST.x} y={tw.y} w={220} rot={tw.rot} />
				<Waves x={TIN_REST.x} y={TIN_REST.y + 10} start={0} count={6} period={13} maxR={520} life={46} />
				<div
					style={{
						position: 'absolute',
						left: TIN_REST.x - 230,
						top: 880,
						width: 460,
						textAlign: 'center',
						fontFamily: POPPINS,
						fontWeight: 800,
						fontSize: 96,
						color: C.yellow,
						WebkitTextStroke: `8px ${C.ink}`,
						paintOrder: 'stroke fill',
						opacity: klang,
						transform: `rotate(-8deg) scale(${klang * 1.05})`,
					}}
				>
					KLANG!
				</div>
				<Kepo x={130} y={1200} w={190} expr={f < 140 ? 'kaget' : 'penasaran'} scale={pop(f, 66)} lookX={1} />
			</Camera>
		</AbsoluteFill>
	);
};

/* ============================================================================
 * SCENE 3 — FAKTA  (00:10–00:17)
 * Suara sama, tapi hanya Sitara yang memahami penyebabnya.
 * ========================================================================== */
const Scene3Fakta: React.FC = () => {
	const f = useCurrentFrame();
	const q = ramp(f, 130, 210, 0, 1, inOut);
	const s = lerp(1.05, 2.1, q);
	const fx = lerp(540, 500, q);
	const fy = lerp(800, 745, q);
	const eyes = {x: SITARA_X + 20, y: 745};
	const gp = ramp(f, 96, 150);
	const gx = lerp(eyes.x, TIN_REST.x, gp);
	const gy = lerp(eyes.y, TIN_REST.y, gp);
	const tw = tinWobble(f + 40, 4);
	return (
		<AbsoluteFill>
			<Camera s={s} fx={fx} fy={fy}>
				<KitchenBG />
				<Waves x={TIN_REST.x} y={TIN_REST.y} start={0} count={30} period={22} maxR={640} life={60} color={C.white} />
				{/* warga masih panik (kerumunan = ketidaktahuan) */}
				{[120, 232].map((x, i) => (
					<React.Fragment key={x}>
						<Person kind="villager" x={x} y={1112} w={165} {...VILLAGERS[i]} fear={1} dx={Math.sin(f * 1.7 + i) * 3} dy={-Math.abs(Math.sin(f * 0.5 + i)) * 6} />
						<div
							style={{
								position: 'absolute',
								left: x - 20,
								top: 560,
								width: 40,
								textAlign: 'center',
								fontFamily: POPPINS,
								fontWeight: 800,
								fontSize: 60,
								color: C.pink,
								transform: `scale(${pop(f, 10 + i * 6)})`,
							}}
						>
							!
						</div>
					</React.Fragment>
				))}
				{sitara({x: SITARA_X, y: 1150, w: 240, lookX: ramp(f, 96, 110) * 1.2, lookY: ramp(f, 96, 110) * 1.4, ears: ramp(f, 4, 10) * ramp(f, 40, 52, 1, 0)})}
				{muhammad({x: 880, y: 1150, w: 255, point: ramp(f, 24, 44), lookX: -1, lookY: 0.8, dx: lerp(60, 0, ramp(f, 0, 20)), opacity: ramp(f, 0, 14)})}
				<Tin x={TIN_REST.x} y={tw.y} w={220} rot={tw.rot} />
				{/* garis pandang Sitara → sumber suara */}
				<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
					{gp > 0 && (
						<line x1={eyes.x} y1={eyes.y} x2={gx} y2={gy} stroke={C.yellow} strokeWidth="8" strokeLinecap="round" strokeDasharray="14 14" strokeDashoffset={-f * 2} />
					)}
					{gp >= 1 && <circle cx={TIN_REST.x} cy={TIN_REST.y} r={90 + Math.sin(f / 4) * 6} fill="none" stroke={C.yellow} strokeWidth="6" opacity=".9" />}
				</svg>
				<Kepo x={340} y={1215} w={170} expr={f < 100 ? 'kaget' : 'mikir'} scale={pop(f, 6)} lookX={1} opacity={ramp(f, 118, 140, 1, 0, Easing.linear)} />
			</Camera>
		</AbsoluteFill>
	);
};

/* ============================================================================
 * SCENE 4 — PENJELASAN ILMIAH  (00:17–00:25)
 * Layar terbagi dua: Hafalan (pencocok pola) | Penalaran (sebab → akibat → jawaban)
 * ========================================================================== */
const Brain: React.FC<{x: number; y: number; s: number; fill: string}> = ({x, y, s, fill}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<path
			d="M-50 0 C-70 -30 -40 -60 -10 -48 C0 -66 40 -62 46 -36 C72 -34 76 6 52 18 C56 44 20 56 4 40 C-14 58 -52 44 -46 20 C-70 18 -70 4 -50 0 Z"
			fill={fill}
			stroke={C.ink}
			strokeWidth="5"
			strokeLinejoin="round"
		/>
		<path d="M0 -44 C-8 -20 8 -10 0 40 M-30 -20 C-20 -10 -24 4 -34 8 M26 -22 C16 -10 22 6 34 10" fill="none" stroke={C.ink} strokeWidth="4" strokeLinecap="round" opacity=".6" />
	</g>
);
const Shape: React.FC<{kind: number; cx: number; cy: number; on: boolean; dim: boolean}> = ({kind, cx, cy, on, dim}) => {
	const fill = on ? C.yellow : C.white;
	const common = {fill, stroke: on ? C.white : C.ink, strokeWidth: on ? 5 : 3, opacity: dim ? 0.35 : 1};
	if (kind === 0) return <circle cx={cx} cy={cy} r="28" {...common} />;
	if (kind === 1) return <rect x={cx - 26} y={cy - 26} width="52" height="52" rx="8" {...common} />;
	return <path d={`M${cx} ${cy - 30} L${cx + 30} ${cy + 24} L${cx - 30} ${cy + 24} Z`} strokeLinejoin="round" {...common} />;
};
const Scene4Penjelasan: React.FC = () => {
	const f = useCurrentFrame();
	const CY = 330;
	const CH = 640;
	const CW = 480;
	const enter = ramp(f, 0, 22);
	const raz = ramp(f, 164, 176);
	const haf = ramp(f, 90, 100) * (1 - raz);
	const leftOp = 1 - 0.55 * raz;
	const rightOp = 1 - 0.55 * haf;
	const active = f >= 100 && f < 168 ? Math.floor((f - 100) / 22) % 3 : -1;
	const grid = [
		[0, 1, 2],
		[1, 2, 0],
		[2, 0, 1],
	];
	const nodes = [
		{label: 'SEBAB', at: 170},
		{label: 'AKIBAT', at: 194},
		{label: 'JAWABAN', at: 218},
	];
	return (
		<AbsoluteFill>
			<ReasonBG />
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
				{/* KIRI: hafalan */}
				<g transform={`translate(${50 - 600 * (1 - enter)} ${CY})`} opacity={leftOp}>
					<rect width={CW} height={CH} rx="44" fill={C.purple} stroke={C.yellow} strokeWidth="6" strokeOpacity={haf} />
					<text x={CW / 2} y="70" textAnchor="middle" fontFamily={POPPINS} fontWeight={800} fontSize="50" fill={C.white}>
						HAFALAN
					</text>
					<Brain x={CW / 2} y={170} s={0.9 + 0.05 * Math.sin(f / 5) * haf} fill={C.yellow} />
					{grid.map((row, r) =>
						row.map((kind, c) => (
							<g key={`${r}-${c}`} transform={`scale(${pop(f, 8 + r * 3 + c * 2)})`} style={{transformOrigin: `${94 + c * 102 + 44}px ${300 + r * 102 + 44}px`}}>
								<Shape kind={kind} cx={94 + c * 102 + 44} cy={300 + r * 102 + 44} on={active === kind} dim={active !== -1 && active !== kind} />
							</g>
						)),
					)}
				</g>
				{/* KANAN: penalaran */}
				<g transform={`translate(${550 + 600 * (1 - enter)} ${CY})`} opacity={rightOp}>
					<rect width={CW} height={CH} rx="44" fill={C.purple} stroke={C.yellow} strokeWidth="6" strokeOpacity={raz} />
					<text x={CW / 2} y="70" textAnchor="middle" fontFamily={POPPINS} fontWeight={800} fontSize="50" fill={C.white}>
						PENALARAN
					</text>
					<Brain x={CW / 2} y={170} s={0.9 + 0.05 * Math.sin(f / 5) * raz} fill={C.yellow} />
					{nodes.map((n, i) => {
						const y0 = 300 + i * 120;
						const a = pop(f, n.at);
						const last = i === nodes.length - 1;
						return (
							<g key={n.label}>
								{i > 0 && (
									<g opacity={ramp(f, n.at - 8, n.at)}>
										<path d={`M${CW / 2} ${y0 - 42} V${y0 - 6}`} stroke={C.yellow} strokeWidth="7" strokeLinecap="round" />
										<path d={`M${CW / 2 - 12} ${y0 - 16} L${CW / 2} ${y0 - 2} L${CW / 2 + 12} ${y0 - 16}`} fill="none" stroke={C.yellow} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
									</g>
								)}
								<rect x="90" y={y0} width="300" height="76" rx="26" fill="none" stroke={C.white} strokeWidth="3" strokeDasharray="8 8" opacity=".3" />
								<g style={{transformOrigin: `${CW / 2}px ${y0 + 38}px`, transform: `scale(${a})`}}>
									{last && a > 0.5 && <rect x="84" y={y0 - 6} width="312" height="88" rx="32" fill={C.yellow} opacity={0.35 + 0.2 * Math.sin(f / 4)} />}
									<rect x="90" y={y0} width="300" height="76" rx="26" fill={last ? C.yellow : C.indigo} stroke={C.ink} strokeWidth="4" />
									<text x={CW / 2} y={y0 + 51} textAnchor="middle" fontFamily={POPPINS} fontWeight={800} fontSize="38" fill={last ? C.ink : C.white}>
										{n.label}
									</text>
								</g>
							</g>
						);
					})}
				</g>
			</svg>
			<Kepo x={540} y={1215} w={190} expr={f < 224 ? 'mikir' : 'paham'} scale={pop(f, 14)} />
		</AbsoluteFill>
	);
};

/* ============================================================================
 * SCENE 5 — PENERAPAN  (00:25–00:32)
 * Tangga ilmu kehilangan anak tangga pertama. Kepo mencoba naik → fondasi belum ada.
 * ========================================================================== */
const Scene5Penerapan: React.FC = () => {
	const f = useCurrentFrame();
	const rungs = [400, 560, 720, 880];
	const jumpAt = [46, 66, 86];
	let jy = 0;
	for (const j of jumpAt) {
		const p = (f - j) / 18;
		if (p >= 0 && p <= 1) jy = -Math.sin(p * Math.PI) * 120;
	}
	// percobaan kedua (anak tangga palsu, "tertipu")
	const pf = (f - 150) / 16;
	if (pf >= 0 && pf <= 1) jy = -Math.sin(pf * Math.PI) * 120;
	const fake = ramp(f, 124, 134);
	const broken = f >= 158;
	const bk = Math.max(0, f - 158);
	const sway = f > 160 ? Math.sin(f / 3) * 2.2 * Math.exp(-(f - 160) / 30) : 0;
	const expr: Expr = f < 98 ? 'penasaran' : f < 140 ? 'mikir' : f < 158 ? 'penasaran' : f < 190 ? 'kaget' : 'mikir';
	const kx = lerp(260, 540, ramp(f, 14, 40, 0, 1, inOut));
	return (
		<AbsoluteFill>
			<ReasonBG />
			<Glow x={540} y={430} rx={420} ry={380} opacity={0.55 + 0.1 * Math.sin(f / 8)} />
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
				<g transform={`rotate(${sway} 540 1150)`} opacity={ramp(f, 0, 14)}>
										<path d="M400 340 V1150 M680 340 V1150" stroke={C.ink} strokeWidth="34" strokeLinecap="round" />
					<path d="M400 340 V1150 M680 340 V1150" stroke={ART.woodL} strokeWidth="22" strokeLinecap="round" />
					{rungs.map((y) => (
						<g key={y}>
							<path d={`M400 ${y} H680`} stroke={C.ink} strokeWidth="30" strokeLinecap="round" />
							<path d={`M400 ${y} H680`} stroke={ART.wood} strokeWidth="18" strokeLinecap="round" />
						</g>
					))}
					{/* anak tangga pertama yang hilang */}
					<rect x="402" y="1022" width="276" height="36" rx="16" fill="none" stroke={C.yellow} strokeWidth="5" strokeDasharray="12 10" strokeDashoffset={-f} opacity={ramp(f, 20, 34) * (0.6 + 0.4 * Math.sin(f / 5))} />
					{/* anak tangga palsu (menyesatkan) */}
					{fake > 0 && !broken && (
						<g opacity={fake}>
							<path d="M400 1040 H680" stroke={C.pink} strokeWidth="18" strokeLinecap="round" strokeDasharray="22 10" opacity=".85" />
						</g>
					)}
					{broken && (
						<g>
							<path d={`M400 ${1040 + bk * 3} H540`} stroke={C.pink} strokeWidth="18" strokeLinecap="round" transform={`rotate(${-bk * 3} 470 ${1040 + bk * 3})`} opacity={ramp(bk, 0, 30, 1, 0, Easing.linear)} />
							<path d={`M560 ${1040 + bk * 4} H680`} stroke={C.pink} strokeWidth="18" strokeLinecap="round" transform={`rotate(${bk * 3} 620 ${1040 + bk * 4})`} opacity={ramp(bk, 0, 30, 1, 0, Easing.linear)} />
						</g>
					)}
					{/* puncak: ILMU */}
					<g transform={`translate(540 ${270})`}>
						<rect x="-110" y="-44" width="220" height="88" rx="44" fill={C.yellow} stroke={C.ink} strokeWidth="6" />
						<text x="0" y="20" textAnchor="middle" fontFamily={POPPINS} fontWeight={800} fontSize="54" fill={C.ink}>
							ILMU
						</text>
					</g>
					<rect x="240" y="1150" width="600" height="34" rx="12" fill={ART.stone} stroke={C.ink} strokeWidth="6" />
				</g>
				{/* label fondasi */}
				<g opacity={ramp(f, 56, 70) * ramp(f, 112, 124, 1, 0, Easing.linear)}>
					<path d="M730 1040 H770" stroke={C.yellow} strokeWidth="6" strokeLinecap="round" />
					<text x="780" y="1054" fontFamily={POPPINS} fontWeight={800} fontSize="42" fill={C.yellow}>
						fondasi?
					</text>
				</g>
				{/* peringatan tertipu */}
				{f >= 124 && (
					<text x="740" y={1052} fontFamily={POPPINS} fontWeight={800} fontSize="64" fill={C.pink} opacity={ramp(f, 124, 134) * ramp(f, 190, 205, 1, 0, Easing.linear)} transform={`rotate(${Math.sin(f / 3) * 6} 760 1030)`}>
						!
					</text>
				)}
			</svg>
			<Kepo x={kx} y={1150} w={150} expr={expr} dy={jy} scale={pop(f, 10)} lookY={-0.6} />
		</AbsoluteFill>
	);
};

/* ============================================================================
 * SCENE 6 — PESAN AL-QUR'AN  (00:32–00:40)
 * Mushaf terbuka di atas rehal, cahaya lembut. Suasana khidmat, slow zoom-in.
 * (Hiasan halaman berupa garis dekoratif — tanpa menuliskan ayat.)
 * ========================================================================== */
const Scene6Quran: React.FC = () => {
	const f = useCurrentFrame();
	const cx = 590;
	const cy = 800;
	const rise = ramp(f, 0, 30);
	const rays = [-300, -190, -90, 0, 90, 190, 300];
	const lines = [0, 1, 2, 3, 4, 5, 6];
	const expr: Expr = f < 70 ? 'penasaran' : f < 185 ? 'mikir' : 'paham';
	return (
		<AbsoluteFill>
			<ReasonBG glow={0.6} />
			<Camera s={lerp(1, 1.22, ramp(f, 0, 240, 0, 1, Easing.linear))} fx={cx - 40} fy={cy + 60}>
				<Glow x={cx} y={cy} rx={470} ry={470} opacity={(0.7 + 0.15 * Math.sin(f / 14)) * rise} />
				<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
					<defs>
						<linearGradient id="rayG" x1="0" y1="1" x2="0" y2="0">
							<stop offset="0" stopColor={C.yellow} stopOpacity=".65" />
							<stop offset="1" stopColor={C.yellow} stopOpacity="0" />
						</linearGradient>
					</defs>
					{rays.map((dxr, i) => (
						<path key={i} d={`M${cx + dxr * 0.1} ${cy - 40} L${cx + dxr - 34} ${cy - 760} L${cx + dxr + 34} ${cy - 760} Z`} fill="url(#rayG)" opacity={(0.5 + 0.35 * Math.sin(f / 16 + i * 1.3)) * rise} />
					))}
					<g transform={`translate(${cx} ${cy + 20 + (1 - rise) * 40})`} opacity={rise}>
						{/* rehal (penyangga kayu) */}
						<path d="M-200 150 L130 470 M200 150 L-130 470" stroke={C.ink} strokeWidth="40" strokeLinecap="round" />
						<path d="M-200 150 L130 470 M200 150 L-130 470" stroke={ART.woodL} strokeWidth="28" strokeLinecap="round" />
						{/* sampul */}
						<path d="M-292 -128 L0 -96 L292 -128 L292 152 L0 186 L-292 152 Z" fill={C.purple} stroke={C.ink} strokeWidth="7" strokeLinejoin="round" />
						{/* halaman */}
						<path d="M-274 -118 L-8 -88 L-8 160 L-274 132 Z" fill={ART.cream} stroke={C.ink} strokeWidth="5" strokeLinejoin="round" />
						<path d="M274 -118 L8 -88 L8 160 L274 132 Z" fill={ART.cream} stroke={C.ink} strokeWidth="5" strokeLinejoin="round" />
						<path d="M-250 -96 L-26 -72 L-26 134 L-250 110 Z M250 -96 L26 -72 L26 134 L250 110 Z" fill="none" stroke={C.yellow} strokeWidth="5" />
						{[-1, 1].map((sd) => (
							<g key={sd}>
								<circle cx={sd * 138} cy="-44" r="20" fill="none" stroke={ART.mustard} strokeWidth="5" />
								<circle cx={sd * 138} cy="-44" r="7" fill={ART.mustard} />
								{lines.map((l) => (
									<path
										key={l}
										d={`M${sd * 50} ${-12 + l * 20 + (sd * 50 > 0 ? -2 : 2)} q${sd * 40} -12 ${sd * 80} 0 t${sd * 80} 0`}
										fill="none"
										stroke={ART.wood}
										strokeWidth="5"
										strokeLinecap="round"
										opacity=".7"
									/>
								))}
							</g>
						))}
						<path d="M0 -96 V186" stroke={C.ink} strokeWidth="6" />
					</g>
				</svg>
				<Sparkles x={cx} y={cy - 60} spread={260} n={18} start={10} rise={520} />
				<Kepo x={210} y={1195} w={230} expr={expr} lookX={1} lookY={-0.2} scale={pop(f, 12)} />
			</Camera>
		</AbsoluteFill>
	);
};

/* ============================================================================
 * SCENE 7 — OUTRO  (00:40–00:45)
 * Kepo tersenyum, antena jadi tanda seru, logo Rumah Penasaran + ajakan follow.
 * ========================================================================== */
const Logo: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 200 200">
		<defs>
			<linearGradient id="logoBg" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stopColor={C.indigo} />
				<stop offset="1" stopColor={C.purple} />
			</linearGradient>
		</defs>
		<rect width="200" height="200" rx="46" fill="url(#logoBg)" stroke={C.yellow} strokeOpacity=".35" strokeWidth="4" />
		<path d="M100 42 L168 100 L168 160 Q168 168 160 168 L40 168 Q32 168 32 160 L32 100 Z" fill={C.yellow} />
		<path d="M20 106 L100 36 L180 106" fill="none" stroke={C.yellow} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
		<text x="100" y="146" textAnchor="middle" fontFamily={POPPINS} fontWeight={800} fontSize="92" fill={C.indigo}>
			?
		</text>
	</svg>
);
const Scene7Outro: React.FC = () => {
	const f = useCurrentFrame();
	const expr: Expr = f < 52 ? 'penasaran' : 'paham';
	const logoIn = pop(f, 44);
	const pill = pop(f, 84);
	const pulse = 1 + 0.03 * Math.sin(f / 5) * ramp(f, 100, 110);
	return (
		<AbsoluteFill>
			<ReasonBG glow={1.3} />
			<Camera s={lerp(1.14, 1, ramp(f, 0, 150, 0, 1, inOut))} fx={540} fy={760}>
				<Sparkles x={540} y={820} spread={380} n={16} start={52} rise={560} />
				<Kepo x={540} y={850} w={380} expr={expr} scale={pop(f, 2)} dy={Math.sin(f / 9) * 6} />
				<div style={{position: 'absolute', left: 0, width: W, top: 920, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28, opacity: logoIn, transform: `translateY(${(1 - logoIn) * 40}px)`}}>
					<Logo size={150} />
					<div style={{fontFamily: POPPINS, lineHeight: 1.1}}>
						<div style={{fontWeight: 800, fontSize: 60, color: C.white}}>
							Rumah <span style={{color: C.yellow}}>Penasaran</span>
						</div>
						<div style={{fontWeight: 500, fontSize: 34, color: C.white, opacity: 0.8, marginTop: 6}}>@rumahpenasaran</div>
					</div>
				</div>
				<div style={{position: 'absolute', left: 0, width: W, top: 1130, display: 'flex', justifyContent: 'center', opacity: Math.min(1, pill), transform: `scale(${lerp(0.7, 1, pill) * pulse})`}}>
					<div style={{fontFamily: POPPINS, fontWeight: 800, fontSize: 40, color: C.ink, backgroundColor: C.yellow, borderRadius: 60, padding: '18px 48px'}}>FOLLOW biar penasaranmu terjawab</div>
				</div>
			</Camera>
		</AbsoluteFill>
	);
};

/* ============================================================================
 * SUBTITLE  (maks. 7 kata per layar, 1 kata kunci kuning, area aman y 1305–1495)
 * *kata* = kuning · ~kata~ = merah muda
 * ========================================================================== */
type Cue = {from: number; to: number; text: string};
const CUES: Cue[] = [
	// [BAGIAN 1 — HOOK | 00:00–00:04]
	{from: 0.0, to: 1.6, text: '*Kok bisa* ya,'},
	{from: 1.6, to: 4.0, text: 'suara benda jatuh bikin orang ~panik~?'},
	// [BAGIAN 2 — PEMBUKA CERITA | 00:04–00:10]
	{from: 4.0, to: 5.4, text: 'Sebuah *seng* jatuh.'},
	{from: 5.4, to: 6.9, text: 'Suaranya *menggelegar*.'},
	{from: 6.9, to: 8.4, text: 'Semua orang ~panik~.'},
	{from: 8.4, to: 10.0, text: 'Kecuali *Sitara*.'},
	// [BAGIAN 3 — FAKTA | 00:10–00:17]
	{from: 10.0, to: 13.2, text: 'Mereka mendengar *suara* yang sama.'},
	{from: 13.2, to: 14.9, text: 'Namun, hanya *Sitara*'},
	{from: 14.9, to: 17.0, text: 'yang memahami *penyebabnya*.'},
	// [BAGIAN 4 — PENJELASAN ILMIAH | 00:17–00:25]
	{from: 17.0, to: 20.2, text: 'Inilah perbedaan hafalan dan *penalaran*.'},
	{from: 20.2, to: 22.6, text: '*Hafalan* mengenali pola.'},
	{from: 22.6, to: 25.0, text: '*Akal* mencari sebab.'},
	// [BAGIAN 5 — PENERAPAN | 00:25–00:32]
	{from: 25.0, to: 28.5, text: 'Tanpa *fondasi*, ilmu terasa mustahil.'},
	{from: 28.5, to: 32.0, text: 'Tanpa pemahaman, manusia mudah ~tertipu~.'},
	// [BAGIAN 6 — PESAN AL-QUR'AN | 00:32–00:40]
	{from: 32.0, to: 34.1, text: "Al-Qur'an *mengingatkan*:"},
	{from: 34.1, to: 36.2, text: 'jangan mengikuti sesuatu'},
	{from: 36.2, to: 37.7, text: 'tanpa *pengetahuan*.'},
	{from: 37.7, to: 39.1, text: 'Karena berpikir adalah *memahami*,'},
	{from: 39.1, to: 40.0, text: 'bukan sekadar menghafal.'},
	// [BAGIAN 7 — OUTRO | 00:40–00:45]
	{from: 40.0, to: 42.0, text: 'Jadi, jangan buru-buru menyimpulkan.'},
	{from: 42.0, to: 43.3, text: '*Cari tahu* dulu.'},
	{from: 43.3, to: 45.0, text: 'Besok penasaran apa lagi?'},
];

const Subtitles: React.FC = () => {
	const f = useCurrentFrame();
	const cue = CUES.find((c) => f >= t(c.from) && f < t(c.to));
	if (!cue) return null;
	const local = f - t(cue.from);
	const left = t(cue.to) - f;
	const a = ramp(local, 0, 6) * ramp(left, 0, 4, 0, 1, Easing.linear);
	return (
		<div style={{position: 'absolute', left: 60, top: 1305, width: 860, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					opacity: a,
					transform: `translateY(${ramp(local, 0, 8, 16, 0)}px) scale(${lerp(0.96, 1, pop(local, 0, 14, 200))})`,
					backgroundColor: 'rgba(30,27,75,0.74)',
					borderRadius: 30,
					padding: '18px 34px',
					fontFamily: POPPINS,
					fontWeight: 600,
					fontSize: 60,
					lineHeight: 1.2,
					textAlign: 'center',
					color: C.white,
				}}
			>
				<RichText text={cue.text} />
			</div>
		</div>
	);
};

/* ============================================================================
 * PENANDA SCENE
 * ========================================================================== */
const SCENES: {id: number; name: string; start: number; end: number; Comp: React.FC}[] = [
	{id: 1, name: 'HOOK', start: 0, end: 4, Comp: Scene1Hook},
	{id: 2, name: 'PEMBUKA CERITA', start: 4, end: 10, Comp: Scene2Story},
	{id: 3, name: 'FAKTA', start: 10, end: 17, Comp: Scene3Fakta},
	{id: 4, name: 'PENJELASAN ILMIAH', start: 17, end: 25, Comp: Scene4Penjelasan},
	{id: 5, name: 'PENERAPAN', start: 25, end: 32, Comp: Scene5Penerapan},
	{id: 6, name: "PESAN AL-QUR'AN", start: 32, end: 40, Comp: Scene6Quran},
	{id: 7, name: 'OUTRO', start: 40, end: 45, Comp: Scene7Outro},
];

const fmt = (s: number) => `00:${String(Math.floor(s)).padStart(2, '0')}`;
const MarkerOverlay: React.FC = () => {
	const f = useCurrentFrame();
	if (!SHOW_MARKERS) return null;
	const sc = SCENES.find((s) => f >= t(s.start) && f < t(s.end)) ?? SCENES[SCENES.length - 1];
	return (
		<div style={{position: 'absolute', left: 24, top: 24, padding: '8px 16px', borderRadius: 12, backgroundColor: 'rgba(0,0,0,.6)', color: C.white, fontFamily: POPPINS, fontWeight: 600, fontSize: 28}}>
			S{String(sc.id).padStart(2, '0')} · {sc.name} · {fmt(sc.start)}–{fmt(sc.end)} · {(f / FPS).toFixed(1)}s
		</div>
	);
};

const SceneIn: React.FC<{fade: boolean; children: React.ReactNode}> = ({fade, children}) => {
	const f = useCurrentFrame();
	return <AbsoluteFill style={{opacity: fade ? ramp(f, 0, OVERLAP, 0, 1, Easing.linear) : 1}}>{children}</AbsoluteFill>;
};

/* ============================================================================
 * KOMPOSISI UTAMA
 * ========================================================================== */
export const Sitara: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: C.indigo, fontFamily: POPPINS}}>
		{SCENES.map((s, i) => (
			<Sequence key={s.id} from={t(s.start)} durationInFrames={t(s.end - s.start) + (i < SCENES.length - 1 ? OVERLAP : 0)} name={`S${s.id} ${s.name}`}>
				<SceneIn fade={i > 0}>
					<s.Comp />
				</SceneIn>
			</Sequence>
		))}
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(11,10,36,0) 55%, rgba(11,10,36,.55) 100%)'}} />
		<Subtitles />
		<MarkerOverlay />
	</AbsoluteFill>
);

export default Sitara;
