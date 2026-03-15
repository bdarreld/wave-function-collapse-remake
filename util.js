function renderImage(img, x, y, w){
    for(let row = 0; row < img.height; row++){
        for(let col = 0; col < img.width; col++){
            let index = (col + row * img.width) * 4;
            let r = img.pixels[index + 0];
            let g = img.pixels[index + 1];
            let b = img.pixels[index + 2];
            let a = img.pixels[index + 3];
            fill(r, g, b);
            stroke(50);
            square(x + col * w, y + row * w, w);
        }
    }

    noFill();
    strokeWeight(1);
    stroke(0, 255, 255);
    square(x, y, img.width * w); // img.width is the original image width in pixels. since each pixel is scaled to w x w, we need to multiply by w
}

// render ONLY the center pixel of the tile image
function renderCell(img, x, y, w){
    let row = floor(img.width / 2);
    let col = floor(img.width / 2);

    let index = (col + row * img.width) * 4;
    let r = img.pixels[index + 0];
    let g = img.pixels[index + 1];
    let b = img.pixels[index + 2];
    let a = img.pixels[index + 3];
    fill(r, g, b);
    noStroke();
    square(x, y, w);
}

// sx and sy is offset of x and y
function copyTile(source, sx, sy, w, dest){
    dest.loadPixels();
    
    for(let row = 0; row < w; row++){
        for(let col = 0; col < w; col++){
            let colPixel = (sx + col) % source.width;
            let rowPixel = (sy + row) % source.height;

            let sourceIndex = (colPixel + rowPixel * source.width) * 4;
            let r = source.pixels[sourceIndex + 0];
            let g = source.pixels[sourceIndex + 1];
            let b = source.pixels[sourceIndex + 2];
            let a = source.pixels[sourceIndex + 3];
            
            let destIndex = (col + row * w) * 4; 
            dest.pixels[destIndex + 0] = r;
            dest.pixels[destIndex + 1] = g;
            dest.pixels[destIndex + 2] = b;
            dest.pixels[destIndex + 3] = a;
        }
    }
    dest.updatePixels();
}

function extractTiles(img){
    // Use an object to keep track of unique tiles
    let uniqueTiles = {};
    let indexCounter = 0;
    img.loadPixels();
    
    for(let row = 0; row < img.height; row++){
        for(let col = 0; col < img.width; col++){
            // Create a new image for each tile
            let tileImage = createImage(TILE_SIZE, TILE_SIZE);
            // Copy segment of source image to new image
            copyTile(img, col, row, TILE_SIZE, tileImage);

            let transformations = generateTransformations(tileImage);

            for(let transformedImage of transformations){
                // Is this tile unique?
                let tileKey = transformedImage.canvas.toDataURL();
                if(!uniqueTiles[tileKey]){
                    uniqueTiles[tileKey] = new Tile(transformedImage, indexCounter);
                    indexCounter++;
                }else{
                    uniqueTiles[tileKey].frequency++;
                }
            }
        }
    }

    return Object.values(uniqueTiles);
}


// Create all the rotations and reflections of one tile image
function generateTransformations(tileImage){
    let transformations = [];
    let currentImage = tileImage;

    if(!ROTATIONS && !REFLECTIONS){
        transformations.push(currentImage);
        return transformations;
    }

    // Generate rotations
    // 45 degrees clockwise
    // for(let i = 0; i < 8; i++){
    //     currentImage = rotateImage45(currentImage);
    //     transformations.push(currentImage);
    // }
    // 90 degrees clockwise
    for(let i = 0; i < 4; i++){
        currentImage = rotateImage90(currentImage);
        transformations.push(currentImage);
    }

    if(!REFLECTIONS){
        return transformations;
    }

    // Generate the reflection
    let reflectedImage = reflectImage(currentImage);
    currentImage = reflectedImage;

    // Generate rotations of the reflected image
    // 45 degrees clockwise
    // for(let i = 0; i < 8; i++){
    //     currentImage = rotateImage45(currentImage);
    //     transformations.push(currentImage);
    // }
    // 90 degrees clockwise
    for(let i = 0; i < 4; i++){
        currentImage = rotateImage90(currentImage);
        transformations.push(currentImage);
    }

    return transformations;
}

// Rotate an image 90 degree clockwise
function rotateImage90(tileImage){
    // createImage(width, height). since we are rotating by 90, we switch the height and width
    let rotatedImage = createImage(tileImage.height, tileImage.width);
    rotatedImage.loadPixels();
    tileImage.loadPixels();

    for(let y = 0; y < tileImage.height; y++){
        for(let x = 0; x < tileImage.width; x++){
            let srcIndex = (x + y * tileImage.width) * 4;
            let destIndex = (tileImage.height - 1 - y + x * tileImage.height) * 4;

            rotatedImage.pixels[destIndex + 0] = tileImage.pixels[srcIndex + 0];
            rotatedImage.pixels[destIndex + 1] = tileImage.pixels[srcIndex + 1];
            rotatedImage.pixels[destIndex + 2] = tileImage.pixels[srcIndex + 2];
            rotatedImage.pixels[destIndex + 3] = tileImage.pixels[srcIndex + 3];
        }
    }
    rotatedImage.updatePixels();
    return rotatedImage;
}

// Rotate an image's cells 45 degree clockwise
function rotateImage45(tileImage){
    let rotatedImage = createImage(TILE_SIZE, TILE_SIZE);
    rotatedImage.loadPixels();
    tileImage.loadPixels();

    // mapping[dest] = src;
    let mapping = [3, 0, 1, 6, 4, 2, 7, 8, 5];

    for(let dest = 0; dest < 9; dest++){
        let src = mapping[dest];
        // loop through all four values
        for(let c = 0; c < 4; c++){ 
            rotatedImage.pixels[dest * 4 + c] = tileImage.pixels[src * 4 + c];
        }
    }
    rotatedImage.updatePixels();
    return rotatedImage;
}

function reflectImage(tileImage){
    let reflectedImage = createImage(tileImage.width, tileImage.height);
    reflectedImage.loadPixels();
    tileImage.loadPixels();

    for(let y = 0; y < tileImage.height; y++){
        for(let x = 0; x < tileImage.width; x++){
            let srcIndex = (x + y * tileImage.width) * 4;
            let destIndex = (tileImage.width - 1 - x + y * tileImage.width)* 4;

            reflectedImage.pixels[destIndex + 0] = tileImage.pixels[srcIndex + 0];
            reflectedImage.pixels[destIndex + 1] = tileImage.pixels[srcIndex + 1];
            reflectedImage.pixels[destIndex + 2] = tileImage.pixels[srcIndex + 2];
            reflectedImage.pixels[destIndex + 3] = tileImage.pixels[srcIndex + 3];
        }
    }
    reflectedImage.updatePixels();
    return reflectedImage;
}

function arrayEquals(a, b){
    return a.length === b.length &&
    a.every((element, index) => element === b[index]);
}