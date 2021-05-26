import $ from 'jquery';

const focusNode = (node, options, canvas) => {
  if (!node) {
    return;
  }

  const client = $(canvas.root);
  const size = [client.height(), client.width()];
  const offset = client.offset();

  let center = [
    (offset.left + size[1] / 2),
    (offset.top + size[0] / 2)
  ];

  center = canvas.terminal2canvas(center);

  const moffset = [
    node.left - center[0],
    node.top - center[1]
  ];

  canvas.nodes.forEach(node => {
    node.moveTo(
      node.left - moffset[0],
      node.top - moffset[1]
    );
  });

  canvas.recalc();
};

export default focusNode;
