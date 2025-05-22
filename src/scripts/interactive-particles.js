document.addEventListener("DOMContentLoaded", () => {
  const particles = document.querySelectorAll('.particle');
  const mouse = { x: 0, y: 0 };

  particles.forEach(p => {
    p.x = Math.random() * window.innerWidth;
    p.y = Math.random() * window.innerHeight;
    p.velocityX = 0;
    p.velocityY = 0;
  });

  // document.addEventListener("mousemove", (e) => {
  //   mouse.x = e.clientX;
  //   mouse.y = e.clientY;

  //   particles.forEach(p => {
  //     const dx = p.x - mouse.x;
  //     const dy = p.y - mouse.y;
  //     const dist = Math.hypot(dx, dy);
  //     const maxDist = 200;
  //     if (dist < maxDist) {
  //       const force = (maxDist - dist) / maxDist * 0.6;
  //       p.velocityX += (dx / dist) * force;
  //       p.velocityY += (dy / dist) * force;
  //     }
  //   });
  // });

  function animate() {
    particles.forEach(p => {
      p.x += p.velocityX;
      p.y += p.velocityY;
      p.velocityX *= 0.95;
      p.velocityY *= 0.95;

      if (p.x > innerWidth) p.x = 0;
      if (p.x < 0) p.x = innerWidth;
      if (p.y > innerHeight) p.y = 0;
      if (p.y < 0) p.y = innerHeight;

      p.style.transform = `translate(${p.x}px, ${p.y}px)`;
    });
    requestAnimationFrame(animate);
  }

  animate();
});