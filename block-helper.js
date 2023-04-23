const blockSize = 30;
const width = 15;
const height = 20;

const DEFAULT_ROW_COUNT = height / 5;

let counter = 0;
let rowCount = DEFAULT_ROW_COUNT;

const colors = ['red', 'blue', 'green'];

function initBlocks() {
    for (let i = height - 1; i >= height - DEFAULT_ROW_COUNT; i--) {
        for (let j = 0; j < width; j++) {
            const block = createBlock();
            block.css({
                top: i * blockSize,
                left: j * blockSize,
            });
            block.attr('data-x', j);
            block.attr('data-y', i);

            block.appendTo(game);
        }
    }
}

function createBlock() {
    let block = $('<div></div>');
    block.addClass('block');
    const color = getRandomColor();
    block.addClass(color);
    block.css({
        width: blockSize,
        height: blockSize,
    });
    return block
}

function addBlock() {
    const tallestBlock = $(`.block[data-y=${0}]`);
    if (tallestBlock.length) {
        gameOver();
        return;
    }

    if (counter < width) {
        const blockBar = $('#blockBar');
        const block = createBlock();
        block.css({
            left: counter * blockSize
        });
        blockBar.append(block);
        counter++;
    } else {
        game.children().each(function () {
            const block = $(this);
            const currentY = parseInt(block.attr('data-y'))
            block.css({
                top: '-=' + blockSize
            });
            block.attr('data-y', currentY - 1);
        });
        blockBar.children().each(function (index) {
            const block = $(this);
            const x = index;
            const y = height - 1;
            block.css({
                top: y * blockSize,
                left: x * blockSize
            });
            block.attr('data-x', x);
            block.attr('data-y', y);
            game.append(block);
        });
        increaseDifficulty();
        counter = 0;
        rowCount++;
    }
}

function removeAllByColor(selectedBlock) {
    const selectedColor = selectedBlock.attr('class').split(' ')[1];
    let removedBlocks = 0;
    game.children().each(function () {
        const block = $(this);
        const color = block.attr('class').split(' ')[1];

        if (selectedColor === color) {
            block.remove();
            removedBlocks++;
        }
    });
    return removedBlocks;
}

function removeBlocks(selectedBlock) {
    const color = selectedBlock.attr('class').split(' ')[1];
    const blocksToRemove = [];
    findBlocksToRemove(selectedBlock, color, blocksToRemove);
    if (blocksToRemove.length < 3) return;

    blocksToRemove.forEach(block => block.remove());
    return blocksToRemove.length;
}

function hasBlock(array, block) {
    return array.findIndex(element => {
        return block.css('top') === element.css('top') && block.css('left') === element.css('left');
    }) !== -1;
}

function findBlocksToRemove(block, color, blocksToRemove) {
    if (!block.hasClass(color) || hasBlock(blocksToRemove, block)) return;

    blocksToRemove.push(block);
    const neighbors = getNeighbors(block, color);
    neighbors.forEach(neighbor => findBlocksToRemove(neighbor, color, blocksToRemove));
}

function getNeighbors(block) {
    const neighbors = [];
    const x = parseInt(block.css('left')) / blockSize;
    const y = parseInt(block.css('top')) / blockSize;

    if (x > 0) {
        const leftNeighbor = $(`.block[data-x=${x-1}][data-y=${y}]`);
        if (leftNeighbor.length && !neighbors.includes(leftNeighbor)) {
            neighbors.push(leftNeighbor);
        }
    }

    if (y > 0) {
        const topNeighbor = $(`.block[data-x=${x}][data-y=${y - 1}]`);
        if (topNeighbor.length && !neighbors.includes(topNeighbor)) {
            neighbors.push(topNeighbor);
        }
    }
    const rightNeighbor = $(`.block[data-x=${x + 1}][data-y=${y}]`);
    if (rightNeighbor.length && !neighbors.includes(rightNeighbor)) {
        neighbors.push(rightNeighbor);
    }
    const bottomNeighbor = $(`.block[data-x=${x}][data-y=${y + 1}]`);
    if (bottomNeighbor.length && !neighbors.includes(bottomNeighbor)) {
        neighbors.push(bottomNeighbor);
    }
    return neighbors;
}

function alignBlocksVertically() {
    for (let x = 0; x < width; x++) {
        let emptyCount = 0;

        for (let y = height - 1; y >= 0; y--) {
            const block = $(`.block[data-x=${x}][data-y=${y}]`);

            if (!block.length) {
                emptyCount++;
            } else if (emptyCount > 0) {
                block.attr('data-y', y + emptyCount);
                block.animate({top: (y + emptyCount) * blockSize}, 100);
            }
        }
    }
}

function alignBlocksHorizontally() {
    for (i = 0; i < width; i++) {
        const bottomBlock = $(`.block[data-x=${i}][data-y=${height - 1}]`);

        if (!bottomBlock.length) {
            game.children().each(function () {
                    const block = $(this);
                    const currentX = parseInt(block.attr('data-x'));
                    if (i < width / 2 && currentX < i) {
                        block.animate({
                            left: '+=' + blockSize
                        }, 10);
                        const currentX = parseInt(block.attr('data-x'));
                        block.attr('data-x', currentX + 1);
                    } else if (i > width / 2 && currentX > i) {
                        block.animate({
                            left: '-=' + blockSize
                        }, 10);

                        block.attr('data-x', currentX -1);
                    }
                });
        }
    }
}

function getRandomColor() {
    const colorIndex = Math.floor(Math.random() * colors.length);
    return colors[colorIndex];
}
