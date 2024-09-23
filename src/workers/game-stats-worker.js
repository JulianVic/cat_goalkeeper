let time = 0;
let goals = 0;
let lives = 3;
let intervalId = null;

function updateTime() {
  time++;
  self.postMessage({ type: 'time', value: time });
}

self.addEventListener('message', function(e) {
  if (e.data === 'start') {
    if (!intervalId) {
      intervalId = setInterval(updateTime, 1000);
    }
  } else if (e.data === 'goal') {
    goals++;
    self.postMessage({ type: 'goals', value: goals });
  } else if (e.data === 'miss') {
    lives--;
    self.postMessage({ type: 'lives', value: lives });
    if (lives === 0) {
      self.postMessage({ type: 'gameover' });

    }
  } else if (e.data === 'reset') {
    clearInterval(intervalId);
    time = 0;
    goals = 0;
    lives = 3;
    self.postMessage({ type: 'reset', time, goals, lives });
    intervalId = setInterval(updateTime, 1000);
  }
}); 