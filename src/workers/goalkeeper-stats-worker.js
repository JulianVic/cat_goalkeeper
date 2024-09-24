let level = 1;
const maxLevel = 50;

self.addEventListener('message', function(e) {
  if (e.data === 'goal') {
    level = Math.min(level + 1, maxLevel);
    
    // Calcular nuevos valores basados en el nivel
    const x = 110 + (level - 1) * 13.75;
    const width = 0.35 + (level - 1) * 0.0375;
    
    // Enviar los nuevos valores al hilo principal
    self.postMessage({ level, x, width });
  } else if (e.data === 'reset') {
    level = 1;
    self.postMessage({ level, x: 110, width: 0.35 });
  }
});
