// MediaPipe 21 hand landmarks reference:
// 0:wrist 1:thumbCMC 2:thumbMCP 3:thumbIP 4:thumbTip
// 5:indexMCP 6:indexPIP 7:indexDIP 8:indexTip
// 9:middleMCP 10:middlePIP 11:middleDIP 12:middleTip
// 13:ringMCP 14:ringPIP 15:ringDIP 16:ringTip
// 17:pinkyMCP 18:pinkyPIP 19:pinkyDIP 20:pinkyTip

const L = 0,
  TIP = 1,
  PIP = 2,
  MCP = 3,
  CMC = 4;

function dot3(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function sub3(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function norm3(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function dist3(a, b) {
  const dx = a.x - b.x,
    dy = a.y - b.y,
    dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function angleBetween(a, b, c) {
  const ba = sub3(a, b);
  const bc = sub3(c, b);
  const d = dot3(ba, bc);
  const n = norm3(ba) * norm3(bc);
  return n < 1e-8 ? 0 : Math.acos(Math.max(-1, Math.min(1, d / n)));
}

function fingerTip(lm, ti) {
  return lm[ti];
}

function fingerPip(lm, ti) {
  if (ti === 4) return lm[3];
  if (ti === 8) return lm[6];
  if (ti === 12) return lm[10];
  if (ti === 16) return lm[14];
  if (ti === 20) return lm[18];
  return null;
}

function fingerMcp(lm, ti) {
  if (ti === 4) return lm[2];
  if (ti === 8) return lm[5];
  if (ti === 12) return lm[9];
  if (ti === 16) return lm[13];
  if (ti === 20) return lm[17];
  return null;
}

export function detectFingers(lm) {
  const tipIndices = [4, 8, 12, 16, 20];
  const pipIndices = [3, 6, 10, 14, 18];
  const mcpIndices = [2, 5, 9, 13, 17];
  const names = ["thumb", "index", "middle", "ring", "pinky"];

  const wrist = lm[0];
  const palmCenter = {
    x: (lm[0].x + lm[5].x + lm[17].x) / 3,
    y: (lm[0].y + lm[5].y + lm[17].y) / 3,
    z: (lm[0].z + lm[5].z + lm[17].z) / 3,
  };

  const fingers = [];
  for (let i = 0; i < 5; i++) {
    const tip = lm[tipIndices[i]];
    const pip = lm[pipIndices[i]];
    const mcp = lm[mcpIndices[i]];
    const tipDist = dist3(tip, wrist);
    const pipDist = dist3(pip, wrist);
    const mcpDist = dist3(mcp, wrist);

    if (i === 0) {
      const ip = lm[3];
      const mcp2 = lm[2];
      const idxMcp = lm[5];
      const tipToIdxMcp = dist3(tip, idxMcp);
      const ipToIdxMcp = dist3(ip, idxMcp);
      fingers.push(tipToIdxMcp > ipToIdxMcp * 1.15);
    } else {
      fingers.push(tipDist > pipDist * 1.1);
    }
  }
  return fingers;
}

export function classifyLetter(fingers, lm) {
  const [thumb, index, middle, ring, pinky] = fingers;
  const count = fingers.filter(Boolean).length;
  const tipDists = {
    ti: dist3(lm[4], lm[8]),
    tm: dist3(lm[4], lm[12]),
    tr: dist3(lm[4], lm[16]),
    tp: dist3(lm[4], lm[20]),
    im: dist3(lm[8], lm[12]),
    mr: dist3(lm[12], lm[16]),
    rp: dist3(lm[16], lm[20]),
  };

  if (count >= 4) {
    if (thumb && index && middle && ring && pinky) {
      if (tipDists.ti < 0.06 && tipDists.tm < 0.06)
        return {
          label: "O",
          confidence: 0.85,
          top3: [
            ["O", 0.85],
            ["C", 0.1],
            ["B", 0.05],
          ],
        };
      return {
        label: "B",
        confidence: 0.8,
        top3: [
          ["B", 0.8],
          ["O", 0.15],
          ["C", 0.05],
        ],
      };
    }
    if (!thumb && index && middle && ring && pinky)
      return {
        label: "B",
        confidence: 0.85,
        top3: [
          ["B", 0.85],
          ["4", 0.1],
          ["C", 0.05],
        ],
      };
    if (thumb && index && middle && ring && !pinky) {
      if (tipDists.ti < 0.08)
        return {
          label: "O",
          confidence: 0.6,
          top3: [
            ["O", 0.6],
            ["W", 0.3],
            ["C", 0.1],
          ],
        };
      return {
        label: "W",
        confidence: 0.7,
        top3: [
          ["W", 0.7],
          ["K", 0.15],
          ["?4", 0.15],
        ],
      };
    }
    return {
      label: "?",
      confidence: 0.3,
      top3: [
        ["?", 0.3],
        ["B", 0.2],
        ["W", 0.2],
      ],
    };
  }

  if (count === 3) {
    if (index && middle && ring && !thumb && !pinky)
      return {
        label: "W",
        confidence: 0.75,
        top3: [
          ["W", 0.75],
          ["K", 0.15],
          ["?3", 0.1],
        ],
      };
    if (thumb && index && middle && !ring && !pinky)
      return {
        label: "K",
        confidence: 0.7,
        top3: [
          ["K", 0.7],
          ["W", 0.15],
          ["L", 0.15],
        ],
      };
    if (thumb && index && pinky && !middle && !ring)
      return {
        label: "I",
        confidence: 0.5,
        top3: [
          ["I", 0.5],
          ["Y", 0.3],
          ["L", 0.2],
        ],
      };
    return {
      label: "?",
      confidence: 0.3,
      top3: [
        ["?", 0.3],
        ["K", 0.2],
        ["W", 0.2],
      ],
    };
  }

  if (count === 2) {
    if (thumb && pinky && !index && !middle && !ring)
      return {
        label: "Y",
        confidence: 0.9,
        top3: [
          ["Y", 0.9],
          ["L", 0.05],
          ["I", 0.05],
        ],
      };
    if (thumb && index && !middle && !ring && !pinky)
      return {
        label: "L",
        confidence: 0.85,
        top3: [
          ["L", 0.85],
          ["Y", 0.1],
          ["?2", 0.05],
        ],
      };
    if (index && middle && !thumb && !ring && !pinky) {
      if (tipDists.im > 0.08)
        return {
          label: "V",
          confidence: 0.8,
          top3: [
            ["V", 0.8],
            ["U", 0.15],
            ["?2", 0.05],
          ],
        };
      return {
        label: "U",
        confidence: 0.7,
        top3: [
          ["U", 0.7],
          ["V", 0.2],
          ["H", 0.1],
        ],
      };
    }
    if (index && ring && !thumb && !middle && !pinky)
      return {
        label: "H",
        confidence: 0.4,
        top3: [
          ["H", 0.4],
          ["U", 0.3],
          ["V", 0.3],
        ],
      };
    if (thumb && middle && !index && !ring && !pinky)
      return {
        label: "T",
        confidence: 0.4,
        top3: [
          ["T", 0.4],
          ["K", 0.3],
          ["?2", 0.3],
        ],
      };
    return {
      label: "?",
      confidence: 0.3,
      top3: [
        ["?", 0.3],
        ["Y", 0.2],
        ["L", 0.2],
      ],
    };
  }

  if (count === 1) {
    if (index)
      return {
        label: "D",
        confidence: 0.85,
        top3: [
          ["D", 0.85],
          ["L", 0.05],
          ["X", 0.05],
        ],
      };
    if (pinky)
      return {
        label: "I",
        confidence: 0.8,
        top3: [
          ["I", 0.8],
          ["Y", 0.1],
          ["L", 0.05],
        ],
      };
    if (middle)
      return {
        label: "?1M",
        confidence: 0.3,
        top3: [
          ["?1M", 0.3],
          ["U", 0.25],
          ["V", 0.25],
        ],
      };
    if (ring)
      return {
        label: "?1R",
        confidence: 0.2,
        top3: [
          ["?1R", 0.2],
          ["W", 0.2],
          ["?1", 0.2],
        ],
      };
    if (thumb) {
      const tipY = lm[4].y;
      const ipY = lm[3].y;
      const mcpY = lm[1].y;
      if (tipY < ipY && tipY < mcpY)
        return {
          label: "L",
          confidence: 0.5,
          top3: [
            ["L", 0.5],
            ["Y", 0.3],
            ["D", 0.2],
          ],
        };
      return {
        label: "?",
        confidence: 0.3,
        top3: [
          ["?", 0.3],
          ["A", 0.2],
          ["T", 0.2],
        ],
      };
    }
  }

  const idxTip = lm[8];
  const midTip = lm[12];
  const ringTip = lm[16];
  const pinTip = lm[20];
  const idxMcp = lm[5];
  const wrist = lm[0];

  const thumbCmc = lm[1];
  const thumbMcp = lm[2];
  const thumbIp = lm[3];
  const thumbTip2 = lm[4];

  const thumbAcross = dist3(thumbTip2, pinTip) < dist3(thumbTip2, idxMcp) * 0.8;
  const thumbOver = thumbTip2.y > idxMcp.y && thumbTip2.y > midTip.y;
  const thumbVisible = dist3(thumbTip2, wrist) > dist3(thumbIp, wrist);

  if (thumbOver) {
    const toPinkyDist = dist3(thumbTip2, pinTip);
    const toRingDist = dist3(thumbTip2, ringTip);
    const toMidDist = dist3(thumbTip2, midTip);
    if (toPinkyDist < toRingDist && toPinkyDist < 0.06)
      return {
        label: "M",
        confidence: 0.5,
        top3: [
          ["M", 0.5],
          ["N", 0.3],
          ["A", 0.2],
        ],
      };
    if (toRingDist < toMidDist && toRingDist < 0.06)
      return {
        label: "N",
        confidence: 0.5,
        top3: [
          ["N", 0.5],
          ["M", 0.3],
          ["A", 0.2],
        ],
      };
    return {
      label: "S",
      confidence: 0.5,
      top3: [
        ["S", 0.5],
        ["A", 0.3],
        ["T", 0.2],
      ],
    };
  }

  if (thumbAcross)
    return {
      label: "A",
      confidence: 0.6,
      top3: [
        ["A", 0.6],
        ["S", 0.2],
        ["T", 0.2],
      ],
    };
  if (thumbVisible)
    return {
      label: "E",
      confidence: 0.5,
      top3: [
        ["E", 0.5],
        ["A", 0.3],
        ["S", 0.2],
      ],
    };
  return {
    label: "A",
    confidence: 0.4,
    top3: [
      ["A", 0.4],
      ["S", 0.3],
      ["E", 0.3],
    ],
  };
}

export function classifyNumber(fingers, lm) {
  const [thumb, index, middle, ring, pinky] = fingers;
  const count = fingers.filter(Boolean).length;

  if (count === 0) {
    const thumbTip = lm[4];
    const thumbIp = lm[3];
    const thumbOver = thumbTip.y > lm[5].y && thumbTip.y > lm[9].y;
    if (thumbOver)
      return {
        label: "0",
        confidence: 0.5,
        top3: [
          ["0", 0.5],
          ["A", 0.3],
          ["S", 0.2],
        ],
      };
    return {
      label: "0",
      confidence: 0.4,
      top3: [
        ["0", 0.4],
        ["A", 0.3],
        ["S", 0.3],
      ],
    };
  }

  if (count === 1) {
    if (index)
      return {
        label: "1",
        confidence: 0.85,
        top3: [
          ["1", 0.85],
          ["D", 0.1],
          ["?", 0.05],
        ],
      };
    if (pinky)
      return {
        label: "1",
        confidence: 0.4,
        top3: [
          ["1", 0.4],
          ["I", 0.3],
          ["?", 0.3],
        ],
      };
    if (thumb) {
      const tipY = lm[4].y;
      const ipY = lm[3].y;
      if (tipY < ipY)
        return {
          label: "6",
          confidence: 0.5,
          top3: [
            ["6", 0.5],
            ["?", 0.3],
            ["L", 0.2],
          ],
        };
      return {
        label: "6",
        confidence: 0.4,
        top3: [
          ["6", 0.4],
          ["?", 0.3],
          ["T", 0.3],
        ],
      };
    }
  }

  if (count === 2) {
    if (index && middle && !thumb && !ring && !pinky)
      return {
        label: "2",
        confidence: 0.85,
        top3: [
          ["2", 0.85],
          ["V", 0.1],
          ["U", 0.05],
        ],
      };
    if (thumb && pinky && !index && !middle && !ring)
      return {
        label: "6",
        confidence: 0.85,
        top3: [
          ["6", 0.85],
          ["Y", 0.1],
          ["?", 0.05],
        ],
      };
    if (thumb && index && !middle && !ring && !pinky) {
      const d = dist3(lm[4], lm[8]);
      if (d > 0.06)
        return {
          label: "8",
          confidence: 0.6,
          top3: [
            ["8", 0.6],
            ["L", 0.25],
            ["?", 0.15],
          ],
        };
      return {
        label: "8",
        confidence: 0.4,
        top3: [
          ["8", 0.4],
          ["?", 0.3],
          ["L", 0.3],
        ],
      };
    }
  }

  if (count === 3) {
    if (thumb && index && middle && !ring && !pinky)
      return {
        label: "3",
        confidence: 0.7,
        top3: [
          ["3", 0.7],
          ["K", 0.2],
          ["?", 0.1],
        ],
      };
    if (index && middle && ring && !thumb && !pinky)
      return {
        label: "3",
        confidence: 0.55,
        top3: [
          ["3", 0.55],
          ["W", 0.25],
          ["?", 0.2],
        ],
      };
  }

  if (count === 4) {
    if (!thumb && index && middle && ring && pinky)
      return {
        label: "4",
        confidence: 0.85,
        top3: [
          ["4", 0.85],
          ["B", 0.1],
          ["?", 0.05],
        ],
      };
    if (thumb && index && middle && ring && !pinky) {
      const d = dist3(lm[4], lm[16]);
      if (d < 0.06)
        return {
          label: "7",
          confidence: 0.45,
          top3: [
            ["7", 0.45],
            ["?", 0.3],
            ["W", 0.25],
          ],
        };
    }
  }

  if (count === 5) {
    if (thumb && index && middle && ring && pinky) {
      const ti = dist3(lm[4], lm[8]);
      if (ti < 0.06)
        return {
          label: "10",
          confidence: 0.4,
          top3: [
            ["10", 0.4],
            ["O", 0.3],
            ["C", 0.3],
          ],
        };
      return {
        label: "5",
        confidence: 0.85,
        top3: [
          ["5", 0.85],
          ["B", 0.1],
          ["O", 0.05],
        ],
      };
    }
  }

  return {
    label: "?",
    confidence: 0.3,
    top3: [
      ["?", 0.3],
      ["1", 0.15],
      ["2", 0.15],
    ],
  };
}
