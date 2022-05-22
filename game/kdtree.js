function median(container) {
    if (container.length <= 9) {
        const sorted = container.sort((a, b) => a - b);
        if (container.length % 2) {
            return sorted[floor(container.length / 2)];
        } else {
            return (sorted[container.length / 2] +
                    sorted[container.length / 2 - 1]) / 2;
        }
    } else {
        let subarray = [];
        for (let i = 0; i < 9; i++) {
            subarray.push(container[floor(random(container.length))]);
        }
        return median(subarray);
    }
}

function segments(objs, axis, flag) {
    if (objs.length == 1) return [];

    let pivot = median(objs.map(obj => obj.pos[axis]));
    let left = objs.filter(obj =>
        obj.pos[axis] - obj.radius <= pivot
    );
    let right = objs.filter(obj =>
        obj.pos[axis] + obj.radius >= pivot
    );
    let nextAxis = (axis == 'x') ? 'y' : 'x';

    if (objs.length == left.length || objs.length == right.length) {
        return flag ? [objs.map(obj => obj.id)] : segments(objs, nextAxis, true);
    } else {
        return Array.prototype.concat(
            segments(left, nextAxis, false),
            segments(right, nextAxis, false)
        );
    }
}

function broadPhase(objs) {
    let res = new Set();
    segments(objs, 'x').forEach(pp => {
        for (const i of pp) for (const j of pp) {
            if (i < j) res.add(String([i, j]));
        }
    });
    return [...res].map(s => s.split(','));
}

export { broadPhase };