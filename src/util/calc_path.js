import _ from 'lodash';

const LEFT = 'Left';
const RIGHT = 'Right';
const TOP = 'Top';
const BOTTOM = 'Bottom';
const MINDIST = 20;
const TOL = 0.1;
const TOLxTOL = 0.01;
const DEFAULT_RADIUS = 15;

const Point = function (x, y) {
  this.x = x;
  this.y = y;
};

// 曼哈顿折线路由算法
function _route(conn, fromPt, fromDir, toPt, toDir) {
  // 防止图上节点隐藏NaN的死循环问题
  fromPt.x = fromPt.x || 0;
  fromPt.y = fromPt.y || 0;
  toPt.x = toPt.x || 0;
  toPt.y = toPt.y || 0;

  const xDiff = fromPt.x - toPt.x;
  const yDiff = fromPt.y - toPt.y;
  let point;
  let dir;
  let pos;

  conn.push(new Point(fromPt.x, fromPt.y));

  if (((xDiff * xDiff) < (TOLxTOL)) && ((yDiff * yDiff) < (TOLxTOL))) {
    conn.push(new Point(toPt.x, toPt.y));
    return;
  }

  if (fromDir === LEFT) {
    if ((xDiff > 0) && ((yDiff * yDiff) < TOL) && (toDir === RIGHT)) {
      point = toPt;
      dir = toDir;
    } else {
      if (xDiff < 0) {
        point = new Point(fromPt.x - MINDIST, fromPt.y);
      } else if (((yDiff > 0) && (toDir === BOTTOM)) || ((yDiff < 0) && (toDir === TOP))) {
        point = new Point(toPt.x, fromPt.y);
      } else if (fromDir === toDir) {
        pos = Math.min(fromPt.x, toPt.x) - MINDIST;
        point = new Point(pos, fromPt.y);
      } else {
        point = new Point(fromPt.x - (xDiff / 2), fromPt.y);
      }

      if (yDiff > 0) {
        dir = TOP;
      } else {
        dir = BOTTOM;
      }
    }
  } else if (fromDir === RIGHT) {
    if ((xDiff < 0) && ((yDiff * yDiff) < TOL) && (toDir === LEFT)) {
      point = toPt;
      dir = toDir;
    } else {
      if (xDiff > 0) {
        point = new Point(fromPt.x + MINDIST, fromPt.y);
      } else if (((yDiff > 0) && (toDir === BOTTOM)) || ((yDiff < 0) && (toDir === TOP))) {
        point = new Point(toPt.x, fromPt.y);
      } else if (fromDir === toDir) {
        pos = Math.max(fromPt.x, toPt.x) + MINDIST;
        point = new Point(pos, fromPt.y);
      } else {
        point = new Point(fromPt.x - (xDiff / 2), fromPt.y);
      }

      if (yDiff > 0) {
        dir = TOP;
      } else {
        dir = BOTTOM;
      }
    }
  } else if (fromDir === BOTTOM) {
    if (((xDiff * xDiff) < TOL) && (yDiff < 0) && (toDir === TOP)) {
      point = toPt;
      dir = toDir;
    } else {
      if (yDiff > 0) {
        point = new Point(fromPt.x, fromPt.y + MINDIST);
      } else if (((xDiff > 0) && (toDir === RIGHT)) || ((xDiff < 0) && (toDir === LEFT))) {
        point = new Point(fromPt.x, toPt.y);
      } else if (fromDir === toDir) {
        pos = Math.max(fromPt.y, toPt.y) + MINDIST;
        point = new Point(fromPt.x, pos);
      } else {
        point = new Point(fromPt.x, fromPt.y - (yDiff / 2));
      }

      if (xDiff > 0) {
        dir = LEFT;
      } else {
        dir = RIGHT;
      }
    }
  } else if (fromDir === TOP) {
    if (((xDiff * xDiff) < TOL) && (yDiff > 0) && (toDir === BOTTOM)) {
      point = toPt;
      dir = toDir;
    } else {
      if (yDiff < 0) {
        point = new Point(fromPt.x, fromPt.y - MINDIST);
      } else if (((xDiff > 0) && (toDir === RIGHT)) || ((xDiff < 0) && (toDir === LEFT))) {
        point = new Point(fromPt.x, toPt.y);
      } else if (fromDir === toDir) {
        pos = Math.min(fromPt.y, toPt.y) - MINDIST;
        point = new Point(fromPt.x, pos);
      } else {
        point = new Point(fromPt.x, fromPt.y - (yDiff / 2));
      }

      if (xDiff > 0) {
        dir = LEFT;
      } else {
        dir = RIGHT;
      }
    }
  }

  _route(conn, point, dir, toPt, toDir);
}

const getDefaultPath = (pointArr) => {
  return pointArr.reduce((path, point) => {
    path.push([
      'L',
      point.x,
      point.y
    ].join(' '));
    return path;
  }, [[
    'M',
    pointArr[0].x,
    pointArr[0].y
  ].join(' ')]).join(' ');
};

function _calcOrientation(beginX, beginY, endX, endY, orientationLimit) {
  let _calcWithLimit = (rank) => {
    if (orientationLimit) {
      for (let i = 0; i < rank.length; i++) {
        let isInLimit = _.some(orientationLimit, (limit) => {
          return limit === rank[i];
        });
        if (isInLimit) {
          return rank[i];
        }
      }
      return rank[0];
    } else {
      return rank[0];
    }
  };
  // 计算orientation
  let posX = endX - beginX;
  let posY = endY - beginY;
  let orientation = null;

  // 斜率
  let k = Math.abs(posY / posX);

  if (posX === 0 || posY === 0) {
    if (posX === 0) {
      orientation = posY >= 0 ? _calcWithLimit(['Top', 'Left', 'Right', 'Bottom']) : orientation;
      orientation = posY < 0 ? _calcWithLimit(['Bottom', 'Left', 'Right', 'Top']) : orientation;
    }
    if (posY === 0) {
      orientation = posX >= 0 ? _calcWithLimit(['Right', 'Top', 'Bottom', 'Left']) : orientation;
      orientation = posX < 0 ? _calcWithLimit(['Left', 'Top', 'Bottom', 'Right']) : orientation;
    }
  } else if (posX > 0 && posY > 0) {
    if (k > 1) {
      orientation = _calcWithLimit(['Top', 'Left', 'Right', 'Bottom']);
      // orientation = [0, -1];
    } else {
      orientation = _calcWithLimit(['Left', 'Top', 'Bottom', 'Right']);
      // orientation = [-1, 0];
    }
  } else if (posX < 0 && posY > 0) {
    if (k > 1) {
      orientation = _calcWithLimit(['Top', 'Right', 'Left', 'Bottom']);
      // orientation = [0, -1];
    } else {
      orientation = _calcWithLimit(['Right', 'Top', 'Bottom', 'Left']);
      // orientation = [1, 0];
    }
  } else if (posX < 0 && posY < 0) {
    if (k > 1) {
      orientation = _calcWithLimit(['Bottom', 'Right', 'Left', 'Top']);
      // orientation = [0, 1];
    } else {
      orientation = _calcWithLimit(['Right', 'Bottom', 'Top', 'Left']);
      // orientation = [1, 0];
    }
  } else {
    if (k > 1) {
      orientation = _calcWithLimit(['Bottom', 'Left', 'Right', 'Top']);
      // orientation = [0, 1];
    } else {
      orientation = _calcWithLimit(['Left', 'Bottom', 'Top', 'Right']);
      // orientation = [-1, 0];
    }
  }

  switch (orientation) {
    case 'Left':
      return [-1, 0];
    case 'Right':
      return [1, 0];
    case 'Top':
      return [0, -1];
    case 'Bottom':
      return [0, 1];
  }
}

// 获得靠近end的点
const getThatPoint = (start, end, radius) => {
  let p = new Point();

  ['x', 'y'].forEach(key => {
    if (start[key] > end[key]) {
      p[key] = end[key] + radius;
    } else if (start[key] < end[key]) {
      p[key] = end[key] - radius;
    } else {
      p[key] = start[key];
    }
  });

  return p;
};

const getDrawPoint = (start, control, end, radius) => {
  let p1 = getThatPoint(start, control, radius);
  let p2 = getThatPoint(end, control, radius);
  let flag = 0;
  let center = new Point(
    (start.x + end.x) / 2,
    (start.y + end.y) / 2
  );

  // 逆时针
  if (control.y < center.y) {
    flag = 1;
  } else {
    flag = 0;
  }

  return [start, p1, p2, flag];
};

function drawManhattan(sourcePoint, targetPoint) {
  if (!sourcePoint.orientation) {
    sourcePoint.orientation = _calcOrientation(targetPoint.pos[0], targetPoint.pos[1], sourcePoint.pos[0], sourcePoint.pos[1]);
  }

  if (!targetPoint.orientation) {
    targetPoint.orientation = _calcOrientation(sourcePoint.pos[0], sourcePoint.pos[1], targetPoint.pos[0], targetPoint.pos[1]);
  }

  let pointArr = [];
  const fromPt = {
    x: sourcePoint.pos[0],
    y: sourcePoint.pos[1],
  };
  const toPt = {
    x: targetPoint.pos[0],
    y: targetPoint.pos[1],
  };
  const orientation = {
    '-10': LEFT,
    10: RIGHT,
    '0-1': TOP,
    '01': BOTTOM,
  };
  // link:connect 中 orientation = undefined
  _route(pointArr, fromPt, orientation[sourcePoint.orientation.join('')], toPt, orientation[targetPoint.orientation.join('')]);
  if (pointArr.length < 2) return '';

  if (pointArr.length === 2) {
    return `M ${pointArr[0].x} ${pointArr[0].y} L ${pointArr[1].x} ${pointArr[1].y}`;
  }

  let radius = DEFAULT_RADIUS;

  pointArr.pop();

  // 非圆角情况下直接返回
  if (pointArr.length !== 4) {
    return getDefaultPath(pointArr);
  }

  const [start, c1, c2, end] = pointArr;

  if (Math.abs(start.y - end.y) < 2 * DEFAULT_RADIUS) {
    radius = Math.abs(start.y - end.y) / 2;
  }

  if (
    _.first(pointArr).x === _.last(pointArr).x ||
    _.first(pointArr).y === _.last(pointArr).y
  ) {
    return [
      'M', _.first(pointArr).x, _.first(pointArr).y,
      'L', _.last(pointArr).x, _.last(pointArr).y
    ].join(' ');
  }

  if (_.first(pointArr).x > _.last(pointArr).x) {
    pointArr = pointArr.reverse();
  }

  const arc1 = getDrawPoint(start, c1, c2, radius);
  const arc2 = getDrawPoint(c1, c2, end, radius);

  return [
    'M', arc1[0].x, arc1[0].y,
    'L', arc1[1].x, arc1[1].y,
    'A', radius, radius, 90, 0, arc1[3], arc1[2].x, arc1[2].y,
    'L', arc2[1].x, arc2[1].y,
    'M', arc2[1].x, arc2[1].y,
    'A', radius, radius, 90, 0, arc2[3], arc2[2].x, arc2[2].y,
    'L', end.x, end.y,
  ].join(' ');
}

export default drawManhattan;
