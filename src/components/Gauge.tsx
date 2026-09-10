import { motion } from 'framer-motion';

interface GaugeProps {
  value: number;
  size?: number;
  label?: string;
  color?: string;
}

export function Gauge({ value, size = 160, label, color }: GaugeProps) {
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius;
  const clampedValue = Math.max(0, Math.min(100, value));
  const offset = circumference - (clampedValue / 100) * circumference;

  const gaugeColor = color || (clampedValue >= 80 ? '#10B981' : clampedValue >= 50 ? '#FFB800' : clampedValue >= 25 ? '#FF8C42' : '#FF2D55');

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size / 2 + 30 }}>
      <svg width={size} height={size / 2 + 10} className="overflow-visible">
        <defs>
          <linearGradient id={`gauge-grad-${value}-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF2D55" />
            <stop offset="50%" stopColor="#FFB800" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <filter id={`gauge-glow-${value}-${size}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background arc */}
        <path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <motion.path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke={`url(#gauge-grad-${value}-${size})`}
          strokeWidth="10"
          strokeLinecap="round"
          filter={`url(#gauge-glow-${value}-${size})`}
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        {/* Needle */}
        <motion.line
          x1={size / 2}
          y1={size / 2}
          x2={size / 2}
          y2={size / 2 - radius + 5}
          stroke={gaugeColor}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ rotate: -90 }}
          animate={{ rotate: -90 + (clampedValue / 100) * 180 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ originX: '50%', originY: '100%', transformOrigin: `${size / 2}px ${size / 2}px` }}
        />
        <circle cx={size / 2} cy={size / 2} r="5" fill={gaugeColor} filter={`url(#gauge-glow-${value}-${size})`} />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <motion.span
          className="font-display text-3xl font-bold"
          style={{ color: gaugeColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(clampedValue)}
        </motion.span>
        {label && <span className="text-xs text-slate-400 mt-0.5">{label}</span>}
      </div>
    </div>
  );
}
