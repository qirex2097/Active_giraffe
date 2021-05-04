'use strict';

const SIZE = 40;
const YOKO = 9;
const TATE = 9;

class SQBoard {
    constructor(yoko, tate, size) {
        this.yoko = yoko + 2;
        this.tate = tate + 2;
        this.size = size;
        this.prev = NaN;
        this.current = NaN;
        this.x = NaN;
        this.y = NaN;
    }
    refresh(x, y) {
        this.prev = this.current;
        this.x = Math.max(Math.min(Math.floor(x / this.size) + 1, this.yoko - 1), 0);
        this.y = Math.max(Math.min(Math.floor(y / this.size) + 1, this.tate - 1), 0);
        this.current = this.getNum(this.x, this.y);
        return this.current;
    }
    isValidPos() {
        return this.isValidNum(this.current);
    }
    draw(callback) {
        for (let y = 1; y < this.tate - 1; y++) {
            for (let x = 1; x < this.yoko - 1; x++) {
                callback((x - 1) * this.size, (y - 1) * this.size, this.size, this.getNum(x, y));
            }
        }
    }
    getNum = (x, y) => { return y * this.yoko + x }
    getXY = (num) => { return [num % this.yoko, Math.floor(num / this.yoko)] }
    getRightEdge = () => { return (this.yoko - 2) * this.size; }

    isValidNum = (num) => { 
        return !(num <= this.yoko - 1 || num % this.yoko === 0 || num % this.yoko === 10 || num >= this.yoko * (this.tate - 1)); 
    }
}

class Block extends Array {
    constructor (...items) {
        super(...items);
        this.value = NaN;
    }
}

let xyn = new SQBoard(YOKO, TATE, SIZE);
let current_block = [];
let block_list = [];
let button;

//----------------------------------------

function setup() {
    createCanvas(640, 360);
    button = createButton('click me');
    button.position(xyn.getRightEdge(), 0);
}

function draw() {
    //const color_list = ['red', 'green', 'blue', 'yellow', 'purple', 'cyan', 'deeppink', 'lawngreen', 'deepskyblue']; 
    const color_list = ['black'];

    background(60);

    xyn.draw(function(canvas_x, canvas_y, size, num) {
        let block_list_no = NaN;
        if (current_block.includes(num)) {
            stroke(1);
            fill(255);
        } else {
            stroke(1);
            noFill();
            for (let i = 0; i < block_list.length; i++) {
                const block = block_list[i];
                if (block.includes(num)) {
                    block_list_no = i;
                    noStroke();
                    fill(color_list[i % color_list.length]);
                    break;
                }
            }
        }
        rect(canvas_x, canvas_y, size);

        if (Number.isNaN(block_list_no)) {
            stroke(1);
            fill(200);
            textAlign(CENTER, CENTER);
            text(num, canvas_x + size / 2, canvas_y + size / 2);
        } else {
            const block = block_list[block_list_no];
            push();
            stroke(200);
            strokeWeight(1);
            if (!block.includes(num - xyn.yoko)) {
                line(canvas_x, canvas_y, canvas_x + size, canvas_y);
            }
            if (!block.includes(num + 1)) {
                line(canvas_x + size, canvas_y, canvas_x + size, canvas_y + size);
            }
            if (!block.includes(num + xyn.yoko)) {
                line(canvas_x + size, canvas_y + size, canvas_x, canvas_y + size);
            }
            if (!block.includes(num - 1)) {
                line(canvas_x, canvas_y + size, canvas_x, canvas_y);
            }
            if (num === Math.min.apply(null, block)) {
                fill(255);
                textAlign(LEFT, TOP);
                text(block.value, canvas_x, canvas_y);
            }
            pop();
        }
    });

    if (current_block.length > 0) {
        fill(255);
        textAlign(LEFT, TOP);
        text(xyn.x + ',' + xyn.y, SIZE * YOKO, 0);
        text(current_block, SIZE * YOKO, 10);
    }
    for (let i = 0; i < block_list.length; i++) {
        fill(255);
        textAlign(LEFT, TOP);
        text(`${i}(${block_list[i].value})${block_list[i]}`, SIZE * YOKO, 30 + i * 10);
    }
}

function touchMoved(event) {
    const current_num = xyn.refresh(mouseX, mouseY);
    const prev_num = xyn.prev;
    if (xyn.isValidPos() && prev_num != current_num) {
        if (current_block.indexOf(current_num) === -1) {
            current_block.push(current_num);
        } else if (current_block[current_block.length - 1] === prev_num && current_block[current_block.length - 2] === current_num) {
            current_block.pop();
        }
    }
}

function touchStarted(event) {
    const touched_num = xyn.refresh(mouseX, mouseY);
    if (!xyn.isValidNum(touched_num)) {
        return;
    }
    current_block = new Block();
    current_block.push(touched_num);
    for (let i = 0; i < block_list.length; i++) {
        const block = block_list[i];
        const idx = block.indexOf(touched_num);
        if (idx != -1) {
            block_list[i].splice(idx, 1);
            block_list[i].push(touched_num);
            current_block = block_list[i];
            block_list.splice(i, 1);
            break;
        }
    }
}

function touchEnded(event) {
    xyn.refresh(mouseX, mouseY);
    
    if (current_block.length > 0) {
        const value = current_block.value || 0;
        let result = prompt('入力値は？', value);
        current_block.value = result;
    }

    for (let i = 0; i < block_list.length; i++) {
        if (current_block.filter(e => block_list[i].includes(e)).length > 0) {
            block_list[i] = [];
        }
    }
    block_list.push(current_block);
    current_block = [];
    block_list = block_list.filter(e => e.length > 0);
}

//----------------------------------------
