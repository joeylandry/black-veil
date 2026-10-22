// jagged "torn" edges: gives every .torn element a random clip-path
document.querySelectorAll('.torn').forEach((el, n) => {
  let seed = 7 + n * 13; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pts = [], steps = 28, j = 1.4;
  for (let i = 0; i <= steps; i++) pts.push(`${(i / steps) * 100}% ${rnd() * j}%`);
  for (let i = 1; i <= steps; i++) pts.push(`${100 - rnd() * j}% ${(i / steps) * 100}%`);
  for (let i = steps - 1; i >= 0; i--) pts.push(`${(i / steps) * 100}% ${100 - rnd() * j}%`);
  for (let i = steps - 1; i > 0; i--) pts.push(`${rnd() * j}% ${(i / steps) * 100}%`);
  el.style.setProperty('--tear', `polygon(${pts.join(',')})`);
});
