/**
 * arsitekturberpikir.tsx — @rumahpenasaran
 * "Arsitektur Berpikir": Matriks 4 Kuadran + Backward Chaining + IPO
 *
 * Tanpa voice over. Hanya visual + subtitle (+ penanda bagian).
 * Format: 1080x1920, 30 fps, 56 detik (1680 frame).
 *
 * Timing diselaraskan dengan WAV (durasi 55,92 dtk). Batas kalimat diambil dari
 * jeda senyap di audio; posisi tiap baris subtitle di dalam satu kalimat
 * diperkirakan dari jumlah huruf. Kalau mau geser, ubah SECTIONS.speech saja.
 *
 * Penanda bagian: lihat SECTIONS di bawah (juga muncul sebagai nama Sequence
 * di timeline Remotion Studio). Set SHOW_DEBUG = true untuk label di layar.
 *
 * Sintaks warna kata di teks:
 *   [[kata]] -> kuning #FBBF24 (kata kunci)
 *   {{kata}} -> merah muda #FB7185 (hanya untuk makna buruk/bingung)
 *
 * Daftar di Root.tsx:
 *   import {ArsitekturBerpikir, ARSITEKTUR_BERPIKIR} from './arsitekturberpikir';
 *   <Composition id="ArsitekturBerpikir" component={ArsitekturBerpikir}
 *     durationInFrames={ARSITEKTUR_BERPIKIR.durationInFrames} fps={ARSITEKTUR_BERPIKIR.fps}
 *     width={ARSITEKTUR_BERPIKIR.width} height={ARSITEKTUR_BERPIKIR.height} />
 */

import React, {createContext, useContext} from 'react';
import {
	AbsoluteFill,
	Easing,
	Sequence,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Poppins';
import {Brain, Flag, Maximize, Package, Target, Wrench} from 'lucide-react';

// Kalau mau pakai audio nanti (tidak diperlukan sekarang):
// import {Audio, staticFile} from 'remotion';
// <Audio src={staticFile('Generated_Audio_November_04__2026_-_3_20PM.wav')} />

const {fontFamily} = loadFont('normal', {
	weights: ['500', '600', '800'],
	subsets: ['latin'],
});

const SHOW_DEBUG = false;

/* ------------------------------------------------------------------ */
/* Identitas                                                           */
/* ------------------------------------------------------------------ */

const FPS = 30;
const W = 1080;
const H = 1920;

const C = {
	indigo: '#1E1B4B',
	ungu: '#4C1D95',
	kuning: '#FBBF24',
	putih: '#FFFFFF',
	merah: '#FB7185', // khusus makna buruk / bahaya
} as const;

const sec = (s: number) => Math.round(s * FPS);

export const ARSITEKTUR_BERPIKIR = {
	durationInFrames: sec(56),
	fps: FPS,
	width: W,
	height: H,
} as const;

/* ------------------------------------------------------------------ */
/* PENANDA BAGIAN (detik)                                              */
/* from/to  : rentang visual bagian                                    */
/* speech   : kapan narasi benar-benar bicara di bagian itu            */
/* ------------------------------------------------------------------ */

type SectionId = 'hook' | 'masalah' | 'matriks' | 'chaining' | 'ipo' | 'penutup' | 'outro';

type SectionDef = {
	id: SectionId;
	name: string;
	from: number;
	to: number;
	speech: [number, number];
};

const SECTIONS: SectionDef[] = [
	// BAGIAN 1 — HOOK
	{id: 'hook', name: '1 · HOOK', from: 0, to: 8.16, speech: [0.1, 7.78]},
	// BAGIAN 2 — MASALAH
	{id: 'masalah', name: '2 · MASALAH', from: 8.16, to: 17.07, speech: [8.55, 16.58]},
	// BAGIAN 3 — MATRIKS 4 KUADRAN
	{id: 'matriks', name: '3 · MATRIKS 4 KUADRAN', from: 17.07, to: 26.67, speech: [17.56, 26.28]},
	// BAGIAN 4 — BACKWARD CHAINING
	{id: 'chaining', name: '4 · BACKWARD CHAINING', from: 26.67, to: 36.78, speech: [27.06, 36.36]},
	// BAGIAN 5 — SISTEM IPO
	{id: 'ipo', name: '5 · SISTEM IPO', from: 36.78, to: 45.39, speech: [37.2, 45.07]},
	// BAGIAN 6 — PENUTUP
	{id: 'penutup', name: '6 · PENUTUP', from: 45.39, to: 53.9, speech: [45.7, 53.65]},
	// OUTRO — "Besok penasaran apa lagi?"
	{id: 'outro', name: '7 · OUTRO', from: 53.9, to: 56, speech: [54.2, 55.85]},
];

/* ------------------------------------------------------------------ */
/* SUBTITLE (maks 7 kata per layar)                                    */
/* ------------------------------------------------------------------ */

type CueDef = {t: string; id?: string};

const SCRIPT: Record<SectionId, CueDef[]> = {
	hook: [
		{t: 'Kok bisa ya, ada orang'},
		{t: 'yang mampu menyusun'},
		{t: '[[sistem kerja rumit]]', id: 'rumit'},
		{t: 'dengan begitu cepat,'},
		{t: 'sementara orang lain'},
		{t: 'justru {{bingung}}', id: 'bingung'},
		{t: 'harus mulai dari mana?'},
	],
	masalah: [
		{t: 'Rahasia sebenarnya bukan', id: 'rahasia'},
		{t: 'pada kecanggihan tools,', id: 'tools'},
		{t: 'melainkan pada [[struktur berpikir]]', id: 'struktur'},
		{t: 'Tanpa kerangka yang jelas,', id: 'tanpa'},
		{t: 'teknologi justru memperbesar'},
		{t: '{{kebingungan}}', id: 'kacau'},
	],
	matriks: [
		{t: 'Ada [[dua dimensi]] penting.', id: 'dua'},
		{t: 'Pertama, pemetaan statis', id: 'pertama'},
		{t: 'menggunakan [[empat kuadran]]:', id: 'kuadran'},
		{t: 'ruang lingkup,', id: 'q1'},
		{t: 'sumber daya,', id: 'q2'},
		{t: 'titik rawan,', id: 'q3'},
		{t: 'dan target keberhasilan', id: 'q4'},
	],
	chaining: [
		{t: 'Kedua, [[pipeline eksekusi]].', id: 'pipeline'},
		{t: 'Gunakan metode [[inversion]]:', id: 'inversion'},
		{t: 'tetapkan hasil akhir,', id: 'hasil'},
		{t: 'lalu tarik mundur', id: 'mundur'},
		{t: 'setiap syarat yang harus dipenuhi', id: 'syarat'},
		{t: 'hingga menemukan [[titik awal]]', id: 'awal'},
	],
	ipo: [
		{t: 'Setiap tahap harus punya', id: 'tahap'},
		{t: 'input, proses,', id: 'in'},
		{t: 'dan [[output konkret]]', id: 'out'},
		{t: 'Bukan sekadar daftar kesibukan,', id: 'list'},
		{t: 'tetapi [[rantai kerja]]', id: 'chain'},
		{t: 'yang saling bergantung', id: 'depend'},
	],
	penutup: [
		{t: 'Ingat, tools hanyalah [[pelaksana]].', id: 'pelaksana'},
		{t: '[[Arsitektur berpikirmulah]]', id: 'arsi'},
		{t: 'yang menentukan arah.', id: 'arah'},
		{t: 'Jadi, sudahkah kamu', id: 'tanya'},
		{t: 'membangun [[sistem]]', id: 'bangun'},
		{t: 'sebelum mulai bekerja?', id: 'kerja'},
	],
	outro: [{t: 'Besok [[penasaran]] apa lagi?', id: 'besok'}],
};

type Cue = {text: string; id?: string; s: number; e: number; section: SectionId};

const plain = (t: string) => t.replace(/\[\[|\]\]|\{\{|\}\}/g, '');

const CUES: Cue[] = SECTIONS.flatMap((section) => {
	const defs = SCRIPT[section.id];
	const weights = defs.map((d) => plain(d.t).length + 6);
	const total = weights.reduce((a, b) => a + b, 0);
	const start = section.speech[0] * FPS;
	const span = (section.speech[1] - section.speech[0]) * FPS;
	let acc = 0;
	return defs.map((d, i) => {
		const s = Math.round(start + (acc / total) * span);
		acc += weights[i];
		const e = Math.round(start + (acc / total) * span);
		return {text: d.t, id: d.id, s, e, section: section.id};
	});
});

const cue = (id: string): Cue => {
	const c = CUES.find((x) => x.id === id);
	if (!c) {
		throw new Error(`Cue tidak ditemukan: ${id}`);
	}
	return c;
};

/* ------------------------------------------------------------------ */
/* Util animasi                                                        */
/* ------------------------------------------------------------------ */

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clampOpts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const appear = (g: number, start: number, dur = 14) =>
	interpolate(g, [start, start + dur], [0, 1], {...clampOpts, easing: ease});

const rnd = (i: number, n: number) => {
	const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
	return x - Math.floor(x);
};

type Ctx = {g: number; local: number};
const SceneCtx = createContext<Ctx>({g: 0, local: 0});
const useG = () => useContext(SceneCtx).g;

/** Muncul dengan fade + geser + pegas ringan. */
const Pop: React.FC<{
	at: number;
	dy?: number;
	dx?: number;
	style?: React.CSSProperties;
	children?: React.ReactNode;
}> = ({at, dy = 40, dx = 0, style, children}) => {
	const g = useG();
	const {fps} = useVideoConfig();
	const a = appear(g, at, 12);
	const sp = spring({
		frame: Math.max(0, g - at),
		fps,
		config: {damping: 15, stiffness: 120},
	});
	return (
		<div
			style={{
				opacity: a,
				transform: `translate(${(1 - sp) * dx}px, ${(1 - sp) * dy}px)`,
				...style,
			}}
		>
			{children}
		</div>
	);
};

/** Teks dengan kata kunci berwarna. */
const Rich: React.FC<{text: string}> = ({text}) => {
	const parts = text.split(/(\[\[.*?\]\]|\{\{.*?\}\})/g).filter(Boolean);
	return (
		<>
			{parts.map((p, i) => {
				if (p.startsWith('[[')) {
					return (
						<span key={i} style={{color: C.kuning}}>
							{p.slice(2, -2)}
						</span>
					);
				}
				if (p.startsWith('{{')) {
					return (
						<span key={i} style={{color: C.merah}}>
							{p.slice(2, -2)}
						</span>
					);
				}
				return <span key={i}>{p}</span>;
			})}
		</>
	);
};

/** Judul yang bisa berganti teks seiring narasi. */
const TitleSwap: React.FC<{
	items: {text: string; at: number}[];
	size?: number;
	width?: number;
	left?: number;
	top?: number;
	align?: 'left' | 'center';
}> = ({items, size = 68, width = 720, left = 60, top = 262, align = 'left'}) => {
	const g = useG();
	return (
		<div style={{position: 'absolute', left, top, width}}>
			{items.map((it, i) => {
				const next = items[i + 1];
				const inn = appear(g, it.at, 14);
				const out = next ? 1 - appear(g, next.at - 2, 8) : 1;
				return (
					<div
						key={i}
						style={{
							position: i === 0 ? 'relative' : 'absolute',
							left: 0,
							top: 0,
							width: '100%',
							opacity: inn * out,
							transform: `translateY(${(1 - inn) * 30}px)`,
							fontSize: size,
							fontWeight: 800,
							lineHeight: 1.12,
							textAlign: align,
							color: C.putih,
						}}
					>
						<Rich text={it.text} />
					</div>
				);
			})}
		</div>
	);
};

/* ------------------------------------------------------------------ */
/* Logo, maskot Kepo, latar                                            */
/* ------------------------------------------------------------------ */

const Logo: React.FC<{size?: number}> = ({size = 110}) => (
	<svg width={size} height={size * 0.92} viewBox="0 0 120 110">
		<path
			d="M60 8 L112 54 L102 54 L102 100 L18 100 L18 54 L8 54 Z"
			fill={C.kuning}
			stroke={C.kuning}
			strokeWidth="8"
			strokeLinejoin="round"
		/>
		<text
			x="60"
			y="90"
			textAnchor="middle"
			fontFamily={fontFamily}
			fontWeight={800}
			fontSize="62"
			fill={C.indigo}
		>
			?
		</text>
	</svg>
);

const Header: React.FC = () => (
	<div
		style={{
			position: 'absolute',
			left: 60,
			top: 78,
			display: 'flex',
			alignItems: 'center',
			gap: 22,
		}}
	>
		<Logo size={104} />
		<div>
			<div style={{fontSize: 40, fontWeight: 800, color: C.putih, lineHeight: 1.1}}>
				Rumah Penasaran
			</div>
			<div style={{fontSize: 28, fontWeight: 500, color: C.kuning, lineHeight: 1.3}}>
				@rumahpenasaran
			</div>
		</div>
	</div>
);

type Expr = 'penasaran' | 'kaget' | 'mikir' | 'paham';

const Kepo: React.FC<{size: number; expr: Expr}> = ({size, expr}) => {
	const f = useCurrentFrame();
	const bob = Math.sin(f / 11) * 5;
	let ant = 0;
	if (expr === 'penasaran') ant = -14 + Math.sin(f / 18) * 3;
	if (expr === 'kaget') ant = Math.sin(f * 1.9) * 3;
	if (expr === 'mikir') ant = Math.sin(f / 5) * 11;
	const glow = expr === 'paham' ? 0.6 + 0.4 * Math.sin(f / 6) : 0;
	const look = Math.sin(f / 25) * 3;

	return (
		<div style={{width: size, height: size * 1.35, transform: `translateY(${bob}px)`}}>
			<svg
				viewBox="0 0 200 270"
				width={size}
				height={size * 1.35}
				style={{overflow: 'visible'}}
			>
				<defs>
					<radialGradient id="kepoGlow" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor={C.kuning} stopOpacity={0.32} />
						<stop offset="100%" stopColor={C.kuning} stopOpacity={0} />
					</radialGradient>
				</defs>
				<circle cx="100" cy="160" r="150" fill="url(#kepoGlow)" />

				{/* dudukan bohlam */}
				<rect x="68" y="222" width="64" height="34" rx="10" fill={C.ungu} />
				<path
					d="M72 236 H128 M74 246 H126"
					stroke={C.indigo}
					strokeWidth="4"
					strokeLinecap="round"
					opacity={0.6}
				/>

				{/* badan */}
				<ellipse cx="100" cy="160" rx="82" ry="76" fill={C.kuning} />
				<ellipse cx="62" cy="116" rx="16" ry="9" fill={C.putih} opacity={0.28} />

				{/* antena */}
				<g
					transform={`rotate(${ant} 100 84)`}
					style={{
						filter: glow
							? `drop-shadow(0 0 ${8 + 12 * glow}px ${C.kuning})`
							: undefined,
					}}
				>
					{expr === 'paham' ? (
						<>
							<line
								x1="100"
								y1="16"
								x2="100"
								y2="62"
								stroke={C.kuning}
								strokeWidth="13"
								strokeLinecap="round"
							/>
							<circle cx="100" cy="78" r="8" fill={C.kuning} />
						</>
					) : (
						<>
							<path
								d="M84 52 C84 12 130 12 130 46 C130 64 106 62 106 70"
								fill="none"
								stroke={C.kuning}
								strokeWidth="10"
								strokeLinecap="round"
							/>
							<circle cx="106" cy="79" r="6" fill={C.kuning} />
						</>
					)}
				</g>

				{/* mata + mulut */}
				{expr === 'penasaran' && (
					<>
						<ellipse cx="68" cy="148" rx="21" ry="27" fill={C.putih} />
						<ellipse cx="132" cy="148" rx="21" ry="27" fill={C.putih} />
						<circle cx={72 + look} cy="152" r="9" fill={C.indigo} />
						<circle cx={136 + look} cy="152" r="9" fill={C.indigo} />
						<ellipse cx="100" cy="199" rx="7" ry="5" fill={C.indigo} />
					</>
				)}
				{expr === 'kaget' && (
					<>
						<ellipse cx="66" cy="146" rx="27" ry="34" fill={C.putih} />
						<ellipse cx="134" cy="146" rx="27" ry="34" fill={C.putih} />
						<circle cx="66" cy="148" r="5" fill={C.indigo} />
						<circle cx="134" cy="148" r="5" fill={C.indigo} />
						<ellipse cx="100" cy="205" rx="11" ry="15" fill={C.indigo} />
					</>
				)}
				{expr === 'mikir' && (
					<>
						<ellipse cx="68" cy="148" rx="21" ry="26" fill={C.putih} />
						<ellipse cx="132" cy="148" rx="21" ry="26" fill={C.putih} />
						<circle cx="75" cy="138" r="9" fill={C.indigo} />
						<circle cx="139" cy="138" r="9" fill={C.indigo} />
						<path
							d="M86 202 Q94 195 102 202 T118 202"
							fill="none"
							stroke={C.indigo}
							strokeWidth="5"
							strokeLinecap="round"
						/>
					</>
				)}
				{expr === 'paham' && (
					<>
						<path
							d="M46 154 Q68 126 90 154"
							fill="none"
							stroke={C.indigo}
							strokeWidth="9"
							strokeLinecap="round"
						/>
						<path
							d="M110 154 Q132 126 154 154"
							fill="none"
							stroke={C.indigo}
							strokeWidth="9"
							strokeLinecap="round"
						/>
						<path d="M80 188 Q100 220 120 188 Z" fill={C.indigo} />
					</>
				)}
			</svg>
		</div>
	);
};

/** Kepo kecil di pojok kanan atas area konten; ekspresi mengikuti narasi. */
const KepoCorner: React.FC<{items: {expr: Expr; at: number}[]; at?: number}> = ({
	items,
	at = 6,
}) => {
	const g = useG();
	let expr = items[0].expr;
	for (const it of items) {
		if (g >= it.at) expr = it.expr;
	}
	return (
		<Pop at={at} dx={40} style={{position: 'absolute', left: 810, top: 258}}>
			<Kepo size={150} expr={expr} />
		</Pop>
	);
};

const STARS = Array.from({length: 46}, (_, i) => ({
	x: rnd(i, 1) * W,
	y: rnd(i, 2) * H,
	s: 1.5 + rnd(i, 3) * 3.5,
	p: rnd(i, 4) * 6.28,
	sp: 0.03 + rnd(i, 5) * 0.05,
}));

const Background: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					background: `linear-gradient(180deg, ${C.indigo} 0%, ${C.indigo} 55%, #2A1D6B 100%)`,
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(ellipse 90% 45% at 100% 0%, rgba(76,29,149,0.65), transparent)',
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(ellipse 80% 38% at 50% 100%, rgba(251,191,36,0.10), transparent)',
				}}
			/>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				{STARS.map((st, i) => (
					<circle
						key={i}
						cx={st.x}
						cy={st.y}
						r={st.s}
						fill={C.putih}
						opacity={0.2 + 0.3 * Math.sin(f * st.sp + st.p)}
					/>
				))}
			</svg>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* Subtitle (area aman: y 1305–1495)                                   */
/* ------------------------------------------------------------------ */

const Subtitles: React.FC = () => {
	const f = useCurrentFrame();
	const c = CUES.find((x) => f >= x.s && f < x.e);
	if (!c) return null;
	const a = appear(f, c.s, 8);
	return (
		<div
			style={{
				position: 'absolute',
				left: 60,
				top: 1305,
				width: 900,
				height: 190,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					background: 'rgba(30,27,75,0.82)',
					border: '2px solid rgba(255,255,255,0.12)',
					borderRadius: 36,
					padding: '18px 36px',
					fontFamily,
					fontWeight: 600,
					fontSize: 56,
					lineHeight: 1.25,
					color: C.putih,
					textAlign: 'center',
					opacity: a,
					transform: `translateY(${(1 - a) * 14}px)`,
					boxSizing: 'border-box',
					maxWidth: 900,
				}}
			>
				<Rich text={c.text} />
			</div>
		</div>
	);
};

/* ------------------------------------------------------------------ */
/* Pembungkus scene                                                    */
/* ------------------------------------------------------------------ */

const SceneInner: React.FC<{section: SectionDef; children: React.ReactNode}> = ({
	section,
	children,
}) => {
	const local = useCurrentFrame();
	const from = sec(section.from);
	const dur = sec(section.to) - from;
	const fin = section.id === 'hook' ? 1 : interpolate(local, [0, 8], [0, 1], clampOpts);
	const fout =
		section.id === 'outro' ? 1 : interpolate(local, [dur - 8, dur], [1, 0], clampOpts);
	return (
		<SceneCtx.Provider value={{g: local + from, local}}>
			<AbsoluteFill style={{opacity: Math.min(fin, fout)}}>{children}</AbsoluteFill>
		</SceneCtx.Provider>
	);
};

const Scene: React.FC<{section: SectionDef; children: React.ReactNode}> = ({
	section,
	children,
}) => (
	<Sequence
		name={section.name}
		from={sec(section.from)}
		durationInFrames={sec(section.to) - sec(section.from)}
		layout="none"
	>
		<SceneInner section={section}>{children}</SceneInner>
	</Sequence>
);

/* ------------------------------------------------------------------ */
/* Komponen visual kecil                                               */
/* ------------------------------------------------------------------ */

const cardStyle = (border: string, glow = false): React.CSSProperties => ({
	background: C.ungu,
	borderRadius: 40,
	border: `4px solid ${border}`,
	boxShadow: glow ? '0 0 60px rgba(251,191,36,0.35)' : 'none',
	boxSizing: 'border-box',
});

const SOFT = 'rgba(255,255,255,0.14)';

const TidyChain: React.FC<{at: number}> = ({at}) => {
	const g = useG();
	return (
		<svg width="420" height="150" viewBox="0 0 420 150">
			{[0, 1, 2, 3].map((i) => {
				const a = appear(g, at + i * 6, 12);
				const x = 45 + i * 110;
				return (
					<g key={i} opacity={a}>
						{i > 0 && (
							<line
								x1={x - 82}
								y1="75"
								x2={x - 28}
								y2="75"
								stroke={C.kuning}
								strokeWidth="6"
								strokeLinecap="round"
							/>
						)}
						<circle cx={x} cy="75" r="28" fill={C.kuning} />
					</g>
				);
			})}
		</svg>
	);
};

const TANGLE = [
	'M20 110 C80 10, 120 140, 170 60 S260 130, 300 40 S380 120, 400 70',
	'M30 40 C100 130, 160 10, 220 100 S330 20, 395 110',
	'M10 75 C90 20, 140 130, 210 30 S320 140, 410 50',
];

const Tangle: React.FC<{at: number}> = ({at}) => {
	const g = useG();
	const q = appear(g, at + 10, 14);
	return (
		<svg width="420" height="150" viewBox="0 0 420 150">
			{TANGLE.map((d, i) => (
				<path
					key={i}
					d={d}
					pathLength={1}
					strokeDasharray={1}
					strokeDashoffset={1 - appear(g, at + i * 8, 26)}
					stroke={C.merah}
					strokeWidth="6"
					fill="none"
					strokeLinecap="round"
				/>
			))}
			<text
				x="112"
				y="52"
				fontFamily={fontFamily}
				fontWeight={800}
				fontSize="46"
				fill={C.merah}
				opacity={q}
			>
				?
			</text>
			<text
				x="300"
				y="128"
				fontFamily={fontFamily}
				fontWeight={800}
				fontSize="40"
				fill={C.merah}
				opacity={q}
			>
				?
			</text>
		</svg>
	);
};

const UpArrow: React.FC<{at: number; color?: string}> = ({at, color = C.kuning}) => {
	const g = useG();
	const a = appear(g, at, 10);
	return (
		<svg width="44" height="56" viewBox="0 0 44 56" style={{opacity: a}}>
			<line
				x1="22"
				y1="52"
				x2="22"
				y2="14"
				stroke={color}
				strokeWidth="7"
				strokeLinecap="round"
			/>
			<path
				d="M8 24 L22 8 L36 24"
				fill="none"
				stroke={color}
				strokeWidth="7"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

const RightArrow: React.FC<{at: number; color?: string}> = ({at, color = C.putih}) => {
	const g = useG();
	const a = appear(g, at, 10);
	return (
		<svg width="70" height="40" viewBox="0 0 70 40" style={{opacity: a * 0.85}}>
			<line
				x1="6"
				y1="20"
				x2="56"
				y2="20"
				stroke={color}
				strokeWidth="6"
				strokeLinecap="round"
			/>
			<path
				d="M44 7 L58 20 L44 33"
				fill="none"
				stroke={color}
				strokeWidth="6"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

/* ------------------------------------------------------------------ */
/* BAGIAN 1 — HOOK (00:00–00:07)                                       */
/* ------------------------------------------------------------------ */

const SceneHook: React.FC = () => {
	const g = useG();
	const rumit = cue('rumit').s;
	const bingung = cue('bingung').s;
	const expr: Expr = g >= bingung ? 'mikir' : 'penasaran';
	return (
		<AbsoluteFill>
			<Pop
				at={2}
				style={{
					position: 'absolute',
					left: 60,
					top: 262,
					width: 900,
					textAlign: 'center',
					fontSize: 88,
					fontWeight: 800,
					lineHeight: 1.1,
				}}
			>
				<Rich text="Kok [[bisa]] ya...?" />
			</Pop>
			<Pop
				at={bingung}
				dy={20}
				style={{
					position: 'absolute',
					left: 60,
					top: 410,
					width: 900,
					textAlign: 'center',
					fontSize: 52,
					fontWeight: 600,
				}}
			>
				<Rich text="Cepat vs {{bingung}}" />
			</Pop>
			<Pop
				at={8}
				style={{
					position: 'absolute',
					left: 0,
					top: 520,
					width: W,
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<Kepo size={380} expr={expr} />
			</Pop>
			<div style={{position: 'absolute', left: 60, top: 1070}}>
				<TidyChain at={rumit} />
			</div>
			<div style={{position: 'absolute', left: 540, top: 1070}}>
				<Tangle at={bingung} />
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* BAGIAN 2 — MASALAH (00:07–00:14)                                    */
/* ------------------------------------------------------------------ */

const CHAOS = Array.from({length: 9}, (_, i) => {
	const r = (n: number) => rnd(i + 40, n);
	return `M ${r(1) * 880 + 10} ${r(2) * 560 + 20} C ${r(3) * 900} ${r(4) * 600}, ${r(5) * 900} ${r(6) * 600}, ${r(7) * 880 + 10} ${r(8) * 560 + 20}`;
});

const BADGES = Array.from({length: 6}, (_, i) => ({
	x: rnd(i + 20, 1) * 740 + 20,
	y: rnd(i + 20, 2) * 460 + 20,
	rot: (rnd(i + 20, 3) - 0.5) * 50,
}));

const SceneMasalah: React.FC = () => {
	const g = useG();
	const f = useCurrentFrame();
	const tools = cue('tools').s;
	const struktur = cue('struktur').s;
	const tanpa = cue('tanpa').s;
	const kacau = cue('kacau');

	const phaseB = appear(g, tanpa, 10);
	const cardsOpacity = 1 - phaseB;
	const toolsDim = appear(g, struktur, 12);
	const p = interpolate(g, [tanpa, kacau.s + 24], [0, 1], clampOpts);

	return (
		<AbsoluteFill>
			<TitleSwap
				items={[
					{text: 'Rahasia: [[struktur berpikir]]', at: 4},
					{text: 'Tanpa kerangka, makin {{bingung}}', at: tanpa},
				]}
			/>
			<KepoCorner
				items={[
					{expr: 'mikir', at: 0},
					{expr: 'kaget', at: tanpa + 6},
				]}
			/>

			{/* Fase A: tools vs struktur */}
			<div style={{opacity: cardsOpacity}}>
				<Pop at={tools} style={{position: 'absolute', left: 60, top: 560}}>
					<div
						style={{
							...cardStyle(SOFT),
							width: 430,
							height: 520,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 28,
							opacity: 1 - 0.45 * toolsDim,
							transform: `scale(${1 - 0.05 * toolsDim})`,
						}}
					>
						<Wrench size={150} color={C.putih} strokeWidth={1.8} />
						<div style={{fontSize: 50, fontWeight: 800, color: C.putih}}>TOOLS</div>
					</div>
				</Pop>
				<Pop at={struktur} style={{position: 'absolute', left: 530, top: 560}}>
					<div
						style={{
							...cardStyle(C.kuning, true),
							width: 430,
							height: 520,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 28,
						}}
					>
						<Brain size={150} color={C.kuning} strokeWidth={1.8} />
						<div style={{fontSize: 50, fontWeight: 800, color: C.kuning}}>
							STRUKTUR
						</div>
					</div>
				</Pop>
			</div>

			{/* Fase B: tools tanpa kerangka -> kacau */}
			<div
				style={{
					position: 'absolute',
					left: 90,
					top: 540,
					width: 900,
					height: 620,
					opacity: phaseB,
				}}
			>
				<svg width="900" height="620" style={{position: 'absolute', inset: 0}}>
					{CHAOS.map((d, i) => (
						<path
							key={i}
							d={d}
							pathLength={1}
							strokeDasharray={1}
							strokeDashoffset={1 - interpolate(p, [i / 12, i / 12 + 0.4], [0, 1], clampOpts)}
							stroke={C.merah}
							strokeWidth="6"
							fill="none"
							strokeLinecap="round"
							opacity={0.85}
						/>
					))}
				</svg>
				{BADGES.map((b, i) => {
					const show = appear(g, tanpa + 4 + i * 5, 10);
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: b.x,
								top: b.y + Math.sin(f / 9 + i) * 8,
								width: 130,
								height: 130,
								borderRadius: 32,
								background: C.ungu,
								border: `4px solid ${SOFT}`,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								opacity: show,
								transform: `rotate(${b.rot}deg) scale(${0.7 + 0.3 * show})`,
							}}
						>
							<Wrench size={70} color={C.putih} strokeWidth={2} />
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* BAGIAN 3 — MATRIKS 4 KUADRAN (00:14–00:25)                          */
/* ------------------------------------------------------------------ */

const WarnIcon: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 110 110">
		<polygon
			points="55,10 104,98 6,98"
			fill="none"
			stroke={C.merah}
			strokeWidth="8"
			strokeLinejoin="round"
		/>
		<line x1="55" y1="42" x2="55" y2="68" stroke={C.merah} strokeWidth="8" strokeLinecap="round" />
		<circle cx="55" cy="83" r="5" fill={C.merah} />
	</svg>
);

type Quad = {id: string; label: string; bad?: boolean};

const QUADS: Quad[] = [
	{id: 'q1', label: 'RUANG LINGKUP'},
	{id: 'q2', label: 'SUMBER DAYA'},
	{id: 'q3', label: 'TITIK RAWAN', bad: true},
	{id: 'q4', label: 'TARGET KEBERHASILAN'},
];

const QuadIcon: React.FC<{id: string}> = ({id}) => {
	if (id === 'q1') return <Maximize size={110} color={C.kuning} strokeWidth={1.8} />;
	if (id === 'q2') return <Package size={110} color={C.kuning} strokeWidth={1.8} />;
	if (id === 'q3') return <WarnIcon size={110} />;
	return <Target size={110} color={C.kuning} strokeWidth={1.8} />;
};

const SceneMatriks: React.FC = () => {
	const g = useG();
	const pertama = cue('pertama').s;
	const kuadran = cue('kuadran').s;
	return (
		<AbsoluteFill>
			<TitleSwap
				items={[
					{text: '[[Dua]] dimensi penting', at: 4},
					{text: '1. [[Matriks 4 Kuadran]]', at: pertama},
				]}
			/>
			<KepoCorner
				items={[
					{expr: 'penasaran', at: 0},
					{expr: 'mikir', at: kuadran},
					{expr: 'paham', at: cue('q4').s + 20},
				]}
			/>
			{QUADS.map((q, i) => {
				const c = cue(q.id);
				const col = i % 2;
				const row = Math.floor(i / 2);
				const skeleton = appear(g, kuadran + i * 4, 14);
				const filled = appear(g, c.s, 12);
				const active = g >= c.s && g < c.e;
				const border = active ? (q.bad ? C.merah : C.kuning) : SOFT;
				return (
					<div
						key={q.id}
						style={{
							...cardStyle(border, active && !q.bad),
							position: 'absolute',
							left: 60 + col * 470,
							top: 520 + row * 370,
							width: 430,
							height: 340,
							opacity: skeleton,
							transform: `translateY(${(1 - skeleton) * 40}px) scale(${active ? 1.03 : 1})`,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 22,
						}}
					>
						<div style={{opacity: filled, transform: `scale(${0.8 + 0.2 * filled})`}}>
							<QuadIcon id={q.id} />
						</div>
						<div
							style={{
								opacity: filled,
								fontSize: 40,
								fontWeight: 800,
								textAlign: 'center',
								lineHeight: 1.15,
								padding: '0 24px',
								color: q.bad ? C.merah : C.putih,
							}}
						>
							{q.label}
						</div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* BAGIAN 4 — BACKWARD CHAINING (00:25–00:36)                          */
/* ------------------------------------------------------------------ */

const SceneChaining: React.FC = () => {
	const g = useG();
	const times = [cue('hasil').s, cue('mundur').s, cue('syarat').s, cue('awal').s];
	const labels = ['Hasil akhir', 'Syarat B', 'Syarat A', 'Titik awal'];
	const inversion = cue('inversion').s;
	return (
		<AbsoluteFill>
			<TitleSwap items={[{text: 'Pipeline: [[tarik mundur]]', at: 4}]} />
			<KepoCorner
				items={[
					{expr: 'penasaran', at: 0},
					{expr: 'mikir', at: inversion},
					{expr: 'paham', at: times[3] + 18},
				]}
			/>

			{labels.map((label, i) => {
				const top = 520 + i * 174;
				const first = i === 0;
				const last = i === labels.length - 1;
				return (
					<React.Fragment key={label}>
						<Pop at={times[i]} style={{position: 'absolute', left: 100, top}}>
							<div
								style={{
									...cardStyle(first ? C.kuning : last ? C.kuning : SOFT),
									background: first ? C.kuning : C.ungu,
									width: 760,
									height: 118,
									borderRadius: 34,
									display: 'flex',
									alignItems: 'center',
									gap: 28,
									padding: '0 36px',
								}}
							>
								{first ? (
									<Flag size={58} color={C.indigo} strokeWidth={2.2} />
								) : (
									<div
										style={{
											width: 24,
											height: 24,
											borderRadius: 12,
											background: last ? C.kuning : C.putih,
											opacity: last ? 1 : 0.6,
										}}
									/>
								)}
								<div
									style={{
										fontSize: 48,
										fontWeight: 800,
										color: first ? C.indigo : C.putih,
									}}
								>
									{label}
								</div>
							</div>
						</Pop>
						{i < labels.length - 1 && (
							<div style={{position: 'absolute', left: 458, top: top + 118}}>
								<UpArrow at={times[i + 1] + 6} />
							</div>
						)}
					</React.Fragment>
				);
			})}

			<Pop at={inversion + 6} dy={24} style={{position: 'absolute', left: 100, top: 1172}}>
				<div
					style={{
						...cardStyle(SOFT),
						width: 760,
						height: 80,
						borderRadius: 40,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 34,
						fontWeight: 600,
						color: C.putih,
					}}
				>
					<Rich text="[[Inversion]] = mulai dari akhir" />
				</div>
			</Pop>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* BAGIAN 5 — SISTEM IPO (00:36–00:44)                                 */
/* ------------------------------------------------------------------ */

const PILL_X = [60, 390, 720];

const Pill: React.FC<{
	x: number;
	top: number;
	title: string;
	sub: string;
	at: number;
	hot?: boolean;
}> = ({x, top, title, sub, at, hot}) => (
	<Pop at={at} dy={30} style={{position: 'absolute', left: x, top}}>
		<div
			style={{
				...cardStyle(hot ? C.kuning : SOFT, hot),
				width: 240,
				height: 170,
				borderRadius: 34,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 6,
			}}
		>
			<div style={{fontSize: 42, fontWeight: 800, color: hot ? C.kuning : C.putih}}>
				{title}
			</div>
			<div style={{fontSize: 27, fontWeight: 500, color: C.putih, opacity: 0.8}}>{sub}</div>
		</div>
	</Pop>
);

const SceneIPO: React.FC = () => {
	const g = useG();
	const inC = cue('in');
	const outC = cue('out');
	const list = cue('list');
	const chain = cue('chain');
	const tIn = inC.s;
	const tProc = Math.round((inC.s + inC.e) / 2);
	const tOut = outC.s;
	const chainAt = chain.s;

	const listChip = appear(g, list.s, 12) * (1 - appear(g, chainAt - 2, 8));
	const connector = interpolate(g, [chainAt, chainAt + 22], [1, 0], clampOpts);

	return (
		<AbsoluteFill>
			<TitleSwap items={[{text: 'Sistem [[IPO]]', at: 4}]} />
			<KepoCorner
				items={[
					{expr: 'mikir', at: 0},
					{expr: 'kaget', at: chainAt + 14},
				]}
			/>

			{/* Tahap 1 */}
			<Pill x={PILL_X[0]} top={540} title="INPUT" sub="bahan awal" at={tIn} />
			<Pill x={PILL_X[1]} top={540} title="PROSES" sub="langkah kerja" at={tProc} />
			<Pill
				x={PILL_X[2]}
				top={540}
				title="OUTPUT"
				sub="hasil nyata"
				at={tOut}
				hot={g >= chainAt}
			/>
			<div style={{position: 'absolute', left: 310, top: 605}}>
				<RightArrow at={tProc} />
			</div>
			<div style={{position: 'absolute', left: 640, top: 605}}>
				<RightArrow at={tOut} />
			</div>

			{/* Penghubung output tahap 1 -> input tahap 2 */}
			<svg
				width={W}
				height={H}
				style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
			>
				<path
					d="M840 712 C840 800, 180 770, 180 858"
					pathLength={1}
					strokeDasharray={1}
					strokeDashoffset={connector}
					stroke={C.kuning}
					strokeWidth="7"
					strokeLinecap="round"
					fill="none"
				/>
			</svg>

			{/* Tahap 2 */}
			<Pill
				x={PILL_X[0]}
				top={860}
				title="INPUT"
				sub="dari tahap 1"
				at={chainAt + 14}
				hot
			/>
			<Pill x={PILL_X[1]} top={860} title="PROSES" sub="langkah kerja" at={chainAt + 20} />
			<Pill x={PILL_X[2]} top={860} title="OUTPUT" sub="hasil nyata" at={chainAt + 26} />
			<div style={{position: 'absolute', left: 310, top: 925}}>
				<RightArrow at={chainAt + 20} />
			</div>
			<div style={{position: 'absolute', left: 640, top: 925}}>
				<RightArrow at={chainAt + 26} />
			</div>

			{/* Bukan sekadar daftar kesibukan */}
			<div
				style={{
					position: 'absolute',
					left: 160,
					top: 1090,
					width: 640,
					height: 84,
					borderRadius: 42,
					border: `4px solid ${C.merah}`,
					background: C.ungu,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: 36,
					fontWeight: 600,
					color: C.merah,
					opacity: listChip,
					transform: `translateY(${(1 - listChip) * 20}px)`,
				}}
			>
				✕ Bukan daftar kesibukan
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* BAGIAN 6 — PENUTUP (00:44–00:50)                                    */
/* ------------------------------------------------------------------ */

const ScenePenutup: React.FC = () => {
	const g = useG();
	const pelaksana = cue('pelaksana').s;
	const arsi = cue('arsi').s;
	const arah = cue('arah');
	const tanya = cue('tanya').s;

	const phaseB = appear(g, tanya, 12);
	const aOpacity = 1 - appear(g, tanya - 6, 10);
	const arrowLen = interpolate(g, [arah.s, arah.s + 24], [0, 1], {
		...clampOpts,
		easing: ease,
	});

	return (
		<AbsoluteFill>
			{/* Fase A: tools vs arsitektur */}
			<div style={{opacity: aOpacity}}>
				<TitleSwap
					items={[
						{text: 'Tools hanyalah [[pelaksana]]', at: 4},
						{text: 'Arsitektur berpikir [[menentukan arah]]', at: arsi},
					]}
				/>
				<KepoCorner
					items={[
						{expr: 'mikir', at: 0},
						{expr: 'penasaran', at: arsi},
					]}
				/>
				<Pop at={pelaksana + 4} style={{position: 'absolute', left: 60, top: 540}}>
					<div
						style={{
							...cardStyle(SOFT),
							width: 900,
							height: 230,
							display: 'flex',
							alignItems: 'center',
							gap: 36,
							padding: '0 48px',
							opacity: 1 - 0.35 * appear(g, arsi, 12),
						}}
					>
						<Wrench size={96} color={C.putih} strokeWidth={1.8} />
						<div>
							<div style={{fontSize: 48, fontWeight: 800, color: C.putih}}>TOOLS</div>
							<div style={{fontSize: 34, fontWeight: 500, color: C.putih, opacity: 0.8}}>
								pelaksana
							</div>
						</div>
					</div>
				</Pop>
				<Pop at={arsi} style={{position: 'absolute', left: 60, top: 800}}>
					<div
						style={{
							...cardStyle(C.kuning, true),
							width: 900,
							height: 400,
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							gap: 28,
							padding: '0 48px',
						}}
					>
						<div style={{display: 'flex', alignItems: 'center', gap: 36}}>
							<Brain size={120} color={C.kuning} strokeWidth={1.8} />
							<div>
								<div style={{fontSize: 46, fontWeight: 800, color: C.kuning, lineHeight: 1.1}}>
									ARSITEKTUR
									<br />
									BERPIKIR
								</div>
								<div
									style={{
										fontSize: 34,
										fontWeight: 500,
										color: C.putih,
										opacity: 0.85,
										marginTop: 6,
									}}
								>
									penentu arah
								</div>
							</div>
						</div>
						<svg width="800" height="50" viewBox="0 0 800 50">
							<line
								x1="10"
								y1="25"
								x2={10 + 740 * arrowLen}
								y2="25"
								stroke={C.kuning}
								strokeWidth="9"
								strokeLinecap="round"
							/>
							<path
								d="M728 6 L756 25 L728 44"
								fill="none"
								stroke={C.kuning}
								strokeWidth="9"
								strokeLinecap="round"
								strokeLinejoin="round"
								opacity={arrowLen > 0.98 ? 1 : 0}
							/>
						</svg>
					</div>
				</Pop>
			</div>

			{/* Fase B: pertanyaan penutup, Kepo paham */}
			<div style={{opacity: phaseB}}>
				<div
					style={{
						position: 'absolute',
						left: 60,
						top: 290,
						width: 900,
						textAlign: 'center',
						fontSize: 84,
						fontWeight: 800,
						lineHeight: 1.12,
						transform: `translateY(${(1 - phaseB) * 30}px)`,
					}}
				>
					<Rich text="Sudahkah kamu membangun [[sistem]] dulu?" />
				</div>
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 680,
						width: W,
						display: 'flex',
						justifyContent: 'center',
						transform: `scale(${0.9 + 0.1 * phaseB})`,
					}}
				>
					<Kepo size={400} expr="paham" />
				</div>
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* OUTRO — "Besok penasaran apa lagi?" (00:54–00:56)                   */
/* ------------------------------------------------------------------ */

const SceneOutro: React.FC = () => {
	const g = useG();
	const t0 = sec(SECTIONS[6].from);
	return (
		<AbsoluteFill>
			<Pop
				at={t0 + 1}
				style={{
					position: 'absolute',
					left: 0,
					top: 400,
					width: W,
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<Kepo size={300} expr="penasaran" />
			</Pop>
			<Pop
				at={t0 + 4}
				style={{
					position: 'absolute',
					left: 60,
					top: 850,
					width: 900,
					textAlign: 'center',
					fontSize: 88,
					fontWeight: 800,
					lineHeight: 1.1,
				}}
			>
				<Rich text="Besok [[penasaran]] apa lagi?" />
			</Pop>
			<Pop
				at={t0 + 12}
				style={{
					position: 'absolute',
					left: 0,
					top: 1090,
					width: W,
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<div
					style={{
						background: C.kuning,
						color: C.indigo,
						fontSize: 44,
						fontWeight: 800,
						borderRadius: 60,
						padding: '20px 52px',
						transform: `scale(${1 + 0.03 * Math.sin(g / 5)})`,
					}}
				>
					Follow @rumahpenasaran
				</div>
			</Pop>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ */
/* ROOT                                                                */
/* ------------------------------------------------------------------ */

const VIEWS: Record<SectionId, React.FC> = {
	hook: SceneHook,
	masalah: SceneMasalah,
	matriks: SceneMatriks,
	chaining: SceneChaining,
	ipo: SceneIPO,
	penutup: ScenePenutup,
	outro: SceneOutro,
};

const DebugMarker: React.FC = () => {
	const f = useCurrentFrame();
	const s = SECTIONS.find((x) => f >= sec(x.from) && f < sec(x.to)) ?? SECTIONS[6];
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 8,
				width: W,
				textAlign: 'center',
				fontSize: 26,
				fontWeight: 600,
				color: C.putih,
				opacity: 0.7,
			}}
		>
			{s.name} · {(f / FPS).toFixed(2)}s
		</div>
	);
};

export const ArsitekturBerpikir: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: C.indigo, fontFamily, color: C.putih}}>
			<Background />
			<Header />
			{SECTIONS.map((s) => {
				const View = VIEWS[s.id];
				return (
					<Scene key={s.id} section={s}>
						<View />
					</Scene>
				);
			})}
			<Subtitles />
			{SHOW_DEBUG && <DebugMarker />}
		</AbsoluteFill>
	);
};

export default ArsitekturBerpikir;
