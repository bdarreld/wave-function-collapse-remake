const log2 = Math.log(2);

// each cell in the grid. tiles can be placed in empty cells.
class Cell{
    constructor(tiles, x, y, w, index){
        this.x = x;
        this.y = y;
        this.w = w;
        this.index = index;
        this.options = []; // tile options for this one cell
        this.collapsed = false;

        // at initialization, nothing is placed yet, so options contain everything
        for(let i = 0; i < tiles.length; i++){
            this.options.push(i); // pushes the tile index
        }

        this.previousTotalOptions = -1;
    }

    calculateEntropy(){
        // If the options are the same, then don't recompute the entropy since they are going to be the same
        if(this.previousTotalOptions == this.options.length){
            return;
        }

        this.previousTotalOptions = this.options.length;

        // Compute total frequency of all of the options
        let totalFrequency = 0;
        for(let tileIndex of this.options){
            totalFrequency += tiles[tileIndex].frequency;
        }

        // Shannon entropy: negative sum of all P_i * log_2(P_i) i = 1 to n 
        this.entropy = 0;
        for(let tileIndex of this.options){
            let frequency = tiles[tileIndex].frequency;
            let probability = frequency / totalFrequency;
            this.entropy -= probability * (log(probability) / Math.log(2));
        }
    }

    show(){
        if(this.options.length === 0){
            fill(255, 0, 255);
            square(this.x, this.y, this.w);
        }else if(this.collapsed){
            let tileIndex = this.options[0];
            let img = tiles[tileIndex].img; // tiles is a global variable
            // renderImage(img, this.x, this.y, this.w / 3); // if the cell is this.w width long, the pixels must be w / 3 (3 per cell)
            renderCell(img, this.x, this.y, this.w);
        } else{
            // render the average pixel color of the tile
            let sumR = 0;
            let sumG = 0;
            let sumB = 0;
            for(let i = 0; i < this.options.length; i++){
                let tileIndex = this.options[i];
                let tileImg = tiles[tileIndex].img;
                
                let pixelIndex = (1 + 1 * TILE_SIZE) * 4; // (1, 1) is the middle of a 3 x 3 tile
                let r = tileImg.pixels[pixelIndex + 0];
                let g = tileImg.pixels[pixelIndex + 1];
                let b = tileImg.pixels[pixelIndex + 2];
                sumR += r;
                sumG += g;
                sumB += b;
            }

            sumR /= this.options.length;
            sumG /= this.options.length;
            sumB /= this.options.length;

            fill(sumR, sumG, sumB);
            noStroke();
            square(this.x, this.y, this.w);

            // Information of number of options in each cell
            // fill(0)
            // noStroke();
            // textSize(this.w/2);
            // textAlign(CENTER, CENTER);
            // text(this.options.length, this.x + this.w / 2, this.y + this.w / 2)
        } 
    }
}