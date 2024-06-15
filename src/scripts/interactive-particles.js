document.addEventListener("DOMContentLoaded", () => {
    const particles = document.querySelectorAll('.particle');
    const mouse = { x: 0, y: 0 };

    particles.forEach(particle => {
        particle.x = Math.random() * window.innerWidth;
        particle.y = Math.random() * window.innerHeight;
        particle.velocityX = 0;
        particle.velocityY = 0;
    });

    document.addEventListener("mousemove", () => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        particles.forEach(particle => {
            const dx = particle.x - mouse.x;
            const dy = particle.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxDistance = 200; // max distance to affect particles
            const force = (maxDistance - distance) / maxDistance; // stronger force when closer
            const directionX = forceDirectionX * force * 0.6;
            const directionY = forceDirectionY * force * 0.6;

            if (distance < maxDistance) {
                particle.velocityX += directionX;
                particle.velocityY += directionY;
            }
        });
    });

    function animateParticles() {
        particles.forEach(particle => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;

            particle.velocityX *= 0.95; // friction
            particle.velocityY *= 0.95;

            // Boundaries
            if (particle.x > window.innerWidth) particle.x = 0;
            if (particle.x < 0) particle.x = window.innerWidth;
            if (particle.y > window.innerHeight) particle.y = 0;
            if (particle.y < 0) particle.y = window.innerHeight;

            particle.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
        });

        requestAnimationFrame(animateParticles);
    }

    animateParticles();
});
