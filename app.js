const ACTION_WIDTH = 160;

document.querySelectorAll(".task-row").forEach(row => {
  const content = row.querySelector(".task-content");
  let startX = 0;
  let currentX = 0;
  let offset = 0;
  let dragging = false;

  row.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    dragging = true;
  });

  row.addEventListener("touchmove", e => {
    if (!dragging) return;
    currentX = e.touches[0].clientX;
    let dx = currentX - startX + offset;

    dx = Math.min(0, Math.max(-ACTION_WIDTH, dx));

    content.style.transform = `translateX(${dx}px)`;
    content.style.opacity = 1 + dx / ACTION_WIDTH * 0.4;
  });

  row.addEventListener("touchend", () => {
    dragging = false;
    const shouldOpen = currentX - startX < -ACTION_WIDTH / 2;
    offset = shouldOpen ? -ACTION_WIDTH : 0;

    content.style.transform = `translateX(${offset}px)`;
    content.style.opacity = offset ? 0.6 : 1;
  });
});
