// 기본설정
const canvasContainer = document.querySelector('.canvas-container');

// const INITIAL_W = 400;
// const INITIAL_H = 400;
// const INITIAL_RATIO = INITIAL_W / INITIAL_H;

const {
  Engine,
  Runner,
  Composites,
  MouseConstraint,
  Mouse,
  Composite,
  Bodies,
} = Matter;

let stack;
let walls;
let engine;
let world;
let secondBalls = [];
let secondR = 8;
let minuteBalls = [];
let minuteR = 18;
let hourBalls = [];
let hourR = 38;

function setup() {
  const { width: containerWidth, height: containerHeight } =
    canvasContainer.getBoundingClientRect();

  const renderer = createCanvas(containerWidth - 500, containerHeight);
  renderer.parent(canvasContainer);

  engine = Engine.create();
  world = engine.world;

  walls = [
    // 밑 벽
    Bodies.rectangle(0.5 * width, height, width, 50, { isStatic: true }),
    // 왼 벽
    Bodies.rectangle(0, 0.5 * height, 50, height, { isStatic: true }),
    // 오른 벽
    Bodies.rectangle(width, 0.5 * height, 50, height, { isStatic: true }),
  ];

  // 생성된 벽들 추가
  Composite.add(world, walls);

  const mouse = Mouse.create(renderer.elt);
  mouse.pixelRatio = pixelDensity();

  // 마우스로 드래그
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.2,
    },
  });

  // 마우스 추가
  Composite.add(world, mouseConstraint);

  // 엔진 실행
  const runner = Runner.create();
  Runner.run(runner, engine);

  // help..
  // 현재 시각에 맞춰 초기 공 생성
  const currentSecond = second();
  const currentMinute = minute();
  const currentHour = hour() % 12 === 0 ? 12 : hour() % 12;
  ////////////////////////// ↑           ↑      ↑
  ////////////////////   만약 0이면?   12로   아니면 그대로

  // 초 공 생성
  for (let i = 0; i < currentSecond; i++) {
    dropSBall();
  }
  // 분 공 생성
  for (let i = 0; i < currentMinute; i++) {
    dropMBall();
  }
  // 시 공 생성
  for (let i = 0; i < currentHour; i++) {
    dropHBall();
  }
}

// 초 공을 떨어뜨리는 함수
function dropSBall() {
  const sBall = Bodies.circle(width * 0.5, 0, secondR);
  secondBalls.push(sBall);
  Composite.add(world, sBall);
}

// 분 공을 떨어뜨리는 함수
function dropMBall() {
  const mBall = Bodies.circle(width * 0.5, 0, minuteR);
  minuteBalls.push(mBall);
  Composite.add(world, mBall);
}

// 시 공을 떨어뜨리는 함수
function dropHBall() {
  const hBall = Bodies.circle(width * 0.5, 0, hourR);
  hourBalls.push(hBall);
  Composite.add(world, hBall);
}

// 시계 바늘을 그리는 함수
function drawTimeHand(angleDegrees, length, colour, weight) {
  push();
  translate(width * 0.5, height * 0.5);
  rotate(radians(angleDegrees));
  stroke(colour);
  strokeWeight(weight);
  line(0, 0, 0, -length);
  pop();
}

// 시간을 각도로 변환하는 함수
function timeToDegrees(time, range) {
  // 0~360도
  return map(time, 0, range, 0, 360);
}

function draw() {
  const sr = minute();
  let bgColor;
  let sColor;
  let mColor;
  let hColor;

  if (sr % 2 === 0) {
    bgColor = '#EDF7FA';
    sColor = '#5F6CAF';
    mColor = '#FFB677';
    hColor = '#FF8364';
  } else {
    bgColor = '#272829';
    sColor = '#F7E987';
    mColor = '#D8D9DA';
    hColor = '#61677A';
  }

  background(bgColor);

  // 현재 시각 가져오기
  const currentSecond = second();
  const currentMinute = minute();
  const currentHour = hour() % 12 === 0 ? 12 : hour() % 12;

  // 초 공
  if (secondBalls.length < currentSecond) {
    dropSBall();
  } else if (secondBalls.length > currentSecond) {
    // 0초로 넘어갈 때 모든 초 공 제거
    const ballToRemove = secondBalls.shift();
    Composite.remove(world, ballToRemove);
  }

  // 분 공
  if (minuteBalls.length < currentMinute) {
    dropMBall();
  } else if (minuteBalls.length > currentMinute) {
    //0분으로 넘어갈 때 모든 분 공 제거
    const ballToRemove = minuteBalls.shift();
    Composite.remove(world, ballToRemove);
  }

  // 시 공
  if (hourBalls.length < currentHour) {
    dropHBall();
  } else if (hourBalls.length > currentHour) {
    // 12시 -> 1시로 넘어갈 때 시 공 제거
    const ballToRemove = hourBalls.shift();
    Composite.remove(world, ballToRemove);
  }

  noStroke();
  noFill(); // 채우기 없음

  // 벽 렌더링
  walls.forEach((aBody) => {
    beginShape();
    aBody.vertices.forEach((aVertex) => {
      vertex(aVertex.x, aVertex.y);
    });
    endShape(CLOSE);
  });

  // 공 렌더링
  noFill();
  stroke(sColor);
  secondBalls.forEach((ball) => {
    circle(ball.position.x, ball.position.y, secondR * 2);
  });
  stroke(mColor);
  minuteBalls.forEach((ball) => {
    circle(ball.position.x, ball.position.y, minuteR * 2);
  });
  stroke(hColor);
  hourBalls.forEach((ball) => {
    circle(ball.position.x, ball.position.y, hourR * 2);
  });
  // hour() % 12은 24시간을 12시간으로 변환
  let hAngleDeg = timeToDegrees(hour() % 12, 12);
  let mAngleDeg = timeToDegrees(minute(), 60);
  let sAngleDeg = timeToDegrees(second(), 60);

  drawTimeHand(hAngleDeg, width * 0.3, hColor, 10);
  drawTimeHand(mAngleDeg, width * 0.4, mColor, 10);
  drawTimeHand(sAngleDeg, width * 0.48, sColor, 5);
}
