"use strict";

const Image = require('canvas').Image;
const fs = require('fs');

class Sprite {
  constructor(lines) {
    this.id = lines[0].split('=')[1];
    const position = lines[1].split('=')[1].split(',');
    this.x = position[0];
    this.y = position[1];
    this.rotation = lines[2].split('=')[1];
    this.hFlip = lines[3].split('=')[1];
    this.color = lines[4].split('=')[1].split(',');
    this.ageRange = lines[5].split('=')[1].split(',').map(parseFloat);
  }

  parseSpriteFile(spritesDir) {
    const parts = fs.readFileSync(spritesDir + "/" + this.id + ".txt", "utf8").split(' ');
    this.tag = parts[0];
    this.multiplicativeBlending = parts[1] === '1';
    this.centerAnchorXOffset = parseFloat(parts[2]);
    this.centerAnchorYOffset = parseFloat(parts[3]);
  }

  beyondAge(age) {
    return (this.ageRange[0] > -1 || this.ageRange[1] > -1) && (this.ageRange[0] > age || this.ageRange[1] < age);
  }

  draw(pngDir, canvas, context) {
    // Draw sprites as if they were 20 years old
    if (this.beyondAge(20)) return;

    const [r, g, b] = this.color;

    var img = new Image;
    img.src = fs.readFileSync(pngDir + "/sprite_" + this.id + ".png");
    this.width = img.width;
    this.height = img.height;

    const angleRads = parseFloat(this.rotation) * Math.PI * 2;
    const x = parseFloat(this.x);
    const y = parseFloat(this.y);

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(x + canvas.width / 2, -y + canvas.height / 2);
    context.rotate(angleRads);
    if (this.hFlip == 1) context.scale(-1, 1);
    context.drawImage(
      img,
      -img.width / 2 - this.centerAnchorXOffset,
      -img.height / 2 - this.centerAnchorYOffset,
      img.width,
      img.height
    );
  }

  boundaryPoints() {
    if (!this.width || !this.height) {
      return [];
    }

    const x = parseFloat(this.x);
    const y = parseFloat(this.y);

    var points = [
      {x: -this.width/2, y: -this.height/2},
      {x: this.width/2, y: -this.height/2},
      {x: this.width/2, y: this.height/2},
      {x: -this.width/2, y: this.height/2},
    ]

    const angleRads = parseFloat(this.rotation) * Math.PI * 2;
    const cosA = Math.cos(angleRads);
    const sinA = Math.sin(angleRads);

    for (var point of points) {
      point.x -= this.centerAnchorXOffset;
      point.y += this.centerAnchorYOffset;
      point.x = point.x * cosA - point.y * sinA;
      point.y = point.y * cosA + point.x * sinA;
      point.x += x;
      point.y += y;
    }
    return points;
  }
}

module.exports = Sprite;
