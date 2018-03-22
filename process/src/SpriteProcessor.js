"use strict";

const Canvas = require('canvas');
const fs = require('fs');

class SpriteProcessor {
  constructor(spritesDir, pngDir) {
    this.spritesDir = spritesDir;
    this.pngDir = pngDir;
    this.canvas = new Canvas(512, 1024);
    this.context = this.canvas.getContext('2d');
  }

  process(objects) {
    for (var id in objects) {
      this.processObject(objects[id]);
    }
  }

  processObject(object) {
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var sprite of object.sprites) {
      this.parseSpriteFile(sprite);
      this.drawSprite(sprite);
    }

    const bounds = this.objectBounds(object);
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;

    const newCanvas = new Canvas(Math.max(width, 128), Math.max(height, 128));
    const newContext = newCanvas.getContext('2d');

    newContext.setTransform(1, 0, 0, 1, 0, 0);

    newContext.drawImage(
      this.canvas,
      bounds.minX + this.canvas.width / 2,
      -bounds.maxY + this.canvas.height / 2,
      width,
      height,
      (newCanvas.width - width) / 2,
      (newCanvas.height - height) / 2,
      width,
      height
    );

    // Debug
    this.context.beginPath(); //
    this.context.rect(bounds.minX + this.canvas.width / 2, -bounds.maxY + this.canvas.height / 2, width, height);
    this.context.stroke();
    this.context.closePath(); //

    fs.writeFileSync(this.pngDir + "/obj_" + object.data.id + ".png", newCanvas.toBuffer());
  }

  parseSpriteFile(sprite) {
    const path = this.spritesDir + "/" + sprite.id + ".txt";
    const data = fs.readFileSync(path, "utf8").split(' ');
    sprite.parseExtraData(data);
  }

  drawSprite(sprite) {
    // Draw sprites as if they were 20 years old
    if (sprite.beyondAge(20)) return;

    this.drawSpriteImage(sprite, this.context);

    if (sprite.color.find(c => c < 1.0))
      this.overlayColor(sprite)
  }

  drawSpriteImage(sprite, context) {
    var img = new Canvas.Image;
    img.src = fs.readFileSync(this.pngDir + "/sprite_" + sprite.id + ".png");
    sprite.width = img.width;
    sprite.height = img.height;

    const angleRads = parseFloat(sprite.rotation) * Math.PI * 2;
    const x = parseFloat(sprite.x);
    const y = parseFloat(sprite.y);

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(x + context.canvas.width / 2, -y + context.canvas.height / 2);
    context.rotate(angleRads);
    if (sprite.hFlip == 1) context.scale(-1, 1);
    context.drawImage(
      img,
      -img.width / 2 - sprite.centerAnchorXOffset,
      -img.height / 2 - sprite.centerAnchorYOffset,
      img.width,
      img.height
    );
  }

  overlayColor(sprite) {
    const newCanvas = new Canvas(this.canvas.width, this.canvas.height);
    const newContext = newCanvas.getContext('2d');

    this.drawSpriteImage(sprite, newContext)

    const color = sprite.color.map(c => Math.round(c*255)).join(", ");

    newContext.globalCompositeOperation = "source-in";
    newContext.setTransform(1, 0, 0, 1, 0, 0);
    newContext.fillStyle = "rgb(" + color + ")";
    newContext.fillRect(0, 0, newCanvas.width, newCanvas.height);

    const previousOperation = this.context.globalCompositeOperation;
    this.context.globalCompositeOperation = "multiply";

    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.drawImage(
      newCanvas,
      0,
      0,
      newCanvas.width,
      newCanvas.height
    );

    this.context.globalCompositeOperation = previousOperation;
  }

  objectBounds(object) {
    var maxX = 0;
    var maxY = 0;
    var minX = 0;
    var minY = 0;

    for (var sprite of object.sprites) {
      for (var point of this.spritePoints(sprite)) {
        if (point.x > maxX) maxX = point.x + 2;
        if (point.x < minX) minX = point.x - 2;
        if (point.y > maxY) maxY = point.y + 2;
        if (point.y < minY) minY = point.y - 2;
      }
    }

    return {minX, minY, maxX, maxY};
  }

  spritePoints(sprite) {
    if (!sprite.width || !sprite.height) {
      return [];
    }

    const x = parseFloat(sprite.x);
    const y = parseFloat(sprite.y);

    var points = [
      {x: -sprite.width/2, y: -sprite.height/2},
      {x: sprite.width/2, y: -sprite.height/2},
      {x: sprite.width/2, y: sprite.height/2},
      {x: -sprite.width/2, y: sprite.height/2},
    ]

    const angleRads = parseFloat(sprite.rotation) * Math.PI * 2;
    const cosA = Math.cos(angleRads);
    const sinA = Math.sin(angleRads);

    for (var point of points) {
      point.x -= sprite.centerAnchorXOffset;
      point.y += sprite.centerAnchorYOffset;
      point.x = point.x * cosA - point.y * sinA;
      point.y = point.y * cosA + point.x * sinA;
      point.x += x;
      point.y += y;
    }
    return points;
  }
}

module.exports = SpriteProcessor;
