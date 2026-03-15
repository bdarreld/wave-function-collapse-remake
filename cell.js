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
    }

    show(){
        if(this.collapsed){
            let tileIndex = this.options[0];
            let img = tiles[tileIndex].img; // tiles is a global variable
            // renderImage(img, this.x, this.y, this.w / 3); // if the cell is this.w width long, the pixels must be w / 3 (3 per cell)
            renderCell(img, this.x, this.y, this.w);
        } else{
            stroke(255);
            noFill();
            square(this.x, this.y, this.w);
        }
    }
}