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
    let tiles = [];
    img.loadPixels();
    
    for(let row = 0; row < img.height; row++){
        for(let col = 0; col < img.width; col++){
            let tileImage = createImage(TILE_SIZE, TILE_SIZE);
            // tileImage.copy(img, col, row, 3, 3, 0, 0, 3, 3); 
            copyTile(img, col, row, TILE_SIZE, tileImage);
            tiles.push(new Tile(tileImage, tiles.length)); // tiles.length updates accordingly with more tiles
        }
    }

    return tiles;
}

function resetGrid(){
    for(let i = 0; i < grid.length; i++){
        grid[i].collapsed = false;
        grid[i].checked = false;
        grid[i].options = [];
        for(let j = 0; j < tiles.length; j++){
            grid[i].options.push(j);
        }
    }
}