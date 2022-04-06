'use strict';

export const actions = [
  {
    key: 'zoom-in',
    icon: 'table-build-icon table-build-icon-zoom-in',
    title: '放大',
    onClick: (canvas) => {
      canvas.zoom(canvas._zoomData + 0.1);
    }
  },
  {
    key: 'zoom-out',
    icon: 'table-build-icon table-build-icon-zoom-out',
    title: '缩小',
    onClick: (canvas) => {
      canvas.zoom(canvas._zoomData - 0.1);
    }
  },
  {
    key: 'fit',
    icon: 'table-build-icon table-build-icon-quanping2',
    title: '居中',
    onClick: (canvas) => {
      canvas.focusCenterWithAnimate(undefined, () => {
        console.log('complete!!!')
      });
    }
  }
];
