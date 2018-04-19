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
    this.renderSprites(this.visibleSprites(object), object.id);

    // Draw only the last sprite
    if (object.data.numUses > 1 && object.transitionsAway.filter(t => t.lastUseActor || t.lastUseTarget).length > 0) {
      this.renderSprites(this.lastSprites(object), object.id + "_last");
    }
  }

  visibleSprites(object) {
    const hideIndexes = object.data.useVanishIndex == -1 && object.data.numUses > 1 ?
      object.data.useAppearIndex.split(",").map(i => parseInt(i)) :
      [];
    // Draw sprites as if they were 20 years old
    return object.sprites.filter((s,i) => !s.beyondAge(20) && !hideIndexes.includes(i))
  }

  lastSprites(object) {
    if (object.data.useVanishIndex != -1) {
      const hideIndexes = object.data.useVanishIndex.split(",").map(i => parseInt(i));
      hideIndexes.shift(); // still draw the first sprite
      return this.visibleSprites(object).filter((s,i) => !hideIndexes.includes(i));
    }
    if (object.data.useAppearIndex != -1) {
      const useIndexes = object.data.useAppearIndex.split(",").map(i => parseInt(i))
      const indexes = useIndexes.filter((_, i) => i+1 < parseInt(object.data.numUses));
      const useSprites = object.sprites.filter((s,i) => indexes.includes(i));
      const sprites = this.visibleSprites(object);
      // Insert the use sprites after the last index
      // add 2 to work around goose pond rendering
      sprites.splice(indexes.pop() - useSprites.length + 2, 0, ...useSprites);
      return sprites;
    }
    return object.sprites;
  }

  renderSprites(sprites, name) {
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var sprite of sprites) {
      this.parseSpriteFile(sprite);
      this.drawSprite(sprite);
    }

    const bounds = this.spritesBounds(sprites);
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;

    const newCanvas = new Canvas(width, height);
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

    fs.writeFileSync(`${this.pngDir}/obj_${name}.png`, newCanvas.toBuffer());
  }

  parseSpriteFile(sprite) {
    const path = `${this.spritesDir}/${sprite.id}.txt`
    const data = fs.readFileSync(path, "utf8").split(' ');
    sprite.parseExtraData(data);
  }

  drawSprite(sprite) {
    this.drawSpriteImage(sprite, this.context);

    if (sprite.color.find(c => c < 1.0))
      this.overlayColor(sprite)
  }

  drawSpriteImage(sprite, context) {
    var img = new Canvas.Image;
    img.src = fs.readFileSync(`${this.pngDir}/sprite_${sprite.id}.png`);
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

  spritesBounds(sprites) {
    var maxX = 0;
    var maxY = 0;
    var minX = 0;
    var minY = 0;

    for (var sprite of sprites) {
      for (var point of this.spritePoints(sprite)) {
        if (point.x > maxX) maxX = point.x + 2;
        if (point.x < minX) minX = point.x - 2;
        if (point.y > maxY) maxY = point.y + 2;
        if (point.y < minY) minY = point.y - 2;
      }
    }

    // Trim transparent pixels off
    const padding = 15;
    const threshold = 3*255;
    const image = this.context.getImageData(
      minX + this.canvas.width / 2,
      -maxY + this.canvas.height / 2,
      maxX - minX,
      maxY - minY
    );
    minX += this.leftTrim(image, threshold) - padding;
    maxX -= this.rightTrim(image, threshold) - padding;
    maxY -= this.topTrim(image, threshold) - padding;
    minY += this.bottomTrim(image, threshold) - padding;

    return {minX, minY, maxX, maxY};
  }

  leftTrim(image, threshold) {
    for (let col=0; col < image.width; col++) {
      let opacity = 0;
      for (let row=0; row < image.height; row++) {
        opacity += image.data[(row*image.width+col)*4+3]; // Alpha pixel
        if (opacity > threshold) return col;
      }
    }
    throw "Unable to find opaque pixels in image";
  }

  rightTrim(image, threshold) {
    for (let col=image.width-1; col >= 0; col--) {
      let opacity = 0;
      for (let row=image.height-1; row >= 0; row--) {
        opacity += image.data[(row*image.width+col)*4+3]; // Alpha pixel
        if (opacity > threshold) return image.width-1-col;
      }
    }
    throw "Unable to find opaque pixels in image";
  }

  topTrim(image, threshold) {
    for (let row=0; row < image.height; row++) {
      let opacity = 0;
      for (let col=0; col < image.width; col++) {
        opacity += image.data[(row*image.width+col)*4+3]; // Alpha pixel
        if (opacity > threshold) return row;
      }
    }
    throw "Unable to find opaque pixels in image";
  }

  bottomTrim(image, threshold) {
    for (let row=image.height-1; row >= 0; row--) {
      let opacity = 0;
      for (let col=image.width-1; col >= 0; col--) {
        opacity += image.data[(row*image.width+col)*4+3]; // Alpha pixel
        if (opacity > threshold) return image.height-1-row;
      }
    }
    throw "Unable to find opaque pixels in image";
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
