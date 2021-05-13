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
        this.values = Array(this.yoko * this.tate).fill(0);
    }
    refresh(x, y) {
        this.prev = this.current;
        this.x = Math.max(Math.min(Math.floor(x / this.size) + 1, this.yoko - 1), 0);
        this.y = Math.max(Math.min(Math.floor(y / this.size) + 1, this.tate - 1), 0);
        this.current = this.getNum(this.x, this.y);
        return this.current;
    }
    isValidPos(num = this.current) {
        return !(num <= this.yoko - 1 || num % this.yoko === 0 || num % this.yoko === 10 || num >= this.yoko * (this.tate - 1)); 
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

    setValue(num, value) { this.values[num] = value; }
    getValue(num) { return this.values[num]; }

    setValues(nums) {
        for (const key in nums) {
            this.setValue(key, nums[key]);
        }
    }
    clearValues(nums) {
        for (const key in nums) {
            this.setValue(key, 0);
        }
    }

    getValuesX = (x) => { 
        return this.values.filter((e, i) => x === (i % this.yoko)
                                  && 1 <= Math.floor(i / this.yoko) 
                                  && Math.floor(i / this.yoko) <= this.tate - 2); }
    getValuesY = (y) => { 
        return this.values.filter((e, i) => y === Math.floor(i / this.yoko)
                                  && 1 <= Math.floor(i % this.yoko) 
                                  && Math.floor(i % this.yoko) <= this.yoko - 2); }

    isValidNum = (num) => {
        const value = this.getValue(num);
        const pos = this.getXY(num);
        const values_x = this.getValuesX(pos[0]);
        const values_y = this.getValuesY(pos[1]);
        if (1 <= value && value <= 9) {
            if (values_x.filter(e => e === value).length === 1 &&
                values_y.filter(e => e === value).length === 1) {
                return true;
            } else {
                return false;
            }
        }
    }
}

class Block extends Array {
    constructor (...items) {
        super(...items);
        this.value = NaN;
        this.yoko = NaN;
        this.tate = NaN;
        this.combination_list = [];
        this.combination_no = NaN;
    }
    setCombination(no) {
        if (0 <= no && no < this.combination_list.length) {
            this.combination_no = no;
            return this.combination_list[this.combination_no];
        } else {
            this.combination_no = NaN;
            return [];
        }
    }
    getCombination() {
        return this.combination_list[this.combination_no];
    }
    buildCombinationList() {
        if (this.combination_list.length > 0) {
            return;
        }
        build_nump_multiplication(this);
        build_nump_addition(this);
        build_nump_subtraction(this);
        build_nump_divition(this);
    }

    static get [Symbol.species]() {
        return Array;
    }
}

class Combination extends Array {
    constructor (...items) {
        super(...items);
        this.valid = true;
        this.permutation_list = [];
        this.permutation_no = NaN;
    }

    setPattern(no) {
        this.permutation_no = no;
        return this.getPattern();
    }
    getPattern() {
        if (this.permutation_no >= 0) {
            return this.permutation_list[this.permutation_no];
        } else {
            return this.getDummyPattern();
        }
    }
    getDummyPattern() {
        let dummy_pattern = {};
        if (this.permutation_list.length > 0) {
            for (const key of Object.keys(this.permutation_list[0])) {
                dummy_pattern[key] = 0;
            }
        }
        return dummy_pattern;
    }
    buildPermutationList(blocks) {
        if (this.permutation_list.length > 0) {
            return;
        }
        this.permutation_list = build_permutation_list([], this.slice(), blocks);
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
    if (!xyn.isValidPos(touched_num)) {
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
    //[draw_func, clicked_func, touch_started, touch_moved, touch_ended, button_func] = initialize_stage01();
    [draw_func, clicked_func, touch_started, touch_moved, touch_ended, button_func] = initialize_stage02();
}

//----------------------------------------


let selected_block = null;
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
                if (selected_block && selected_block.includes(num)) {
                    fill('red');
                } else {
                    fill('black');
                }
                break;
            }
        }
        rect(canvas_x, canvas_y, size);

        if (block_list_no >= 0) {
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
            if (block.combination_no >= 0) {
                const combi = block.getCombination();
                if (combi.permutation_no >= 0) {
                    fill(255);
                    textAlign(CENTER, CENTER);
                    text(combi.getPattern()[num], canvas_x + size / 2, canvas_y + size / 2);
                }
            }
            pop();
        }
    });

    {
        const origin_x = 360 + 5;
        const origin_y = 360 - 270 - 5;
        for (let y = 1; y <= 9; y++) {
            for (let x = 1; x <= 9; x++) {
                const num = xyn.getNum(x, y);
                noFill();
                stroke(255);
                if (selected_block && selected_block.includes(num)) {
                    fill('red');
                }
                rect(origin_x + (x - 1) * 30, origin_y + (y - 1) * 30, 30);

                const value = xyn.getValue(num);
                if (1 <= value && value <= 9) {
                    if (xyn.isValidNum(num)) {
                        fill(255);
                        stroke(255);
                    } else {
                        fill(128);
                        stroke(128);
                    }
                    textAlign(CENTER, CENTER);
                    text(value, origin_x + (x - 1) * 30 + 15, origin_y + (y - 1) * 30 + 15);
                }
            }
        }
    }

}

function clicked_stage01() {
    const touched_num = xyn.refresh(mouseX, mouseY);
    if (!xyn.isValidPos(touched_num)) {
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

        if (block === selected_block) {
            clear_stage01();
        } else {
            selected_block = block;

            if (selected_block.combination_list.length === 0) {
                selected_block.buildCombinationList();
            }

            if (sel_button) {
                sel_button.remove();
                sel_button = null;
            }
            sel_button = createSelect();
            sel_button.position(SIZE * YOKO, 24);
            sel_button.option('-', -1);
            selected_block.combination_list.forEach((combi, index) => {
                if (combi.valid) {
                    sel_button.option(combi.slice().toString(), index);
                }
            });
            if (selected_block.combination_no >= 0) {
                sel_button.selected(selected_block.combination_no);
                select_changed();
            }
            sel_button.changed(select_changed);
        }
        return;
    }
    return;
}


function clear_stage01() {
    if (selected_block) {
        selected_block = [];
    }
    if (sel_button2) {
        sel_button2.remove();
        sel_button2 = null;
    }
    if (sel_button) {
        sel_button.remove();
        sel_button = null;
    }
}


function select_changed() {
    if (sel_button2) {
        sel_button2.remove();
        sel_button2 = null;

        let combi = selected_block.getCombination();
        xyn.setValues(combi.getDummyPattern());
    }
    const idx = sel_button.value();
    let combi = selected_block.setCombination(idx);

    if (combi.length > 0) {
        combi.buildPermutationList(selected_block.slice());

        if (combi.permutation_list.length > 0) {
            sel_button2 = createSelect();
            sel_button2.position(SIZE * YOKO, 48);
            sel_button2.option('-', -1);
            combi.permutation_list.forEach((value, index) => {
                let values = '';
                for (const key of Object.keys(value)) {
                    values += value[key] + ',';
                }
                sel_button2.option(values, index);
            });
            if (combi.permutation_no >= 0) {
                sel_button2.selected(combi.permutation_no);
                select_changed_2();
            }
            sel_button2.changed(select_changed_2);
        }
    }
}

function select_changed_2() {
    const idx = sel_button2.value();
    let combi = selected_block.getCombination();

    xyn.setValues(combi.setPattern(idx));

    return;
}

function button_stage01() {
    clear_stage01();
    [draw_func, clicked_func, touch_started, touch_moved, touch_ended, button_func] = initialize_stage00();
}
//----------------------------------------
function build_nump_multiplication(block) {
    let pf = prime_factorization(block.value);
    build_nump(block, expressed_by_multiplication(pf, block.length));
}

function build_nump_addition(block) {
    build_nump(block, expressed_by_addition(block.value, block.length, []));
}

function build_nump_subtraction(block) {
    if (block.length != 2 || block.value >= 9) {
        return;
    }
    build_nump(block, expressed_by_subtraction(block.value));
}

function build_nump_divition(block) {
    if (block.length != 2 || block.value >= 10) {
        return;
    }
    build_nump(block, expressed_by_divition(block.value));
}

function build_nump(block, combination_of_numbers) {
    for (const nums of combination_of_numbers) {
        let count = {};
        let combi = new Combination();
        for (const e of nums) {
            count[e] = (count[e] || 0) + 1;
            combi.push(e);
        }
        if (max(...Object.keys(count)) <= 9 &&
            max(...Object.values(count)) <= min(block.yoko, block.tate)) {
            combi.valid = true;
        } else {
            combi.valid = false;
        }
        //
        if (combi.valid) {
            block.combination_list.push(combi);
        }
    }
}



function expressed_by_addition(value, num, field) {
    let result = [];
    if (num === 2) {
        for (let a = 1; a <= 9; a++) {
            const b = value - a;
            if (1 <= b && b <= 9) {
                result.push(field.slice().concat([a, b]));
            }
        }
    } else if (value >= num && value < 9 * num) {
        for (let n = 1; n <= 9 && value - n >= 2; n++) {
            result = result.concat(expressed_by_addition(value - n, num - 1, [...field, n]));
        }
    }

    return uniq_array(result);
}


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
    for (let e of array) {
        e.sort((a, b) => b - a);
    }
    return array.filter((spin, index, array) => (
        index === array.findIndex((another) => (
            spin.toString() === another.toString()
        ))
    ))
}

    
function expressed_by_subtraction(value) {
    let result = [];
    for (let a = 1; a <= 9; a++) {
        const b = value + a;
        if (1 <= b && b <= 9) {
            result.push([a, b]);
        }
    }
    return uniq_array(result);
}


function expressed_by_divition(value) {
    let result = [];
    for (let a = 1; a <= 9; a++) {
        const b = value * a;
        if (1 <= b && b <= 9) {
            result.push([a, b]);
        }
    }
    return uniq_array(result);
}

//----------------------------------------
/*
 * [], nums = 6 * 3 * 3, blocks = [19,20,30]
 */
function build_permutation_list(field, nums, blocks) {
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
        let ans = {};
        for (let i = 0; i < field.length; i++) {
            ans[blocks[i]] = field[i];
        }
        return [ans];
    }

    let result = [];
    for (const n of new Set(nums)) {
        field.push(n);
        nums.splice(nums.indexOf(n), 1);
        result = [...result, ...build_permutation_list(field, nums, blocks)];
        nums.push(field.pop());
    }

    return result;
}

//--------------------------------------------------
//--------------------------------------------------
let processing_block = null;
let processing_block_no = 0;

function initialize_stage02() {
    for (let y = 1; y <= 9; y++) {
        for (let x = 1; x <= 9; x++) {
            const num = xyn.getNum(x, y);
            xyn.setValue(num, 0);
        }
    }
    processing_block = null;
    return [draw_stage02, null, null, null, null, button_stage02];
}

function isValidPattern(pattern) {
    if (Object.keys(pattern).length === 0) {
        return false;
    }
    for (const key of Object.keys(pattern)) {
        if (!(xyn.isValidNum(key))) {
            return false;
        }
    }
    return true;
}

function prevBlock() {
    while (processing_block_no > 0) {
        xyn.clearValues(processing_block.getCombination().getPattern());

        processing_block_no--;
        processing_block = block_list[processing_block_no];
        processing_block.buildCombinationList();
        let combi = processing_block.getCombination();
        combi.buildPermutationList(processing_block.slice());
        if (combi.permutation_no + 1 < combi.permutation_list.length) {
            xyn.setValues(combi.setPattern(combi.permutation_no + 1));
            return;
        } else if (processing_block.combination_no + 1 < processing_block.combination_list.length) {
            combi = processing_block.setCombination(processing_block.combination_no + 1);
            combi.buildPermutationList(processing_block.slice());
            if (combi.permutation_list.length > 0) {
                xyn.setValues(combi.setPattern(0));
            }
            return;
        }
    }

    return;
}

function draw_stage02() {
    background(90);

    if (processing_block) {
        if (processing_block_no + 1 < block_list.length) {
            processing_block_no++;
            processing_block = block_list[processing_block_no];

            processing_block.buildCombinationList();
            processing_block.setCombination(0);

            let combi = processing_block.getCombination();
            combi.buildPermutationList(processing_block.slice());
            xyn.setValues(combi.setPattern(0));
            while (!isValidPattern(combi.getPattern())) {
                if (combi.permutation_no + 1 < combi.permutation_list.length) {
                    xyn.setValues(combi.setPattern(combi.permutation_no + 1));
                } else if (processing_block.combination_no + 1 < processing_block.combination_list.length) {
                    combi = processing_block.setCombination(processing_block.combination_no + 1);
                    combi.buildPermutationList(processing_block.slice());
                    if (combi.permutation_list.length > 0) {
                        xyn.setValues(combi.setPattern(0));
                    }
                } else {
                    prevBlock();
                    combi = processing_block.getCombination();
                }
            }
        }
    } else if (block_list.length > 0) {
        processing_block_no = 0;
        processing_block = block_list[processing_block_no];
        processing_block.buildCombinationList();

        let combi = processing_block.setCombination(0);
        combi.buildPermutationList(processing_block.slice());
        if (combi.permutation_list.length > 0) {
            xyn.setValues(combi.setPattern(0));
        }
    }

    xyn.draw((canvas_x, canvas_y, size, num) => {
        let block = null;
        for (const tmp_block of block_list) {
            if (tmp_block.includes(num)) {
                block = tmp_block;
                break;
            }
        }

        noStroke();
        noFill();
        if (processing_block === block) {
            fill('red');
        } else if (block) {
            fill('purple');
        }
        rect(canvas_x, canvas_y, size);

        push();
        if (block) {
            stroke('gray');
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
        }
        const moji = xyn.getValue(num);
        if (1 <= moji && moji <= 9) {
            fill(255);
            textAlign(CENTER, CENTER);
            text(moji, canvas_x + size / 2, canvas_y + size / 2);
        }
        pop();
    });
}

function button_stage02() {
    [draw_func, clicked_func, touch_started, touch_moved, touch_ended, button_func] = initialize_stage00();
}
