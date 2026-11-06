/**
 * ============================================================================
 *  fisika.tsx — "Membongkar Fisika Jatuh Bebas" | @rumahpenasaran
 * ============================================================================
 *  Tempel file ini ke src/fisika.tsx, lalu daftarkan di src/Root.tsx:
 *
 *    import {Fisika, FISIKA_DURATION, FISIKA_FPS, FISIKA_WIDTH, FISIKA_HEIGHT} from './fisika';
 *
 *    <Composition
 *      id="Fisika"
 *      component={Fisika}
 *      durationInFrames={FISIKA_DURATION}   // 3114 frame
 *      fps={FISIKA_FPS}                     // 30
 *      width={FISIKA_WIDTH}                 // 1080
 *      height={FISIKA_HEIGHT}               // 1920
 *    />
 *
 *  - Tanpa voice over (sesuai permintaan): hanya animasi + subtitle.
 *  - Durasi = 103,8 detik, mengikuti file voice over yang dilampirkan.
 *  - Waktu subtitle & adegan dihitung dari jeda suara pada file WAV.
 *  - Seluruh gambar dibuat dari SVG (tanpa aset eksternal) dan hanya memakai
 *    palet Rumah Penasaran: #1E1B4B, #4C1D95, #FBBF24, #FFFFFF
 *    (+ #FB7185 khusus untuk makna buruk/keraguan).
 *  - Font: Poppins (ExtraBold judul, SemiBold subtitle, Medium pendukung).
 *
 *  Kalau mau menambahkan audio nanti:
 *    <Audio src={staticFile('voice-fisika.wav')} />  (tambahkan di dalam <Fisika />)
 * ============================================================================
 */

import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Poppins';
import sfxMeta from './sfx-meta.json';

const {fontFamily} = loadFont('normal', {
	weights: ['500', '600', '800'],
	subsets: ['latin'],
});

// ---------------------------------------------------------------------------
// KONSTANTA
// ---------------------------------------------------------------------------
export const FISIKA_FPS = 30;
export const FISIKA_WIDTH = 1080;
export const FISIKA_HEIGHT = 1920;
export const FISIKA_DURATION = 3114; // 103,8 detik x 30 fps (sesuai WAV)

const FPS = FISIKA_FPS;
const END = FISIKA_DURATION / FPS;
const ENABLE_SFX = true;

const C = {
	indigo: '#1E1B4B',
	purple: '#4C1D95',
	yellow: '#FBBF24',
	white: '#FFFFFF',
	pink: '#FB7185', // hanya untuk makna buruk / keraguan
};

/**
 * PENANDA BAGIAN (detik) — selaras dengan naskah voice over.
 */
const SECTIONS = {
	hook: [0.0, 10.0], //         BAGIAN 1 — HOOK
	eksperimen: [10.0, 23.1], //  BAGIAN 2 — EKSPERIMEN DIMULAI
	misteri: [23.1, 40.1], //     BAGIAN 3 — MISTERI ANGKA LIMA
	kuadrat: [40.1, 59.5], //     BAGIAN 4 — KENAPA WAKTU DIKUADRATKAN?
	miskonsepsi: [59.5, 76.3], // BAGIAN 5 — MELURUSKAN MISKONSEPSI
	asalLima: [76.3, 91.2], //    BAGIAN 6 — DARI MANA ANGKA LIMA BERASAL?
	penutup: [91.2, END], //      BAGIAN 7 — PENUTUP
} as const;

// ---------------------------------------------------------------------------
// SUBTITLE  [mulai, selesai, teks, frasa kunci (kuning)]
// Maks. 7 kata per layar.
// ---------------------------------------------------------------------------
type Chunk = [number, number, string, string];

const SUBTITLES: Chunk[] = [
	// ===== BAGIAN 1 — HOOK =====
	[0.0, 0.9, 'Kok bisa ya', 'Kok bisa'],
	[0.9, 2.1, 'tinggi sebuah tebing diukur', 'tebing'],
	[2.1, 3.45, 'hanya dengan menjatuhkan batu', 'batu'],
	[3.45, 4.48, 'dan menghitung waktunya', 'waktunya'],
	[5.12, 6.04, 'Tanpa meteran', 'meteran'],
	[6.04, 7.7, 'tanpa alat pengukur canggih', 'canggih'],
	[8.1, 9.62, 'Cuma bermodalkan stopwatch', 'stopwatch'],

	// ===== BAGIAN 2 — EKSPERIMEN DIMULAI =====
	[10.36, 11.96, 'Bayangkan seorang pendaki berdiri', 'pendaki'],
	[11.96, 12.62, 'di atas tebing', 'tebing'],
	[13.12, 14.63, 'Dia menjatuhkan sebuah batu', 'batu'],
	[14.63, 15.72, 'lalu menyalakan stopwatch', 'stopwatch'],
	[16.5, 17.42, 'Tiga detik kemudian', 'Tiga detik'],
	[17.42, 18.92, 'terdengar suara benturan dari bawah', 'benturan'],
	[19.58, 21.16, 'Tapi bagaimana mungkin tiga detik bisa', 'tiga detik'],
	[21.16, 22.56, 'memberi tahu kita ketinggian tebing', 'ketinggian'],

	// ===== BAGIAN 3 — MISTERI ANGKA LIMA =====
	[23.7, 25.72, 'Ternyata ada trik matematika yang menarik', 'trik matematika'],
	[26.3, 28.1, 'Kalikan waktu dengan dirinya sendiri', 'dirinya sendiri'],
	[28.1, 29.34, 'kemudian kalikan lima', 'lima'],
	[30.04, 32.08, 'Tiga dikali tiga sama dengan sembilan', 'sembilan'],
	[32.48, 34.87, 'Lalu sembilan dikali lima menghasilkan', 'dikali lima'],
	[34.87, 36.24, 'empat puluh lima meter', 'empat puluh lima'],
	[36.54, 37.68, 'Kepo pun terkejut', 'terkejut'],
	[38.1, 39.6, 'Kok bisa sesederhana itu', 'sesederhana'],

	// ===== BAGIAN 4 — KENAPA WAKTU DIKUADRATKAN? =====
	[40.58, 42.06, 'Rahasianya ada pada gravitasi', 'gravitasi'],
	[42.7, 43.96, 'Saat batu dilepaskan', 'dilepaskan'],
	[43.96, 45.22, 'kecepatannya masih nol', 'nol'],
	[45.68, 47.3, 'Tapi bumi terus menariknya ke bawah', 'menariknya'],
	[47.98, 48.58, 'Setiap detik', 'Setiap detik'],
	[48.58, 50.54, 'kecepatannya bertambah sekitar sepuluh', 'sepuluh'],
	[50.54, 51.24, 'meter per sekon', 'sekon'],
	[51.9, 53.4, 'Artinya batu menempuh jarak yang', 'jarak'],
	[53.4, 54.9, 'semakin jauh setiap detiknya', 'semakin jauh'],
	[55.58, 57.41, 'Itulah sebabnya waktu harus dikuadratkan', 'dikuadratkan'],
	[57.41, 59.04, 'bukan sekadar dikalikan lima', 'dikalikan lima'],

	// ===== BAGIAN 5 — MELURUSKAN MISKONSEPSI =====
	[60.02, 61.87, 'Lalu apakah batu yang lebih berat', 'lebih berat'],
	[61.87, 63.1, 'akan jatuh lebih cepat', 'lebih cepat'],
	[63.78, 64.6, 'Ternyata tidak', 'tidak'],
	[64.88, 66.92, 'Jika hambatan udara diabaikan', 'hambatan udara'],
	[66.92, 68.97, 'benda dengan massa berbeda mengalami', 'massa berbeda'],
	[68.97, 70.7, 'percepatan gravitasi yang sama', 'sama'],
	[70.7, 72.42, 'Jadi batu berat dan batu ringan', 'batu ringan'],
	[72.42, 74.63, 'bisa tiba bersamaan jika dilepaskan', 'bersamaan'],
	[74.63, 76.04, 'dari ketinggian yang sama', 'sama'],

	// ===== BAGIAN 6 — DARI MANA ANGKA LIMA BERASAL? =====
	[76.5, 77.96, 'Angka lima bukan angka ajaib', 'ajaib'],
	[78.32, 80.02, 'Gravitasi bumi besarnya sekitar', 'Gravitasi'],
	[80.02, 81.15, 'sembilan koma delapan', 'sembilan koma delapan'],
	[81.15, 82.28, 'meter per sekon kuadrat', 'kuadrat'],
	[82.76, 84.78, 'Setengahnya adalah empat koma sembilan', 'empat koma sembilan'],
	[84.78, 86.45, 'yang dibulatkan menjadi lima', 'dibulatkan'],
	[86.45, 87.62, 'agar mudah dihitung', 'mudah'],
	[88.02, 89.75, 'Maka rumus praktisnya adalah lima', 'rumus'],
	[89.75, 90.9, 'dikali waktu kuadrat', 'kuadrat'],

	// ===== BAGIAN 7 — PENUTUP =====
	[91.5, 93.49, 'Tapi ingat hasilnya hanya perkiraan', 'perkiraan'],
	[93.49, 95.03, 'karena hambatan udara', 'hambatan udara'],
	[95.03, 96.25, 'dan ketepatan stopwatch', 'stopwatch'],
	[96.25, 97.94, 'bisa memengaruhi pengukuran', 'pengukuran'],
	[98.24, 100.23, 'Ternyata fisika punya banyak trik menarik', 'fisika'],
	[100.23, 101.8, 'yang dekat dengan kehidupan kita', 'kehidupan'],
	[102.36, END, 'Besok penasaran apa lagi', 'penasaran'],
];

// ---------------------------------------------------------------------------
// UTILITAS WAKTU & ANIMASI
// ---------------------------------------------------------------------------
const sf = (sec: number) => Math.round(sec * FPS);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = Easing.out(Easing.cubic);
const easeIO = Easing.inOut(Easing.cubic);

/** progres 0..1 antara detik a dan b */
const ramp = (t: number, a: number, b: number, easing?: (x: number) => number) =>
	interpolate(t, [a, b], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing,
	});

/** pegas muncul (0 sebelum `at`, lalu 0 -> 1 dengan sedikit pantulan) */
const sp = (t: number, at: number, damping = 13, stiffness = 160) =>
	t < at
		? 0
		: spring({
				frame: (t - at) * FPS,
				fps: FPS,
				config: {damping, stiffness, mass: 0.7},
		  });

/** 1 saat di dalam jendela [a,b], dengan fade di tepi */
const window01 = (t: number, a: number, b: number, fade = 0.25) =>
	Math.min(ramp(t, a, a + fade), 1 - ramp(t, b - fade, b));

const T0 = createContext(0);
/** waktu absolut (detik) dari awal video, juga di dalam <Sequence> */
const useT = () => {
	const f = useCurrentFrame();
	return useContext(T0) + f / FPS;
};

const pick = <V,>(t: number, list: Array<[number, V]>): V => {
	let out = list[0][1];
	for (const [at, v] of list) {
		if (t >= at) out = v;
	}
	return out;
};

// ---------------------------------------------------------------------------
// ADEGAN & KOMPONEN DASAR
// ---------------------------------------------------------------------------
const SceneFade: React.FC<{
	dur: number;
	fadeIn: boolean;
	fadeOut: boolean;
	children: React.ReactNode;
}> = ({dur, fadeIn, fadeOut, children}) => {
	const f = useCurrentFrame();
	const d = dur * FPS;
	const a = fadeIn ? interpolate(f, [0, 9], [0, 1], {extrapolateRight: 'clamp'}) : 1;
	const b = fadeOut ? interpolate(f, [d - 9, d], [1, 0], {extrapolateLeft: 'clamp'}) : 1;
	return <AbsoluteFill style={{opacity: Math.min(a, b)}}>{children}</AbsoluteFill>;
};

const Scene: React.FC<{
	range: readonly [number, number];
	fadeIn?: boolean;
	fadeOut?: boolean;
	children: React.ReactNode;
}> = ({range, fadeIn = true, fadeOut = true, children}) => {
	const from = sf(range[0]);
	const to = Math.min(sf(range[1]), FISIKA_DURATION);
	return (
		<Sequence from={from} durationInFrames={to - from} layout="none">
			<T0.Provider value={from / FPS}>
				<SceneFade dur={(to - from) / FPS} fadeIn={fadeIn} fadeOut={fadeOut}>
					{children}
				</SceneFade>
			</T0.Provider>
		</Sequence>
	);
};

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg
		width={FISIKA_WIDTH}
		height={FISIKA_HEIGHT}
		viewBox={`0 0 ${FISIKA_WIDTH} ${FISIKA_HEIGHT}`}
		style={{position: 'absolute', left: 0, top: 0}}
	>
		<defs>
			<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur stdDeviation="10" result="b" />
				<feMerge>
					<feMergeNode in="b" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
			<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={C.indigo} />
				<stop offset="1" stopColor={C.purple} />
			</linearGradient>
			<radialGradient id="halo">
				<stop offset="0" stopColor={C.yellow} stopOpacity="0.55" />
				<stop offset="1" stopColor={C.yellow} stopOpacity="0" />
			</radialGradient>
		</defs>
		{children}
	</svg>
);

/** Judul di area aman atas (y 262+) — maksimal 7 kata. */
const Headline: React.FC<{
	text: string;
	hl?: string;
	at: number;
	until?: number;
	size?: number;
	top?: number;
}> = ({text, hl, at, until = 9999, size = 72, top = 262}) => {
	const t = useT();
	const s = sp(t, at);
	const out = until < 9999 ? 1 - ramp(t, until, until + 0.3) : 1;
	if (s <= 0.001 || out <= 0.001) return null;
	const i = hl ? text.indexOf(hl) : -1;
	const before = i >= 0 ? text.slice(0, i) : text;
	const mid = i >= 0 && hl ? hl : '';
	const after = i >= 0 && hl ? text.slice(i + hl.length) : '';
	return (
		<div
			style={{
				position: 'absolute',
				left: 60,
				right: 60,
				top,
				textAlign: 'center',
				fontFamily,
				fontWeight: 800,
				fontSize: size,
				lineHeight: 1.15,
				color: C.white,
				opacity: clamp01(s * 1.5) * out,
				transform: `translateY(${(1 - s) * 30}px)`,
			}}
		>
			{before}
			<span style={{color: C.yellow}}>{mid}</span>
			{after}
		</div>
	);
};

const Stars: React.FC<{t: number}> = ({t}) => (
	<g>
		{Array.from({length: 36}).map((_, i) => (
			<circle
				key={i}
				cx={(i * 263 + 71) % 1080}
				cy={(i * 149 + 37) % 1100}
				r={2 + (i % 3)}
				fill={C.white}
				opacity={0.25 + 0.35 * Math.abs(Math.sin(t * 1.4 + i))}
			/>
		))}
	</g>
);

/** latar "ruang visualisasi fisika" (Latar C) */
const PhysicsBg: React.FC<{t: number}> = ({t}) => (
	<g>
		<rect x={0} y={0} width={1080} height={1920} fill={C.indigo} />
		{Array.from({length: 11}).map((_, r) =>
			Array.from({length: 7}).map((__, c) => (
				<circle
					key={`${r}-${c}`}
					cx={80 + c * 150 + (r % 2) * 75}
					cy={300 + r * 130}
					r={3}
					fill={C.white}
					opacity={0.08 + 0.06 * Math.sin(t * 1.2 + r + c)}
				/>
			))
		)}
		<circle cx={540} cy={800} r={520} fill={C.purple} opacity={0.28} />
	</g>
);

// ---------------------------------------------------------------------------
// EFEK
// ---------------------------------------------------------------------------
const Burst: React.FC<{x: number; y: number; t: number; at: number; n?: number; size?: number}> = ({
	x,
	y,
	t,
	at,
	n = 14,
	size = 150,
}) => {
	const p = ramp(t, at, at + 0.9, easeOut);
	if (t < at || p >= 1) return null;
	return (
		<g>
			<circle cx={x} cy={y} r={20 + size * p} fill="none" stroke={C.yellow} strokeWidth={8 * (1 - p) + 1} opacity={1 - p} />
			<circle cx={x} cy={y} r={20 + size * 1.5 * p} fill="none" stroke={C.white} strokeWidth={3} opacity={(1 - p) * 0.6} />
			{Array.from({length: n}).map((_, i) => {
				const a = (i / n) * Math.PI * 2 + (i % 2) * 0.2;
				const d = size * (0.5 + 0.7 * p) * (0.7 + (i % 3) * 0.2);
				return (
					<circle
						key={i}
						cx={x + Math.cos(a) * d}
						cy={y + Math.sin(a) * d * 0.7}
						r={Math.max(0, 9 * (1 - p))}
						fill={i % 2 ? C.yellow : C.white}
						opacity={1 - p}
					/>
				);
			})}
		</g>
	);
};

const Rock: React.FC<{cx: number; cy: number; r: number; rot?: number; opacity?: number}> = ({
	cx,
	cy,
	r,
	rot = 0,
	opacity = 1,
}) => (
	<g transform={`translate(${cx} ${cy}) rotate(${rot})`} opacity={opacity}>
		<path
			d={`M${-r} ${r * 0.2} L${-r * 0.6} ${-r * 0.8} L${r * 0.4} ${-r * 0.92} L${r} ${-r * 0.1} L${r * 0.7} ${r * 0.8} L${-r * 0.3} ${r * 0.92}Z`}
			fill={C.white}
			fillOpacity={0.72}
			stroke={C.white}
			strokeWidth={3}
			strokeLinejoin="round"
		/>
		<path
			d={`M${r} ${-r * 0.1} L${r * 0.7} ${r * 0.8} L${-r * 0.3} ${r * 0.92} L${r * 0.1} ${r * 0.1}Z`}
			fill={C.indigo}
			fillOpacity={0.28}
		/>
	</g>
);

const Chip: React.FC<{
	x: number;
	y: number;
	w: number;
	text: string;
	at: number;
	until?: number;
	color?: string;
}> = ({x, y, w, text, at, until = 9999, color = C.yellow}) => {
	const t = useT();
	const s = sp(t, at);
	const o = (until < 9999 ? 1 - ramp(t, until, until + 0.3) : 1) * clamp01(s * 2);
	if (o <= 0.001) return null;
	return (
		<g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * s})`} opacity={o}>
			<rect x={-w / 2} y={-40} width={w} height={80} rx={40} fill={C.purple} stroke={color} strokeWidth={4} />
			<text x={0} y={13} textAnchor="middle" fontFamily={fontFamily} fontWeight={600} fontSize={36} fill={C.white}>
				{text}
			</text>
		</g>
	);
};

// ---------------------------------------------------------------------------
// MASKOT: KEPO
// ---------------------------------------------------------------------------
type Expr = 'penasaran' | 'kaget' | 'mikir' | 'paham';

const Kepo: React.FC<{
	x: number;
	y: number;
	s?: number;
	expr: Expr;
	t: number;
	enterAt?: number;
	popAt?: number;
	look?: number; // -1 kiri .. 1 kanan
	nod?: number; // amplitudo anggukan
}> = ({x, y, s = 1, expr, t, enterAt = -1, popAt, look = 0, nod = 0}) => {
	const enter = sp(t, enterAt);
	if (enter <= 0.001) return null;
	const bob = Math.sin(t * 2.6) * 6 + (nod ? Math.sin(t * 9) * nod : 0);
	const pop = popAt !== undefined && t >= popAt ? 1 + 0.22 * (1 - sp(t, popAt, 10, 200)) : 1;
	const blink = expr !== 'paham' && expr !== 'kaget' && t % 3.4 > 3.28;
	const eyeSy = blink ? 0.12 : 1;
	const antRot =
		expr === 'penasaran' ? -16 + Math.sin(t * 3) * 3 : expr === 'mikir' ? Math.sin(t * 4) * 10 : 0;

	let eyes: React.ReactNode;
	if (expr === 'paham') {
		eyes = (
			<g stroke={C.indigo} strokeWidth={9} strokeLinecap="round" fill="none">
				<path d="M-62 -8 Q-40 -38 -18 -8" />
				<path d="M18 -8 Q40 -38 62 -8" />
			</g>
		);
	} else {
		const r = expr === 'kaget' ? 40 : 30;
		const ex = expr === 'kaget' ? 40 : 38;
		const ey = expr === 'kaget' ? -16 : -14;
		const pr = expr === 'kaget' ? 9 : expr === 'mikir' ? 12 : 13;
		const px = expr === 'mikir' ? 10 + look * 4 : look * (expr === 'kaget' ? 4 : 8);
		const py = expr === 'mikir' ? -12 : expr === 'kaget' ? 0 : 6;
		eyes = (
			<g>
				{[-1, 1].map((d) => (
					<g key={d} transform={`translate(${d * ex} ${ey}) scale(1 ${eyeSy})`}>
						<circle r={r} fill={C.white} />
						<circle cx={px} cy={py} r={pr} fill={C.indigo} />
						<circle cx={px + 4} cy={py - 4} r={4} fill={C.white} />
					</g>
				))}
			</g>
		);
	}

	let mouth: React.ReactNode;
	if (expr === 'kaget') {
		mouth = <ellipse cx={0} cy={50} rx={14} ry={19} fill={C.indigo} />;
	} else if (expr === 'paham') {
		mouth = <path d="M-22 34 Q0 66 22 34 Z" fill={C.indigo} />;
	} else if (expr === 'mikir') {
		mouth = <path d="M-15 46 Q-6 38 2 46 T17 44" stroke={C.indigo} strokeWidth={6} fill="none" strokeLinecap="round" />;
	} else {
		mouth = <path d="M-12 40 Q0 50 12 40" stroke={C.indigo} strokeWidth={6} fill="none" strokeLinecap="round" />;
	}

	const glowPulse = 0.7 + 0.3 * Math.sin(t * 6);
	return (
		<g transform={`translate(${x} ${y + bob * s}) scale(${s * enter * pop})`}>
			<circle r={190} fill="url(#halo)" opacity={expr === 'paham' ? 0.8 : 0.35} />
			{/* antena tanda tanya (jadi tanda seru menyala saat paham) */}
			<g transform={`rotate(${antRot} 0 -88)`}>
				{expr === 'paham' ? (
					<g>
						<circle cx={0} cy={-150} r={78 * glowPulse} fill="url(#halo)" />
						<g filter="url(#glow)">
							<line x1={0} y1={-198} x2={0} y2={-134} stroke={C.yellow} strokeWidth={15} strokeLinecap="round" />
							<circle cx={0} cy={-106} r={9} fill={C.yellow} />
						</g>
					</g>
				) : (
					<g transform={expr === 'kaget' ? 'scale(1.12)' : undefined}>
						<path
							d="M-26 -156 C-26 -198 30 -198 30 -160 C30 -136 2 -134 2 -116"
							stroke={C.yellow}
							strokeWidth={13}
							fill="none"
							strokeLinecap="round"
						/>
						<circle cx={2} cy={-98} r={8} fill={C.yellow} />
					</g>
				)}
			</g>
			{/* badan bohlam gemuk */}
			<circle r={90} fill={C.yellow} />
			<ellipse cx={-34} cy={-46} rx={22} ry={14} fill={C.white} opacity={0.28} transform="rotate(-30 -34 -46)" />
			<rect x={-36} y={84} width={72} height={38} rx={12} fill={C.purple} stroke={C.white} strokeOpacity={0.8} strokeWidth={3} />
			<path d="M-30 98 H30 M-26 110 H26" stroke={C.white} strokeOpacity={0.6} strokeWidth={3} />
			<ellipse cx={-98} cy={26} rx={15} ry={22} fill={C.yellow} transform={`rotate(${expr === 'kaget' ? 50 : 20} -98 26)`} />
			<ellipse cx={98} cy={26} rx={15} ry={22} fill={C.yellow} transform={`rotate(${expr === 'kaget' ? -50 : -20} 98 26)`} />
			{eyes}
			{mouth}
		</g>
	);
};

// ---------------------------------------------------------------------------
// KARAKTER: PENDAKI  (kaki di titik 0,0; tinggi ±330)
// ---------------------------------------------------------------------------
const ARM = 120;
const handOffset = (deg: number) => ({
	x: 30 + ARM * Math.sin((deg * Math.PI) / 180),
	y: -228 + ARM * Math.cos((deg * Math.PI) / 180),
});

const OUT = {stroke: C.white, strokeOpacity: 0.55, strokeWidth: 3};

const Pendaki: React.FC<{
	x: number;
	y: number;
	s?: number;
	arm?: number;
	phone?: number;
	t: number;
	enterAt?: number;
}> = ({x, y, s = 1, arm = 10, phone = 0, t, enterAt = -1}) => {
	const enter = sp(t, enterAt);
	if (enter <= 0.001) return null;
	const h = handOffset(arm);
	const breathe = Math.sin(t * 2) * 2;
	return (
		<g transform={`translate(${x} ${y}) scale(${s}) translate(0 ${(1 - enter) * 40})`} opacity={clamp01(enter * 1.5)}>
			{/* kaki + sepatu gunung */}
			<rect x={-34} y={-130} width={30} height={118} rx={14} fill={C.indigo} {...OUT} />
			<rect x={4} y={-130} width={30} height={118} rx={14} fill={C.indigo} {...OUT} />
			<rect x={-42} y={-18} width={46} height={18} rx={9} fill={C.white} />
			<rect x={0} y={-18} width={50} height={18} rx={9} fill={C.white} />
			<rect x={-42} y={-6} width={46} height={6} rx={3} fill={C.yellow} />
			<rect x={0} y={-6} width={50} height={6} rx={3} fill={C.yellow} />
			<g transform={`translate(0 ${breathe})`}>
				{/* tas ransel kuning */}
				<rect x={-74} y={-240} width={46} height={110} rx={16} fill={C.yellow} />
				<rect x={-70} y={-170} width={38} height={50} rx={10} fill={C.yellow} stroke={C.indigo} strokeOpacity={0.3} strokeWidth={3} />
				{/* lengan belakang */}
				<line x1={-26} y1={-226} x2={-32} y2={-150} stroke={C.yellow} strokeOpacity={0.55} strokeWidth={32} strokeLinecap="round" />
				<line x1={-26} y1={-226} x2={-32} y2={-150} stroke={C.purple} strokeWidth={26} strokeLinecap="round" />
				{/* jaket ungu gelap */}
				<rect x={-46} y={-252} width={92} height={136} rx={30} fill={C.purple} stroke={C.yellow} strokeOpacity={0.55} strokeWidth={4} />
				<path d="M8 -246 V-122" stroke={C.white} strokeOpacity={0.5} strokeWidth={4} />
				{/* kepala */}
				<circle cx={6} cy={-292} r={40} fill={C.white} />
				<path
					d="M-34 -296 A40 40 0 0 1 46 -296 Q30 -322 6 -318 Q-20 -322 -34 -296Z"
					fill={C.indigo}
					stroke={C.white}
					strokeOpacity={0.6}
					strokeWidth={3}
				/>
				<circle cx={26} cy={-290} r={5} fill={C.indigo} />
				<path d="M16 -272 Q28 -262 38 -274" stroke={C.indigo} strokeWidth={4} fill="none" strokeLinecap="round" />
				{/* lengan depan */}
				<line x1={30} y1={-228} x2={h.x} y2={h.y} stroke={C.yellow} strokeOpacity={0.55} strokeWidth={32} strokeLinecap="round" />
				<line x1={30} y1={-228} x2={h.x} y2={h.y} stroke={C.purple} strokeWidth={26} strokeLinecap="round" />
				{phone > 0.01 && (
					<g opacity={phone} transform={`translate(${h.x} ${h.y - 6}) rotate(-8) scale(${0.6 + 0.4 * phone})`}>
						<rect x={-14} y={-50} width={28} height={52} rx={7} fill={C.indigo} stroke={C.white} strokeWidth={3} />
						<rect x={-9} y={-44} width={18} height={14} rx={3} fill={C.yellow} />
					</g>
				)}
				<circle cx={h.x} cy={h.y} r={14} fill={C.white} />
			</g>
		</g>
	);
};

// ---------------------------------------------------------------------------
// LATAR TEBING (Latar A)
// ---------------------------------------------------------------------------
const CliffTop: React.FC<{L: number; t: number}> = ({L, t}) => (
	<g>
		<rect x={-400} y={-400} width={1900} height={3200} fill="url(#sky)" />
		<Stars t={t} />
		{/* bulan / cahaya kuning lembut */}
		<circle cx={880} cy={L - 330} r={230} fill="url(#halo)" />
		<circle cx={880} cy={L - 330} r={62} fill={C.yellow} opacity={0.9} />
		{/* punggung bukit jauh */}
		<path
			d={`M560 ${L + 130} L690 ${L + 20} L800 ${L + 100} L910 ${L - 10} L1080 ${L + 110} L1500 ${L + 110} L1500 2800 L560 2800Z`}
			fill={C.purple}
			opacity={0.55}
		/>
		<path
			d={`M600 ${L + 330} L740 ${L + 200} L870 ${L + 290} L1000 ${L + 190} L1080 ${L + 250} L1500 ${L + 250} L1500 2800 L600 2800Z`}
			fill={C.indigo}
			opacity={0.75}
		/>
		{/* dasar lembah */}
		<rect x={560} y={L + 900} width={940} height={1900} fill={C.indigo} />
		{[640, 720, 810, 900, 990].map((tx, i) => (
			<path
				key={tx}
				d={`M${tx} ${L + 900} L${tx + 18} ${L + 900 - 60 - (i % 3) * 22} L${tx + 36} ${L + 900}Z`}
				fill={C.purple}
			/>
		))}
		{/* tebing */}
		<path
			d={`M-400 ${L} L560 ${L} L575 ${L + 30} L560 ${L + 90} L590 ${L + 170} L565 ${L + 260} L600 ${L + 380} L570 ${L + 520} L610 ${L + 700} L580 ${L + 900} L600 2800 L-400 2800Z`}
			fill={C.purple}
		/>
		<path
			d={`M300 ${L + 60} L575 ${L + 30} L560 ${L + 90} L590 ${L + 170} L565 ${L + 260} L600 ${L + 380} L570 ${L + 520} L610 ${L + 700} L580 ${L + 900} L600 2800 L300 2800Z`}
			fill={C.indigo}
			opacity={0.35}
		/>
		{[150, 260, 380, 500].map((d, i) => (
			<path key={d} d={`M${60 + i * 40} ${L + d} L${430 + (i % 2) * 60} ${L + d + 14}`} stroke={C.indigo} strokeWidth={5} opacity={0.4} />
		))}
		<line x1={-400} y1={L} x2={560} y2={L} stroke={C.yellow} strokeWidth={6} opacity={0.75} />
	</g>
);

// ---------------------------------------------------------------------------
// BAGIAN 1 — HOOK (0:00–0:10)
// ---------------------------------------------------------------------------
const S1: React.FC = () => {
	const t = useT();
	const L = 1000;
	const z = ramp(t, 4.4, 9.8, easeIO);
	const sc = 1 + 0.8 * z;
	const fx = 540 + 150 * z;
	const fy = 960 + 520 * z;
	return (
		<>
			<Svg>
				<g transform={`translate(540 960) scale(${sc}) translate(${-fx} ${-fy})`}>
					<CliffTop L={L} t={t} />
					<Pendaki x={250} y={L} s={0.95} arm={10} t={t} enterAt={0.1} />
					<Kepo x={470} y={L - 61} s={0.5} expr="penasaran" t={t} enterAt={0.4} look={0.5} />
				</g>
			</Svg>
			<Headline text="Kenapa tinggi tebing bisa diukur dengan batu?" hl="batu?" at={0.2} until={4.3} size={82} />
			<Headline text="Cuma modal stopwatch!" hl="stopwatch!" at={8.0} />
		</>
	);
};

// ---------------------------------------------------------------------------
// BAGIAN 2 — EKSPERIMEN DIMULAI (0:10–0:23)
// ---------------------------------------------------------------------------
const StopwatchCard: React.FC<{x: number; y: number; value: number; at: number; t: number}> = ({x, y, value, at, t}) => {
	const s = sp(t, at);
	if (s <= 0.001) return null;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`} opacity={clamp01(s * 2)}>
			<rect x={-200} y={-165} width={400} height={330} rx={48} fill={C.purple} stroke={C.white} strokeWidth={5} />
			<rect x={-168} y={-132} width={336} height={264} rx={28} fill={C.indigo} />
			<text x={0} y={-82} textAnchor="middle" fontFamily={fontFamily} fontWeight={600} fontSize={28} fill={C.white} opacity={0.75}>
				STOPWATCH
			</text>
			<text x={0} y={42} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={128} fill={C.yellow}>
				{value.toFixed(2)}
			</text>
			<text x={0} y={100} textAnchor="middle" fontFamily={fontFamily} fontWeight={500} fontSize={34} fill={C.white}>
				detik
			</text>
		</g>
	);
};

const S2: React.FC = () => {
	const t = useT();
	const L = 700; // puncak tebing
	const F = 1230; // dasar lembah
	const px = 290;
	const ps = 0.8;
	const T_REL = 14.63; // batu dilepas + stopwatch jalan
	const T_HIT = 18.92; // batu menghantam dasar
	const arm = interpolate(t, [12.9, 13.9, 14.8, 15.7], [8, 85, 85, 8], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeIO,
	});
	const hs = handOffset(85);
	const rockX = px + ps * hs.x;
	const rockY0 = L + ps * (hs.y + 18);
	const rockEnd = F - 15;
	const p = clamp01((t - T_REL) / (T_HIT - T_REL));
	const rockY = t < T_REL ? rockY0 : rockY0 + (rockEnd - rockY0) * p * p;
	const rockIn = sp(t, 13.2);
	const value = 3 * p;
	const kepoExpr = pick<Expr>(t, [
		[0, 'penasaran'],
		[T_HIT, 'kaget'],
		[19.8, 'mikir'],
	]);
	const dim = sp(t, 19.9);
	return (
		<>
			<Svg>
				<rect x={0} y={0} width={1080} height={1920} fill="url(#sky)" />
				<Stars t={t} />
				<circle cx={880} cy={1000} r={200} fill="url(#halo)" opacity={0.5} />
				{/* lantai lembah + pepohonan (patokan jarak) */}
				<rect x={0} y={F} width={1080} height={700} fill={C.indigo} />
				<line x1={0} y1={F} x2={1080} y2={F} stroke={C.purple} strokeWidth={8} />
				{[620, 720, 830, 930].map((tx, i) => {
					const th = [120, 165, 110, 150][i];
					return (
						<path
							key={tx}
							d={`M${tx} ${F} L${tx + 30} ${F - th} L${tx + 60} ${F}Z`}
							fill={C.purple}
							stroke={C.white}
							strokeOpacity={0.25}
							strokeWidth={3}
						/>
					);
				})}
				{/* tebing */}
				<path
					d={`M-20 ${L} L372 ${L} L360 ${L + 70} L372 ${L + 150} L358 ${L + 230} L370 ${L + 330} L360 ${L + 430} L372 ${F} L-20 ${F}Z`}
					fill={C.purple}
				/>
				{[110, 220, 330, 440].map((d, i) => (
					<path key={d} d={`M${40 + i * 30} ${L + d} L340 ${L + d + 12}`} stroke={C.indigo} strokeWidth={5} opacity={0.4} />
				))}
				<line x1={-20} y1={L} x2={372} y2={L} stroke={C.yellow} strokeWidth={6} opacity={0.75} />

				<Pendaki x={px} y={L} s={ps} arm={arm} t={t} enterAt={10.4} />
				<Kepo x={120} y={L - 61} s={0.5} expr={kepoExpr} t={t} enterAt={10.7} look={0.9} popAt={T_HIT} />

				{/* batu */}
				{rockIn > 0.001 && <Rock cx={rockX} cy={rockY} r={15 * Math.min(1, rockIn)} rot={t >= T_REL ? p * 540 : 0} />}
				<Burst x={rockX} y={F - 8} t={t} at={T_HIT} />
				{t >= T_HIT && t < T_HIT + 1.1 && (
					<g
						transform={`translate(${rockX + 110} ${F - 100 - 20 * ramp(t, T_HIT, T_HIT + 0.5, easeOut)}) rotate(-8)`}
						opacity={1 - ramp(t, T_HIT + 0.6, T_HIT + 1.1)}
					>
						<text x={0} y={0} fontFamily={fontFamily} fontWeight={800} fontSize={68} fill={C.yellow}>
							DUK!
						</text>
					</g>
				)}

				<StopwatchCard x={780} y={620} value={value} at={14.0} t={t} />

				{/* tanda tanya tinggi tebing */}
				{dim > 0.001 && (
					<g opacity={clamp01(dim * 2)}>
						<line x1={500} y1={L} x2={500} y2={F} stroke={C.yellow} strokeWidth={5} strokeDasharray="14 12" />
						<path d={`M486 ${L + 22} L500 ${L} L514 ${L + 22}`} stroke={C.yellow} strokeWidth={5} fill="none" strokeLinecap="round" />
						<path d={`M486 ${F - 22} L500 ${F} L514 ${F - 22}`} stroke={C.yellow} strokeWidth={5} fill="none" strokeLinecap="round" />
						<g transform={`translate(530 ${(L + F) / 2 + 18}) scale(${dim})`}>
							<text x={0} y={0} fontFamily={fontFamily} fontWeight={800} fontSize={64} fill={C.yellow}>
								? meter
							</text>
						</g>
					</g>
				)}
			</Svg>
			<Headline text="Jatuhkan batu, hitung waktunya" hl="waktunya" at={10.6} until={19.4} size={68} />
			<Headline text="3 detik, berapa meter?" hl="meter?" at={19.7} size={68} />
		</>
	);
};

// ---------------------------------------------------------------------------
// BAGIAN 3 — MISTERI ANGKA LIMA (0:23–0:40)
// ---------------------------------------------------------------------------
const Tok: React.FC<{
	x: number;
	y: number;
	at: number;
	t: number;
	size: number;
	color?: string;
	children: React.ReactNode;
}> = ({x, y, at, t, size, color = C.white, children}) => {
	const s = sp(t, at, 11, 170);
	if (s <= 0.001) return null;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`} opacity={clamp01(s * 2)}>
			<text
				x={0}
				y={0}
				textAnchor="middle"
				fontFamily={fontFamily}
				fontWeight={800}
				fontSize={size}
				fill={color}
				filter={color === C.yellow ? 'url(#glow)' : undefined}
			>
				{children}
			</text>
		</g>
	);
};

const S3: React.FC = () => {
	const t = useT();
	const kepoExpr = pick<Expr>(t, [
		[0, 'penasaran'],
		[35.3, 'kaget'],
		[38.0, 'mikir'],
	]);
	const row2a = window01(t, 30.2, 33.0);
	const row2b = ramp(t, 33.0, 33.3);
	const res = sp(t, 35.2, 10, 150);
	return (
		<>
			<Svg>
				<PhysicsBg t={t} />
				<Chip x={540} y={500} w={520} text="waktu = 3 detik" at={24.3} />

				{/* 3 x 3 x 5 */}
				<Tok x={270} y={720} at={26.3} t={t} size={150}>3</Tok>
				<Tok x={405} y={715} at={27.1} t={t} size={120} color={C.yellow}>×</Tok>
				<Tok x={540} y={720} at={27.4} t={t} size={150}>3</Tok>
				<Tok x={680} y={715} at={28.7} t={t} size={120} color={C.yellow}>×</Tok>
				<Tok x={815} y={720} at={28.9} t={t} size={150} color={C.yellow}>5</Tok>

				{/* langkah 1: 3 x 3 = 9 */}
				<g opacity={row2a}>
					<text x={540} y={880} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={104} fill={C.white}>
						3 × 3 = <tspan fill={C.yellow}>9</tspan>
					</text>
				</g>
				{/* langkah 2: 9 x 5 = 45 */}
				<g opacity={row2b}>
					<text x={540} y={880} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={104} fill={C.white}>
						9 × 5 = <tspan fill={C.yellow}>{t >= 35.2 ? '45' : '?'}</tspan>
					</text>
				</g>

				{/* hasil */}
				{res > 0.001 && (
					<g transform={`translate(540 1010) scale(${res})`} opacity={clamp01(res * 2)}>
						<text
							x={0}
							y={0}
							textAnchor="middle"
							fontFamily={fontFamily}
							fontWeight={800}
							fontSize={122}
							fill={C.yellow}
							filter="url(#glow)"
						>
							45 <tspan fill={C.white}>METER</tspan>
						</text>
					</g>
				)}
				<Burst x={540} y={960} t={t} at={35.2} n={18} size={260} />

				<Kepo x={540} y={1150} s={0.62} expr={kepoExpr} t={t} enterAt={23.6} popAt={35.3} />
			</Svg>
			<Headline text="Misteri angka lima" hl="lima" at={23.7} size={76} />
		</>
	);
};

// ---------------------------------------------------------------------------
// BAGIAN 4 — KENAPA WAKTU DIKUADRATKAN? (0:40–0:59)
// ---------------------------------------------------------------------------
const S4: React.FC = () => {
	const t = useT();
	const TOP = 480;
	const PX = 16;
	const yAt = (m: number) => TOP + m * PX;
	const X = 250;
	const tau = clamp01((t - 46.0) / 2.2) * 3; // detik simulasi 0..3
	const rockY = t < 46.0 ? yAt(0) : yAt(5 * tau * tau);
	const ghosts = [
		{m: 0, s: '0 s', v: 'v = 0', at: 41.2, vAt: 42.9},
		{m: 5, s: '1 s', v: '10 m/s', at: 48.2, vAt: 48.2},
		{m: 20, s: '2 s', v: '20 m/s', at: 50.4, vAt: 50.4},
		{m: 45, s: '3 s', v: '30 m/s', at: 52.6, vAt: 52.6},
	];
	const bars = [
		{m0: 0, m1: 5, w: 50, label: '+5 m', at: 52.4},
		{m0: 5, m1: 20, w: 150, label: '+15 m', at: 53.4},
		{m0: 20, m1: 45, w: 250, label: '+25 m', at: 54.3},
	];
	const gArrow = sp(t, 45.9);
	const gLen = 260 * Math.min(1, gArrow);
	const modal = ramp(t, 55.4, 55.8);
	const card = sp(t, 55.6, 12, 150);
	const cross = sp(t, 57.5);
	const rockIn = sp(t, 41.0);
	const kepoExpr = pick<Expr>(t, [
		[0, 'penasaran'],
		[46.0, 'mikir'],
		[56.6, 'paham'],
	]);
	const kk = ramp(t, 55.3, 55.9, easeIO);
	const kx = 900 + (540 - 900) * kk;
	const ky = 560 + (1110 - 560) * kk;
	return (
		<>
			<Svg>
				<PhysicsBg t={t} />
				<line x1={X} y1={yAt(0)} x2={X} y2={yAt(45)} stroke={C.white} strokeOpacity={0.25} strokeWidth={4} strokeDasharray="10 12" />

				{/* panah gravitasi */}
				{gArrow > 0.001 && (
					<g opacity={clamp01(gArrow * 2)}>
						<line x1={70} y1={TOP} x2={70} y2={TOP + gLen} stroke={C.yellow} strokeWidth={12} strokeLinecap="round" />
						<path
							d={`M48 ${TOP + gLen - 22} L70 ${TOP + gLen + 10} L92 ${TOP + gLen - 22}`}
							stroke={C.yellow}
							strokeWidth={12}
							fill="none"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<text x={70} y={TOP + 330} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={56} fill={C.yellow}>
							g
						</text>
					</g>
				)}

				{/* bayangan posisi + kecepatan */}
				{ghosts.map((g) => {
					const s = sp(t, g.at);
					if (s <= 0.001) return null;
					return (
						<g key={g.s} opacity={clamp01(s * 2)}>
							<circle cx={X} cy={yAt(g.m)} r={22 * Math.min(1, s)} fill="none" stroke={C.white} strokeOpacity={0.55} strokeWidth={4} />
							<text x={200} y={yAt(g.m) + 11} textAnchor="end" fontFamily={fontFamily} fontWeight={600} fontSize={34} fill={C.white} opacity={0.85}>
								{g.s}
							</text>
							{t >= g.vAt && (
								<text x={300} y={yAt(g.m) + 12} fontFamily={fontFamily} fontWeight={800} fontSize={38} fill={C.yellow}>
									{g.v}
								</text>
							)}
						</g>
					);
				})}

				{/* batu yang jatuh */}
				{rockIn > 0.001 && <Rock cx={X} cy={rockY} r={22 * Math.min(1, rockIn)} rot={tau * 200} />}

				{/* jarak tambahan tiap detik */}
				{bars.map((b) => {
					const s = sp(t, b.at, 14, 120);
					if (s <= 0.001) return null;
					const ym = (yAt(b.m0) + yAt(b.m1)) / 2;
					return (
						<g key={b.label} opacity={clamp01(s * 2)}>
							<line x1={560} y1={yAt(b.m0) + 6} x2={560} y2={yAt(b.m1) - 6} stroke={C.white} strokeOpacity={0.4} strokeWidth={4} />
							<text x={540} y={ym + 13} textAnchor="end" fontFamily={fontFamily} fontWeight={600} fontSize={36} fill={C.white}>
								{b.label}
							</text>
							<rect x={590} y={ym - 20} width={Math.max(1, b.w * s)} height={40} rx={20} fill={C.yellow} />
						</g>
					);
				})}

				{/* kartu rumus */}
				{modal > 0.001 && <rect x={0} y={0} width={1080} height={1920} fill={C.indigo} opacity={0.9 * modal} />}
				{card > 0.001 && (
					<g transform={`translate(540 740) scale(${card})`} opacity={clamp01(card * 2)}>
						<rect x={-440} y={-270} width={880} height={540} rx={56} fill={C.purple} stroke={C.yellow} strokeWidth={6} />
						<text x={0} y={-60} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={132} fill={C.white}>
							h = 5 × <tspan fill={C.yellow}>t²</tspan>
						</text>
						{t >= 56.2 && (
							<text x={0} y={30} textAnchor="middle" fontFamily={fontFamily} fontWeight={500} fontSize={40} fill={C.white} opacity={0.85}>
								t² artinya waktu × waktu
							</text>
						)}
						{cross > 0.001 && (
							<g opacity={clamp01(cross * 2)} transform={`translate(0 150) scale(${0.8 + 0.2 * Math.min(1, cross)})`}>
								<text x={0} y={0} textAnchor="middle" fontFamily={fontFamily} fontWeight={600} fontSize={68} fill={C.pink}>
									bukan 5 × t
								</text>
								<line x1={-190} y1={-24} x2={190} y2={-24} stroke={C.pink} strokeWidth={8} strokeLinecap="round" />
							</g>
						)}
					</g>
				)}

				<Kepo x={kx} y={ky} s={0.52} expr={kepoExpr} t={t} enterAt={40.8} />
			</Svg>
			<Headline text="Kenapa waktu dikuadratkan?" hl="dikuadratkan?" at={40.6} until={55.3} size={68} />
		</>
	);
};

// ---------------------------------------------------------------------------
// BAGIAN 5 — MELURUSKAN MISKONSEPSI (0:59–1:16)
// ---------------------------------------------------------------------------
const S5: React.FC = () => {
	const t = useT();
	const G = 1180; // tanah
	const Y0 = 640; // tinggi awal (pusat batu)
	const rocks = [
		{x: 330, r: 62, label: 'BERAT'},
		{x: 750, r: 30, label: 'RINGAN'},
	];
	const p1 = clamp01((t - 63.9) / 3.5); // jatuhan 1: 63.9 -> 67.4
	const p2 = clamp01((t - 71.4) / 3.4); // jatuhan 2: 71.4 -> 74.8
	const phase2 = t >= 70.7;
	const p = phase2 ? p2 : p1;
	const vis = phase2 ? ramp(t, 70.7, 71.1) : ramp(t, 60.2, 60.8);
	const hideBetween = t >= 70.2 && t < 70.7 ? 1 - ramp(t, 70.2, 70.7) : 1;
	const o = vis * hideBetween;
	const landed2 = t >= 74.8;
	const midY = (r: number) => Y0 + (G - r - Y0) * p * p;
	const kepoExpr = pick<Expr>(t, [
		[0, 'penasaran'],
		[63.9, 'kaget'],
		[67.4, 'mikir'],
		[69.0, 'paham'],
	]);
	const equal = window01(t, 65.4, 70.5);
	const showAG = t >= 69.0 && t < 70.5;
	return (
		<>
			<Svg>
				<PhysicsBg t={t} />
				{/* tanah */}
				<rect x={0} y={G} width={1080} height={700} fill={C.purple} />
				<line x1={0} y1={G} x2={1080} y2={G} stroke={C.yellow} strokeWidth={6} opacity={0.8} />

				{/* batu berat & ringan */}
				{rocks.map((rk) => {
					const cy = midY(rk.r);
					return (
						<g key={rk.label} opacity={o}>
							<Rock cx={rk.x} cy={cy} r={rk.r} rot={p * 30} />
							<text x={rk.x} y={cy - rk.r - 24} textAnchor="middle" fontFamily={fontFamily} fontWeight={600} fontSize={36} fill={C.white}>
								{rk.label}
							</text>
						</g>
					);
				})}

				{/* tanda tanya keraguan */}
				{t >= 60.5 && t < 64.1 && (
					<g transform={`translate(540 ${Y0 + 30}) rotate(${Math.sin(t * 5) * 6})`} opacity={window01(t, 60.5, 64.1, 0.3)}>
						<text x={0} y={0} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={130} fill={C.pink}>
							?
						</text>
					</g>
				)}

				{/* garis sejajar + tanda sama dengan */}
				{!phase2 && t >= 65.4 && (
					<g opacity={equal}>
						<line x1={rocks[0].x + 70} y1={midY(30)} x2={rocks[1].x - 40} y2={midY(30)} stroke={C.white} strokeOpacity={0.5} strokeWidth={4} strokeDasharray="10 12" />
						<text x={540} y={midY(30) + 44} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={120} fill={C.yellow} filter="url(#glow)">
							=
						</text>
					</g>
				)}

				<Burst x={rocks[0].x} y={G - 6} t={t} at={67.4} size={140} />
				<Burst x={rocks[1].x} y={G - 6} t={t} at={67.4} size={90} n={10} />
				<Burst x={rocks[0].x} y={G - 6} t={t} at={74.8} size={140} />
				<Burst x={rocks[1].x} y={G - 6} t={t} at={74.8} size={90} n={10} />

				{/* a = g */}
				{showAG &&
					rocks.map((rk) => (
						<text
							key={rk.label}
							x={rk.x}
							y={G - rk.r * 2 - 56}
							textAnchor="middle"
							fontFamily={fontFamily}
							fontWeight={800}
							fontSize={58}
							fill={C.yellow}
							opacity={window01(t, 69.0, 70.5, 0.3)}
						>
							a = g
						</text>
					))}

				<Chip x={540} y={470} w={620} text="tanpa hambatan udara" at={64.9} until={70.4} />
				<Chip x={540} y={900} w={760} text="massa beda, percepatan sama" at={69.1} until={70.4} />

				{/* tinggi sama */}
				{t >= 72.3 && (
					<g opacity={window01(t, 72.3, 76.0, 0.3)}>
						<line x1={540} y1={Y0} x2={540} y2={G - 20} stroke={C.yellow} strokeWidth={5} strokeDasharray="14 12" />
						<text x={560} y={(Y0 + G) / 2 + 12} fontFamily={fontFamily} fontWeight={600} fontSize={36} fill={C.yellow}>
							tinggi sama
						</text>
					</g>
				)}
				{landed2 && (
					<g transform={`translate(540 900) scale(${sp(t, 74.85)})`}>
						<text x={0} y={0} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={76} fill={C.yellow} filter="url(#glow)">
							TIBA BERSAMAAN!
						</text>
					</g>
				)}

				<Kepo x={130} y={G - 61} s={0.5} expr={kepoExpr} t={t} enterAt={60.2} look={0.8} popAt={63.9} />
			</Svg>
			<Headline text="Batu berat jatuh lebih cepat?" hl="lebih cepat?" at={60.1} until={70.4} size={66} />
			<Headline text="Jatuhnya bersamaan!" hl="bersamaan!" at={70.8} size={72} />
		</>
	);
};

// ---------------------------------------------------------------------------
// BAGIAN 6 — DARI MANA ANGKA LIMA BERASAL? (1:16–1:31)
// ---------------------------------------------------------------------------
const Row: React.FC<{
	y: number;
	label: string;
	labelAt: number;
	valueAt: number;
	t: number;
	dim: number;
	children: React.ReactNode;
}> = ({y, label, labelAt, valueAt, t, dim, children}) => {
	const a = sp(t, labelAt);
	const b = sp(t, valueAt);
	return (
		<g opacity={1 - 0.75 * dim}>
			{a > 0.001 && (
				<text x={100} y={y} fontFamily={fontFamily} fontWeight={500} fontSize={36} fill={C.white} opacity={clamp01(a * 2) * 0.75}>
					{label}
				</text>
			)}
			{b > 0.001 && (
				<g transform={`translate(100 ${y + 100}) scale(${b})`} opacity={clamp01(b * 2)}>
					{children}
				</g>
			)}
		</g>
	);
};

const S6: React.FC = () => {
	const t = useT();
	const modal = ramp(t, 88.1, 88.5);
	const card = sp(t, 88.3, 12, 150);
	const kepoExpr = pick<Expr>(t, [
		[0, 'penasaran'],
		[82.8, 'mikir'],
		[84.9, 'paham'],
	]);
	const kk = ramp(t, 88.0, 88.6, easeIO);
	const kx = 880 + (540 - 880) * kk;
	const ky = 770 + (1120 - 770) * kk;
	const ring = sp(t, 86.0);
	const big = (c: React.ReactNode) => (
		<text x={0} y={0} fontFamily={fontFamily} fontWeight={800} fontSize={92} fill={C.white}>
			{c}
		</text>
	);
	return (
		<>
			<Svg>
				<PhysicsBg t={t} />
				<Row y={520} label="gravitasi bumi" labelAt={78.4} valueAt={79.8} t={t} dim={modal}>
					{big(
						<>
							g ≈ <tspan fill={C.yellow}>9,8</tspan> m/s²
						</>
					)}
				</Row>
				<Row y={760} label="setengahnya" labelAt={82.8} valueAt={83.2} t={t} dim={modal}>
					{big(
						<>
							9,8 ÷ 2 = <tspan fill={C.yellow}>{t >= 84.2 ? '4,9' : '?'}</tspan>
						</>
					)}
				</Row>
				<Row y={1000} label="dibulatkan" labelAt={84.9} valueAt={85.2} t={t} dim={modal}>
					{big(
						<>
							4,9 ≈ <tspan fill={C.yellow}>5</tspan>
						</>
					)}
				</Row>
				{ring > 0.001 && modal < 0.5 && (
					<circle cx={402} cy={1073} r={58 * Math.min(1, ring)} fill="none" stroke={C.yellow} strokeWidth={6} opacity={0.9} filter="url(#glow)" />
				)}

				{modal > 0.001 && <rect x={0} y={0} width={1080} height={1920} fill={C.indigo} opacity={0.9 * modal} />}
				{card > 0.001 && (
					<g transform={`translate(540 700) scale(${card})`} opacity={clamp01(card * 2)}>
						<rect x={-440} y={-250} width={880} height={500} rx={56} fill={C.purple} stroke={C.yellow} strokeWidth={6} />
						<text x={0} y={-30} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={136} fill={C.white}>
							h ≈ <tspan fill={C.yellow}>5</tspan> × t²
						</text>
						<text x={0} y={80} textAnchor="middle" fontFamily={fontFamily} fontWeight={500} fontSize={38} fill={C.white} opacity={0.85}>
							h = tinggi (meter)
						</text>
						<text x={0} y={136} textAnchor="middle" fontFamily={fontFamily} fontWeight={500} fontSize={38} fill={C.white} opacity={0.85}>
							t = waktu (detik)
						</text>
					</g>
				)}

				<Kepo x={kx} y={ky} s={0.6} expr={kepoExpr} t={t} enterAt={76.7} nod={t >= 88.3 ? 5 : 0} />
			</Svg>
			<Headline text="Dari mana angka lima?" hl="lima?" at={76.6} until={88.0} size={72} />
		</>
	);
};

// ---------------------------------------------------------------------------
// BAGIAN 7 — PENUTUP (1:31–1:43,8)
// ---------------------------------------------------------------------------
const Logo: React.FC<{x: number; y: number; at: number; t: number}> = ({x, y, at, t}) => {
	const s = sp(t, at, 12, 140);
	if (s <= 0.001) return null;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`} opacity={clamp01(s * 2)}>
			<rect x={-330} y={-190} width={660} height={400} rx={64} fill={C.indigo} stroke={C.purple} strokeWidth={6} opacity={0.94} />
			<g transform="translate(0 -70)" filter="url(#glow)">
				<path d="M-96 0 L0 -88 L96 0 L80 0 L80 90 L-80 90 L-80 0Z" fill={C.yellow} />
			</g>
			<text x={0} y={-8} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={104} fill={C.indigo}>
				?
			</text>
			<text x={0} y={128} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={60} fill={C.white}>
				Rumah Penasaran
			</text>
			<text x={0} y={180} textAnchor="middle" fontFamily={fontFamily} fontWeight={600} fontSize={34} fill={C.yellow}>
				@rumahpenasaran
			</text>
		</g>
	);
};

const S7: React.FC = () => {
	const t = useT();
	const L = 1050;
	const z = ramp(t, 91.2, 103.8, easeIO);
	const sc = 1.25 - 0.25 * z; // kamera perlahan menjauh
	const fx = 440 + 100 * z;
	const fy = 900 + 60 * z;
	const arm = interpolate(t, [91.2, 91.8, 97.9, 98.7], [10, 70, 70, 10], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: easeIO,
	});
	const phone = t < 97.95 ? 1 : 1 - ramp(t, 97.95, 98.5); // smartphone disimpan
	const kepoExpr = pick<Expr>(t, [
		[0, 'penasaran'],
		[93.4, 'mikir'],
		[97.9, 'paham'],
	]);
	const wind = t >= 93.5 && t < 95.2;
	return (
		<>
			<Svg>
				<g transform={`translate(540 960) scale(${sc}) translate(${-fx} ${-fy})`}>
					<CliffTop L={L} t={t} />
					<Pendaki x={250} y={L} s={0.9} arm={arm} phone={phone} t={t} />
					<Kepo x={470} y={L - 56} s={0.46} expr={kepoExpr} t={t} popAt={97.9} look={0.3} />
				</g>
				{/* garis angin: hambatan udara */}
				{wind && (
					<g opacity={window01(t, 93.5, 95.2, 0.3)}>
						{[640, 700, 760].map((wy, i) => (
							<path
								key={wy}
								d={`M${960 - ((t * 120 + i * 60) % 260)} ${wy} q40 -30 90 0 t90 0`}
								stroke={C.white}
								strokeOpacity={0.6}
								strokeWidth={5}
								fill="none"
								strokeLinecap="round"
							/>
						))}
					</g>
				)}
				<Chip x={540} y={470} w={560} text="hambatan udara" at={93.6} until={95.1} color={C.pink} />
				<Chip x={540} y={470} w={620} text="ketepatan stopwatch" at={95.2} until={97.9} color={C.pink} />
				<Logo x={540} y={620} at={100.3} t={t} />
			</Svg>
			<Headline text="Hasilnya hanya perkiraan" hl="perkiraan" at={91.6} until={97.9} size={68} />
		</>
	);
};

// ---------------------------------------------------------------------------
// SUBTITLE (area aman Reels: y 1305–1495, hindari sisi kanan)
// ---------------------------------------------------------------------------
const Subtitles: React.FC = () => {
	const t = useT();
	let idx = -1;
	for (let i = 0; i < SUBTITLES.length; i++) {
		const [a, b] = SUBTITLES[i];
		const next = SUBTITLES[i + 1];
		const hold = next ? Math.min(0.4, Math.max(0, next[0] - b)) : 0.3;
		if (t >= a - 0.03 && t < b + hold) {
			idx = i;
			break;
		}
	}
	if (idx < 0) return null;
	const [a, , text, key] = SUBTITLES[idx];
	const s = sp(t, a - 0.03, 16, 220);
	const k = text.toLowerCase().indexOf(key.toLowerCase());
	const before = k >= 0 ? text.slice(0, k) : text;
	const mid = k >= 0 ? text.slice(k, k + key.length) : '';
	const after = k >= 0 ? text.slice(k + key.length) : '';
	return (
		<div
			style={{
				position: 'absolute',
				left: 90,
				width: 820,
				top: 1305,
				height: 190,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					fontFamily,
					fontWeight: 600,
					fontSize: 54,
					lineHeight: 1.25,
					textAlign: 'center',
					color: C.white,
					background: 'rgba(30, 27, 75, 0.78)',
					padding: '18px 34px',
					borderRadius: 30,
					opacity: clamp01(s * 1.6),
					transform: `translateY(${(1 - clamp01(s)) * 14}px)`,
				}}
			>
				{before}
				<span style={{color: C.yellow, fontWeight: 800}}>{mid}</span>
				{after}
			</div>
		</div>
	);
};

// ---------------------------------------------------------------------------
// SOUND EFFECT  (satu layer, dipasang sekali di root)
// s   = detik global (acuan: SECTIONS, SUBTITLES, dan komentar di tiap adegan)
// off = geser dalam frame (boleh negatif)
// vol = 0..1 per efek; SFX_MASTER mengatur keras-pelan semuanya
// ---------------------------------------------------------------------------
type SfxName =
	| 'pop' | 'whoosh' | 'tick' | 'ding' | 'swap' | 'charge'
	| 'zap' | 'sparkle' | 'blip' | 'lock' | 'power';

type SfxCue = {s: number; off: number; name: SfxName; vol: number};

const SFX_MASTER = 1;

const SFX_CUES: SfxCue[] = [
	// 01 HOOK (00:00-00:10)
	{s: 0.15, off: 0, name: 'pop', vol: 0.25}, // pendaki muncul
	{s: 0.4, off: 0, name: 'pop', vol: 0.3}, // Kepo muncul
	{s: 4.4, off: 0, name: 'whoosh', vol: 0.2}, // kamera zoom ke tebing
	{s: 8.0, off: 0, name: 'pop', vol: 0.22}, // judul Cuma modal stopwatch
	// 02 EKSPERIMEN (00:10-00:23)
	{s: 9.9, off: 0, name: 'whoosh', vol: 0.25}, // pergantian scene
	{s: 10.4, off: 0, name: 'pop', vol: 0.25}, // pendaki masuk
	{s: 10.7, off: 0, name: 'pop', vol: 0.25}, // Kepo masuk
	{s: 13.2, off: 0, name: 'pop', vol: 0.2}, // batu muncul di tangan
	{s: 14.0, off: 0, name: 'pop', vol: 0.25}, // kartu stopwatch
	{s: 14.63, off: 0, name: 'tick', vol: 0.15}, // batu dilepas, stopwatch jalan
	{s: 16.06, off: 0, name: 'tick', vol: 0.15}, // stopwatch berdetak
	{s: 17.49, off: 0, name: 'tick', vol: 0.15}, // stopwatch berdetak
	{s: 18.4, off: 0, name: 'whoosh', vol: 0.2}, // batu makin cepat
	{s: 18.92, off: 0, name: 'pop', vol: 0.35}, // DUK! batu menghantam dasar
	{s: 19.7, off: 0, name: 'pop', vol: 0.22}, // judul 3 detik berapa meter
	{s: 19.95, off: 0, name: 'blip', vol: 0.18}, // tanda tanya ? meter
	// 03 MISTERI ANGKA LIMA (00:23-00:40)
	{s: 23.0, off: 0, name: 'whoosh', vol: 0.25}, // pergantian scene
	{s: 23.6, off: 0, name: 'pop', vol: 0.25}, // Kepo muncul
	{s: 24.3, off: 0, name: 'pop', vol: 0.2}, // chip waktu = 3 detik
	{s: 26.3, off: 0, name: 'tick', vol: 0.15}, // angka 3
	{s: 27.4, off: 0, name: 'tick', vol: 0.15}, // angka 3 kedua
	{s: 28.9, off: 0, name: 'tick', vol: 0.15}, // angka 5
	{s: 30.2, off: 0, name: 'blip', vol: 0.18}, // 3 x 3 = 9
	{s: 33.0, off: 0, name: 'blip', vol: 0.18}, // 9 x 5 = ?
	{s: 35.2, off: 0, name: 'ding', vol: 0.3}, // 45 METER
	{s: 35.3, off: 0, name: 'pop', vol: 0.22}, // Kepo kaget
	// 04 KENAPA WAKTU DIKUADRATKAN (00:40-00:59)
	{s: 40.0, off: 0, name: 'whoosh', vol: 0.25}, // pergantian scene
	{s: 40.8, off: 0, name: 'pop', vol: 0.25}, // Kepo muncul
	{s: 41.0, off: 0, name: 'pop', vol: 0.2}, // batu muncul
	{s: 41.2, off: 0, name: 'tick', vol: 0.15}, // posisi 0 s
	{s: 45.9, off: 0, name: 'whoosh', vol: 0.2}, // panah gravitasi, batu mulai jatuh
	{s: 48.2, off: 0, name: 'tick', vol: 0.15}, // 1 s, 10 m/s
	{s: 50.4, off: 0, name: 'tick', vol: 0.15}, // 2 s, 20 m/s
	{s: 52.4, off: 0, name: 'blip', vol: 0.18}, // +5 m
	{s: 52.6, off: 0, name: 'tick', vol: 0.15}, // 3 s, 30 m/s
	{s: 53.4, off: 0, name: 'blip', vol: 0.18}, // +15 m
	{s: 54.3, off: 0, name: 'blip', vol: 0.18}, // +25 m
	{s: 55.4, off: 0, name: 'whoosh', vol: 0.2}, // layar menggelap, kartu rumus
	{s: 55.6, off: 0, name: 'pop', vol: 0.28}, // kartu h = 5 x t kuadrat
	{s: 56.6, off: 0, name: 'ding', vol: 0.28}, // Kepo paham
	{s: 57.5, off: 0, name: 'zap', vol: 0.28}, // coretan bukan 5 x t
	// 05 MELURUSKAN MISKONSEPSI (00:59-01:16)
	{s: 59.4, off: 0, name: 'whoosh', vol: 0.25}, // pergantian scene
	{s: 60.2, off: 0, name: 'pop', vol: 0.25}, // Kepo muncul
	{s: 60.4, off: 0, name: 'pop', vol: 0.22}, // batu berat dan ringan
	{s: 60.6, off: 0, name: 'blip', vol: 0.18}, // tanda tanya keraguan
	{s: 63.9, off: 0, name: 'pop', vol: 0.25}, // kedua batu dijatuhkan, Kepo kaget
	{s: 64.9, off: 0, name: 'pop', vol: 0.2}, // chip tanpa hambatan udara
	{s: 65.4, off: 0, name: 'blip', vol: 0.18}, // garis sejajar, tanda sama dengan
	{s: 67.0, off: 0, name: 'whoosh', vol: 0.2}, // batu makin cepat
	{s: 67.4, off: 0, name: 'pop', vol: 0.3}, // dua batu mendarat
	{s: 69.0, off: 0, name: 'ding', vol: 0.28}, // a = g, Kepo paham
	{s: 69.1, off: 0, name: 'pop', vol: 0.2}, // chip massa beda percepatan sama
	{s: 70.6, off: 0, name: 'whoosh', vol: 0.2}, // jatuhan kedua dimulai
	{s: 72.3, off: 0, name: 'tick', vol: 0.15}, // garis tinggi sama
	{s: 74.4, off: 0, name: 'whoosh', vol: 0.2}, // batu makin cepat
	{s: 74.8, off: 0, name: 'pop', vol: 0.3}, // dua batu mendarat bersamaan
	{s: 74.9, off: 0, name: 'ding', vol: 0.3}, // TIBA BERSAMAAN
	{s: 75.0, off: 0, name: 'sparkle', vol: 0.22},
	// 06 DARI MANA ANGKA LIMA (01:16-01:31)
	{s: 76.2, off: 0, name: 'whoosh', vol: 0.25}, // pergantian scene
	{s: 76.7, off: 0, name: 'pop', vol: 0.25}, // Kepo muncul
	{s: 78.4, off: 0, name: 'tick', vol: 0.15}, // label gravitasi bumi
	{s: 79.8, off: 0, name: 'pop', vol: 0.22}, // g = 9,8 m/s2
	{s: 82.8, off: 0, name: 'tick', vol: 0.15}, // label setengahnya
	{s: 83.2, off: 0, name: 'pop', vol: 0.22}, // 9,8 / 2 = ?
	{s: 84.2, off: 0, name: 'blip', vol: 0.18}, // hasil 4,9
	{s: 84.9, off: 0, name: 'tick', vol: 0.15}, // label dibulatkan
	{s: 85.2, off: 0, name: 'pop', vol: 0.22}, // 4,9 jadi 5
	{s: 86.0, off: 0, name: 'lock', vol: 0.22}, // cincin menandai angka 5
	{s: 88.1, off: 0, name: 'whoosh', vol: 0.2}, // layar menggelap
	{s: 88.3, off: 0, name: 'pop', vol: 0.28}, // kartu h = 5 x t kuadrat
	{s: 88.5, off: 0, name: 'ding', vol: 0.3}, // rumus praktis
	{s: 88.6, off: 0, name: 'sparkle', vol: 0.22},
	// 07 PENUTUP (01:31-01:43) - lebih lembut
	{s: 91.1, off: 0, name: 'whoosh', vol: 0.22}, // pergantian scene
	{s: 91.6, off: 0, name: 'pop', vol: 0.18}, // judul hasilnya hanya perkiraan
	{s: 93.5, off: 0, name: 'whoosh', vol: 0.15}, // garis angin hambatan udara
	{s: 93.6, off: 0, name: 'tick', vol: 0.15}, // chip hambatan udara
	{s: 95.2, off: 0, name: 'tick', vol: 0.15}, // chip ketepatan stopwatch
	{s: 97.9, off: 0, name: 'ding', vol: 0.25}, // Kepo paham
	{s: 100.3, off: 0, name: 'pop', vol: 0.22}, // logo Rumah Penasaran
	{s: 100.4, off: 0, name: 'sparkle', vol: 0.22},
	{s: 102.1, off: 0, name: 'sparkle', vol: 0.2}, // Besok penasaran apa lagi
];

const sfxFrame = (c: SfxCue): number => sf(c.s) + c.off;

const SfxLayer: React.FC = () => (
	<>
		{SFX_CUES.map((c, i) => {
			const from = sfxFrame(c);
			const frames = (sfxMeta as Record<string, {frames: number}>)[c.name].frames + 2;
			return (
				<Sequence
					key={`${c.s}-${c.off}-${c.name}-${i}`}
					from={from}
					durationInFrames={frames}
					name={`SFX ${c.name}`}
					layout="none"
				>
					<Audio src={staticFile(`sfx/${c.name}.wav`)} volume={c.vol * SFX_MASTER} />
				</Sequence>
			);
		})}
	</>
);

// ---------------------------------------------------------------------------
// KOMPOSISI UTAMA
// ---------------------------------------------------------------------------
export const Fisika: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: C.indigo, fontFamily}}>
			{/* BAGIAN 1 — HOOK */}
			<Scene range={SECTIONS.hook} fadeIn={false}>
				<S1 />
			</Scene>
			{/* BAGIAN 2 — EKSPERIMEN DIMULAI */}
			<Scene range={SECTIONS.eksperimen}>
				<S2 />
			</Scene>
			{/* BAGIAN 3 — MISTERI ANGKA LIMA */}
			<Scene range={SECTIONS.misteri}>
				<S3 />
			</Scene>
			{/* BAGIAN 4 — KENAPA WAKTU DIKUADRATKAN? */}
			<Scene range={SECTIONS.kuadrat}>
				<S4 />
			</Scene>
			{/* BAGIAN 5 — MELURUSKAN MISKONSEPSI */}
			<Scene range={SECTIONS.miskonsepsi}>
				<S5 />
			</Scene>
			{/* BAGIAN 6 — DARI MANA ANGKA LIMA BERASAL? */}
			<Scene range={SECTIONS.asalLima}>
				<S6 />
			</Scene>
			{/* BAGIAN 7 — PENUTUP */}
			<Scene range={SECTIONS.penutup} fadeOut={false}>
				<S7 />
			</Scene>

			{ENABLE_SFX && <SfxLayer />}
			{/* SUBTITLE (selalu di atas semua adegan) */}
			<Subtitles />
		</AbsoluteFill>
	);
};

export default Fisika;
