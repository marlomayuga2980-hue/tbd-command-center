import { motion } from 'framer-motion';
import { useMemo } from 'react';

const COLORS = [
  '#1E4DB7', '#E8743E', '#10B981', '#F59E0B',
  '#EF4444', '#FFFFFF', '#0F3A8F', '#FCD34D',
  '#60A5FA', '#F472B6', '#34D399', '#FBBF24',
];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Confetti() {
  const particles = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => {
      const angle    = randomBetween(0, 360);
      const distance = randomBetween(80, 220);
      const rad      = (angle * Math.PI) / 180;
      return {
        id:       i,
        color:    COLORS[i % COLORS.length],
        tx:       Math.cos(rad) * distance,
        ty:       Math.sin(rad) * distance,
        size:     randomBetween(6, 13),
        rotation: randomBetween(-180, 180),
        duration: randomBetween(0.6, 1.1),
      };
    }),
  []);

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        top: '40%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            width:  p.size,
            height: p.size * 0.5,
            borderRadius: 2,
            backgroundColor: p.color,
            top: 0,
            left: 0,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.tx, y: p.ty, opacity: 0, rotate: p.rotation, scale: 0.3 }}
          transition={{ duration: p.duration, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}
