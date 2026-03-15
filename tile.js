// constants for RIGHT, LEFT, UP, DOWN
const R = 0;
const L = 1;
const U = 2;
const D = 3;

class Tile{
    constructor(img, i){
        // each tile will store its own image as well as a list of its adjacency rules (R, L, U, D)
        // each adjacent tile will be stored as a tile INDEX and not the image itself
        this.img = img;
        this.index = i;
        this.adjacencies = [];
        this.adjacencies[R] = [];
        this.adjacencies[L] = [];
        this.adjacencies[U] = [];
        this.adjacencies[D] = [];
    }

    calculateAdjacencies(tiles){
        for(let i = 0; i < tiles.length; i++){
            if(this.overlapping(tiles[i], R)){
                this.adjacencies[R].push(i);
            }

            if(this.overlapping(tiles[i], L)){
                this.adjacencies[L].push(i);
            }

            if(this.overlapping(tiles[i], U)){
                this.adjacencies[U].push(i);
            }
            
            if(this.overlapping(tiles[i], D)){
                this.adjacencies[D].push(i);
            }
        }
    }

    overlapping(other, direction){
        if(direction == R){
            for(let col = 1; col < 3; col++){ // check columns 1 and 2 for THIS image
                for(let row = 0; row < 3; row++){
                    let thisIndex = (col + row * 3) * 4;
                    let otherIndex = (col - 1 + row * 3) * 4; // col - 1 since we want to check columns 0 and 1 for OTHER image
                    
                    if(differentColor(this.img, thisIndex, other.img, otherIndex)){ // != just checks for equality in value. !== checks for equality in value and type
                        return false;
                    }
                }
            }
            return true
        }else if(direction == L){
            for(let col = 0; col < 2; col++){ // check columns 0 and 1 for THIS image
            for(let row = 0; row < 3; row++){
                    let thisIndex = (col + row * 3) * 4;
                    let otherIndex = (col + 1 + row * 3) * 4; // col + 1 since we want to check columns 1 and 2 for OTHER image

                    if(differentColor(this.img, thisIndex, other.img, otherIndex)){ // != just checks for equality in value. !== checks for equality in value and type
                        return false;
                    }
                }
            }
            return true;
        }else if(direction == U){
            let same = true;
            for(let row = 0; row < 2; row++){   // check rows 0 and 1 for THIS image
            for(let col = 0; col < 3; col++){
                    let thisIndex = (col + row * 3) * 4;
                    let otherIndex = (col + (row + 1) * 3) * 4; // row + 1 since we want to check rows 1 and 2 for OTHER image

                    if(differentColor(this.img, thisIndex, other.img, otherIndex)){
                        return false;
                    }
                }
            }
            return true;
        }else if(direction == D){
            let same = true;
            for(let row = 1; row < 3; row++){   // check rows 0 and 1 for THIS image
            for(let col = 0; col < 3; col++){
                    let thisIndex = (col + row * 3) * 4;
                    let otherIndex = (col + (row - 1) * 3) * 4; // row - 1 since we want to check rows 0 and 1 for OTHER image

                    if(differentColor(this.img, thisIndex, other.img, otherIndex)){
                        return false;
                    }
                }
            }
            return true;
        }
    }
}


function differentColor(thisImg, thisIndex, otherImg, otherIndex){
    let thisR = thisImg.pixels[thisIndex + 0];
    let thisG = thisImg.pixels[thisIndex + 1];
    let thisB = thisImg.pixels[thisIndex + 2];

    let otherR = otherImg.pixels[otherIndex + 0];
    let otherG = otherImg.pixels[otherIndex + 1];
    let otherB = otherImg.pixels[otherIndex + 2];

    return thisR !== otherR || thisG !== otherG || thisB !== otherB;
}