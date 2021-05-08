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
        this.yoko = NaN;
        this.tate = NaN;
    }

    static get [Symbol.species]() {
        return Array;
    }
}

let xyn = new SQBoard(YOKO, TATE, SIZE);
let current_block = [];
let block_list = [];
let button;
let draw_func = null;
let clicked_func = null;
let touch_started = null;
let touch_moved = null;
let touch_ended = null;
let button_func = null;

//----------------------------------------

function setup() {
    createCanvas(640, 360);
    [draw_func, clicked_func, touch_started, touch_moved, touch_ended, button_func] = initialize_stage00();
    button = createButton('click me');
    button.position(xyn.getRightEdge(), 0);
    button.mousePressed(buttonMousePressed);
}

function draw() {
    if (draw_func) {
        draw_func();
    }
}

function touchStarted(event) {
    if (touch_started) {
        touch_started(event);
    }
}

function touchMoved(event) {
    if (touch_moved) {
        touch_moved(event);
    }
}

function touchEnded(event) {
    if (touch_ended) {
        touch_ended(event);
    }
}

function mouseClicked() {
    if (clicked_func) {
        clicked_func();
    }
}

function buttonMousePressed() {
    if (button_func) {
        button_func();
    }
}
//----------------------------------------

function initialize_stage00() {
    return [draw_stage00, null, ts_stage00, tm_stage00, te_stage00, button_stage00];
}

function draw_stage00() {
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
                let value = block.value || 0;
                fill(255);
                textAlign(LEFT, TOP);
                text(value, canvas_x, canvas_y);
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


function tm_stage00(event) {
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

function ts_stage00(event) {
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

function te_stage00(event) {
    xyn.refresh(mouseX, mouseY);
    
    if (current_block.length > 0) {
        const value = current_block.value || 0;
        let result = prompt('入力値は？', value);
        current_block.value = Number(result) || value;
        let x0, y0, x1, y1;
        [x0, y0] = xyn.getXY(current_block[0]);
        [x1, y1] = [x0, y0];
        for (const num of current_block) {
            let pos = xyn.getXY(num);
            x0 = min(pos[0], x0);
            y0 = min(pos[1], y0);
            x1 = max(pos[0], x1);
            y1 = max(pos[1], y1);
        }
        current_block.origin = xyn.getNum(x0, y0);
        current_block.yoko = x1 - x0 + 1;
        current_block.tate = y1 - y0 + 1;
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

function button_stage00() {
    [draw_func, clicked_func, touch_started, touch_moved, touch_ended, button_func] = initialize_stage01();
}

//----------------------------------------
class Numbers extends Array {
    constructor (...items) {
        super(...items);
        this.valid = true;
        this.block = null;
    }

    static get [Symbol.species]() {
        return Array;
    }

}

let num_pattern = [];
let sel_button = null;
let sel_button2 = null;

function initialize_stage01() {
    return [draw_stage01, clicked_stage01, null, null, null, button_stage01];
}

function draw_stage01() {
    background(200);

    xyn.draw(function(canvas_x, canvas_y, size, num) {
        let block_list_no = NaN;

        stroke(1);
        noFill();
        for (let i = 0; i < block_list.length; i++) {
            const block = block_list[i];
            if (block.includes(num)) {
                block_list_no = i;
                noStroke();
                if (current_block.includes(num)) {
                    fill('red');
                } else {
                    fill('black');
                }
                break;
            }
        }
        rect(canvas_x, canvas_y, size);

        if (!Number.isNaN(block_list_no)) {
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

    if (current_block) {
        //
    }

    {
        const origin_x = 360 + 5;
        const origin_y = 360 - 270 - 5;
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                const num = xyn.getNum(x + 1, y + 1);
                noFill();
                stroke(255);
                if (current_block && current_block.includes(num)) {
                    fill('red');
                }
                rect(origin_x + x * 30, origin_y + y * 30, 30);
            }
        }
    }

}

function clicked_stage01() {
    const touched_num = xyn.refresh(mouseX, mouseY);
    if (!xyn.isValidNum(touched_num)) {
        return;
    }
    if (sel_button2) {
        sel_button2.remove();
        sel_button2 = null;
    }
    for (let i = 0; i < block_list.length; i++) {
        const block = block_list[i];
        const idx = block.indexOf(touched_num);

        if (idx === -1) {
            continue;
        }

        if (block === current_block) {
            current_block = [];
            num_pattern = [];
            sel_button.remove();
            sel_button = null;
        } else {
            current_block = block;

            num_pattern = [];
            let pf = prime_factorization(block.value);
            for (const nums of expressed_by_multiplication(pf, block.length)) {
                let count = {};
                let numbers = new Numbers();
                for (const e of nums) {
                    count[e] = (count[e] || 0) + 1;
                    numbers.push(e);
                    numbers.block = current_block;
                }
                if (max(...Object.keys(count)) <= 9 &&
                    max(...Object.values(count)) <= min(current_block.yoko, current_block.tate)) {
                    numbers.valid = true;
                } else {
                    numbers.valid = false;
                }
                num_pattern.push(numbers);
            }

            if (sel_button) {
                sel_button.remove();
                sel_button = null;
            }
            sel_button = createSelect();
            sel_button.changed(select_changed);
            sel_button.position(SIZE * YOKO, 24);
            sel_button.option('-', -1);
            num_pattern.forEach((numbers, index) => {
                if (numbers.valid) {
                    sel_button.option(numbers.slice().toString(), index);
                }
            });
        }
        return;
    }
    return;
}

/*
 * [], nums = 6 * 3 * 3, blocks = [19,20,30]
 */
function rec01(field, nums, blocks) {
    let tmp_field = field.slice();
    const pos_n = xyn.getXY(blocks[tmp_field.length - 1]);
    const n = tmp_field.pop();
    for (let i = 0; i < tmp_field.length; i++) {
        if (tmp_field[i] === n) {
            const pos_e = xyn.getXY(blocks[i]);
            if (pos_n[0] === pos_e[0] || pos_n[1] === pos_e[1]) {
                return [];
            }
        }
    }

    if (nums.length === 0) {
        return [field.slice()];
    }

    let result = [];
    append_field : for (const n of new Set(nums)) {
        field.push(n);
        nums.splice(nums.indexOf(n), 1);
        result = [...result, ...rec01(field, nums, blocks)];
        nums.push(field.pop());

    }

    return result;
}

function select_changed() {
    if (sel_button2) {
        sel_button2.remove;
        sel_button2 = null;
    }
    const idx = sel_button.value();
    if (idx >= 0) {
        const result = rec01([], num_pattern[idx].filter(e => e > 0), current_block.slice());
        if (result.length > 0) {
            sel_button2 = createSelect();
            sel_button2.changed(select_changed_2);
            sel_button2.position(SIZE * YOKO, 48);
            sel_button2.option('-', -1);
            result.forEach((numbers, index) => {
                sel_button2.option(numbers.toString(), index);
            });
        }
    }
}

function select_changed_2() {
    const idx = sel_button2.value();
    if (idx >= 0) {
        const num = num_pattern[idx];
        console.log(num);
    }
    return;
}

function button_stage01() {
    current_block = [];
    num_pattern = [];
    if (sel_button) {
        sel_button.remove();
        sel_button = null;
    }
    if (sel_button2) {
        sel_button2.remove();
        sel_button = null;
    }
    [draw_func, clicked_func, touch_started, touch_moved, touch_ended, button_func] = initialize_stage00();
}
//----------------------------------------

function prime_factorization(value) {
    if (value === 0) {
        return [];
    }
    if (value === 1) {
        return [1];
    }

    let result = [];
    for (const a of [7, 5, 3, 2]) {
        while (value % a === 0) {
            value /= a;
            result.push(a);
        }
    }
    if (value != 1) {
        result.push(value);
    }
    return result;
}


/*
  9 = 3 * 3
  8 = 2 * 2 * 2
  8 = 4 * 2
  6 = 3 * 2
  4 = 2 * 2
*/

function expressed_by_multiplication(factor, num) {
    let result = [];
    factor.sort((a, b) => b - a);
    if (factor.length <= num) {
        let tmp_factor = factor.slice();
        while (tmp_factor.length < num) {
            tmp_factor.push(1);
        }
        result.push(tmp_factor);
    }
    if (factor.filter(e => e === 3).length >= 2) {
        let tmp_factor = factor.slice();
        tmp_factor.splice(tmp_factor.indexOf(3),1);
        tmp_factor.splice(tmp_factor.indexOf(3),1);
        tmp_factor.unshift(9);
        result = result.concat(expressed_by_multiplication(tmp_factor, num));
    }
    if (factor.filter(e => e === 2).length >= 3) {
        let tmp_factor = factor.slice();
        tmp_factor.splice(tmp_factor.indexOf(2),1);
        tmp_factor.splice(tmp_factor.indexOf(2),1);
        tmp_factor.splice(tmp_factor.indexOf(2),1);
        tmp_factor.unshift(8);
        result = result.concat(expressed_by_multiplication(tmp_factor, num));
    }
    if (factor.indexOf(4) != -1 && factor.indexOf(2) != -1) {
        let tmp_factor = factor.slice();
        tmp_factor.splice(tmp_factor.indexOf(4),1);
        tmp_factor.splice(tmp_factor.indexOf(2),1);
        tmp_factor.unshift(8);
        result = result.concat(expressed_by_multiplication(tmp_factor, num));
    }
    if (factor.indexOf(3) != -1 && factor.indexOf(2) != -1) {
        let tmp_factor = factor.slice();
        tmp_factor.splice(tmp_factor.indexOf(3),1);
        tmp_factor.splice(tmp_factor.indexOf(2),1);
        tmp_factor.unshift(6);
        result = result.concat(expressed_by_multiplication(tmp_factor, num));
    }
    if (factor.filter(e => e === 2).length >= 2) {
        let tmp_factor = factor.slice();
        tmp_factor.splice(tmp_factor.indexOf(2),1);
        tmp_factor.splice(tmp_factor.indexOf(2),1);
        tmp_factor.unshift(4);
        result = result.concat(expressed_by_multiplication(tmp_factor, num));
    }
    return uniq_array(result);
}

function uniq_array(array) {
    return array.filter((spin, index, array) => (
        index === array.findIndex((another) => (
            spin.toString() === another.toString()
        ))
    ))
}

/*

　┌┐　13122
　││
┌┘└┐
│┌┐│
└┘└┘

13122 = 9 * 9 * 9 * 9 * 2;

9 * 9 * 9 * 9 * 2 * 1 * 1; <-- x
9 * 9 * 9 * 3 * 3 * 2 * 1;
9 * 9 * 3 * 3 * 3 * 3 * 2; <-- x


　　┌┐405 (47,56,57,58,67)
┌─┘│
│┌─┘
└┘

405 = 9 * 9 * 5

9 * 9 * 5 * 1 * 1
9 * 5 * 3 * 3 * 1
5 * 3 * 3 * 3 * 3 <-- x


　　┌┐16464 (50,59,60,61,71)
┌─┘│
└┐┌┘
　└┘
16464 = 8 * 7 * 7 * 7 * 6

8 * 7 * 7 * 7 * 6


┌┐　162 (70,81,92,93)
││
││
│└┐
└─┘

162 = 9 * 9 * 2;

9 * 9 * 2 * 1
9 * 3 * 3 * 2

9 * 6 * 3 * 1;


9 = 3 * 3
8 = 2 * 2 * 2
6 = 3 * 2
4 = 2 * 2

162 = 3 * 3 * 3 * 3 * 2 (4)

3 * 3 * 3 * 3 * 2 <--- x
9 * 3 * 3 * 2
9 * 9 * 2 * 1
9 * 6 * 3 * 1


405 = 9 * 9 * 5 (5)
9 * 9 (4)
9 * 9 * 1 * 1
9 * 3 * 3 * 1
3 * 3 * 3 * 3


 */
