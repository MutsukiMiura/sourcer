export const fewMissile = `
var missile = function(controller) {
  if(controller.scanEnemy(90, 180)) {
      controller.turnLeft();
  } else {
      controller.turnRight();
  }
  if(controller.frame() % 2 === 0) {
    controller.speedUp();
  }
};

var current = 150;
var bot = function(controller) {
  if (controller.frame() % 32 === 0) {
    current = Math.random() * 200 + 50;
  }

  if (!controller.scanEnemy(0, 180)) {
    controller.turn();
    return;
  }

  if (controller.altitude() < current) {
    controller.ascent();
  }

  if (controller.frame() % 8 === 0) {
    controller.ahead();
  }

  if (controller.frame() % 10 === 0) {
    if (controller.temperature() < 80) {
      if (controller.scanEnemy(0, 20)) {
        controller.fireLaser(0, 100);
      } else if (controller.scanEnemy(30, 40)) {
        controller.fireLaser(30, 100);
      } else if (controller.scanEnemy(-30, 40)) {
        controller.fireLaser(-30, 100);
      }
    }
  } else if(controller.frame() % 32 === 0) {
    controller.fireMissile(missile);
  }
};
return bot;
`;
