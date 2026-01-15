/**
 * Pure CSS particle background - no JavaScript, no click blocking issues
 */
export function CSSParticles() {
  // Particle configurations: [top%, left%, size in px, delay in s]
  const particles: [number, number, number, number][] = [
    [20, 10, 8, 0], // particle1
    [60, 25, 6, 1], // particle2
    [40, 40, 8, 2], // particle3
    [80, 55, 10, 3], // particle4
    [30, 70, 5, 4], // particle5
    [70, 85, 8, 5], // particle6
    [15, 50, 7, 0.5], // particle7
    [85, 15, 8, 1.5], // particle8
    [45, 90, 9, 2.5], // particle9
    [55, 5, 8, 3.5], // particle10
    [25, 80, 6, 4.5], // particle11
    [75, 35, 8, 5.5], // particle12
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {particles.map(([top, left, size, delay], index) => (
        <div
          key={index}
          className="absolute rounded-full bg-[var(--color-accent-primary)] opacity-30 animate-float motion-reduce:animate-none motion-reduce:opacity-20"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}
