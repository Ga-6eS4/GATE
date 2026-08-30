// ==========================================================================
// ASL Alphabet Dataset Definitions & Helper Functions (29 Classes)
// ==========================================================================

export const ASL_CLASSES = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 
  'U', 'V', 'W', 'X', 'Y', 'Z', 'del', 'nothing', 'space'
];

export const ASL_DICTIONARY = [
  {
    symbol: 'A',
    name: 'Letter A',
    category: 'Alphabet',
    difficulty: 'Easy',
    tips: 'Fist with thumb resting against the side of the index finger pointing upright.',
    description: 'Make a fist with your dominant hand. Extend your thumb out to the side resting against your index finger.',
    handShape: 'Closed fist, side thumb'
  },
  {
    symbol: 'B',
    name: 'Letter B',
    category: 'Alphabet',
    difficulty: 'Easy',
    tips: 'Flat hand held upright, thumb tucked across the palm.',
    description: 'Hold four fingers straight up together, press your thumb flat across your palm.',
    handShape: 'Open palm, thumb across'
  },
  {
    symbol: 'C',
    name: 'Letter C',
    category: 'Alphabet',
    difficulty: 'Easy',
    tips: 'Curved hand facing sideways forming a C shape with fingers and thumb.',
    description: 'Curve your fingers and thumb to mimic the shape of the letter C.',
    handShape: 'C-curve shape'
  },
  {
    symbol: 'D',
    name: 'Letter D',
    category: 'Alphabet',
    difficulty: 'Medium',
    tips: 'Index finger points straight up, middle/ring/pinky touch thumb forming an O.',
    description: 'Extend index finger straight up. Touch thumb tip to tips of middle, ring, and pinky fingers.',
    handShape: 'Pointing index, ringed fingers'
  },
  {
    symbol: 'E',
    name: 'Letter E',
    category: 'Alphabet',
    difficulty: 'Easy',
    tips: 'Curl all 4 fingers down to touch the top of your tucked thumb.',
    description: 'Curl all fingers into palm and bend thumb underneath finger tips.',
    handShape: 'Clenched claw'
  },
  {
    symbol: 'F',
    name: 'Letter F',
    category: 'Alphabet',
    difficulty: 'Easy',
    tips: 'Touch index finger tip to thumb tip, extend remaining 3 fingers straight up (OK gesture).',
    description: 'Form a ring with index finger and thumb, spread middle, ring, and pinky upright.',
    handShape: 'OK ring gesture'
  },
  {
    symbol: 'G',
    name: 'Letter G',
    category: 'Alphabet',
    difficulty: 'Medium',
    tips: 'Index finger and thumb pointing horizontally parallel like a pinch.',
    description: 'Extend index finger and thumb parallel, pointing sideways across body.',
    handShape: 'Horizontal pinch'
  },
  {
    symbol: 'H',
    name: 'Letter H',
    category: 'Alphabet',
    difficulty: 'Medium',
    tips: 'Index and middle fingers extended parallel horizontally, thumb tucked.',
    description: 'Extend index and middle finger together pointing horizontally to the left or right.',
    handShape: 'Two-finger horizontal bar'
  },
  {
    symbol: 'I',
    name: 'Letter I',
    category: 'Alphabet',
    difficulty: 'Easy',
    tips: 'Make a fist with pinky finger pointing straight up.',
    description: 'Close fist completely except extend pinky finger upright.',
    handShape: 'Pinky finger up'
  },
  {
    symbol: 'J',
    name: 'Letter J',
    category: 'Alphabet',
    difficulty: 'Hard',
    tips: 'Extend pinky (like I) and trace a dynamic curved J motion in the air.',
    description: 'Form the I handshape and scoop your pinky in a curve motion tracing a J in mid-air.',
    handShape: 'Dynamic pinky hook'
  },
  {
    symbol: 'K',
    name: 'Letter K',
    category: 'Alphabet',
    difficulty: 'Medium',
    tips: 'V-sign with thumb tucked between index and middle finger.',
    description: 'Extend index finger up, middle finger angled forward, thumb placed at joint between them.',
    handShape: 'V-sign thumb wedge'
  },
  {
    symbol: 'L',
    name: 'Letter L',
    category: 'Alphabet',
    difficulty: 'Easy',
    tips: 'Index finger up, thumb out at 90 degree angle forming an L.',
    description: 'Extend index finger up and thumb straight out to form an L shape.',
    handShape: 'L-shape frame'
  },
  {
    symbol: 'M',
    name: 'Letter M',
    category: 'Alphabet',
    difficulty: 'Medium',
    tips: 'Tuck thumb under first three fingers (index, middle, ring).',
    description: 'Make a fist with thumb poking through under index, middle, and ring fingers.',
    handShape: 'Three-finger overhang'
  },
  {
    symbol: 'N',
    name: 'Letter N',
    category: 'Alphabet',
    difficulty: 'Medium',
    tips: 'Tuck thumb under first two fingers (index and middle).',
    description: 'Make a fist with thumb poking out under index and middle fingers.',
    handShape: 'Two-finger overhang'
  },
  {
    symbol: 'O',
    name: 'Letter O',
    category: 'Alphabet',
    difficulty: 'Easy',
    tips: 'Touch tips of all fingers to thumb forming a clean O circle.',
    description: 'Curve all fingers and thumb together to make a full circle shape.',
    handShape: 'O-ring shape'
  },
  {
    symbol: 'P',
    name: 'Letter P',
    category: 'Alphabet',
    difficulty: 'Hard',
    tips: 'Inverted K shape pointing downwards towards the ground.',
    description: 'Make the K handshape and rotate wrist downward so index points down.',
    handShape: 'Inverted K hand'
  },
  {
    symbol: 'Q',
    name: 'Letter Q',
    category: 'Alphabet',
    difficulty: 'Hard',
    tips: 'Inverted G shape pointing downwards towards the ground.',
    description: 'Make the G handshape and tilt your wrist so index and thumb point downward.',
    handShape: 'Inverted G pinch'
  },
  {
    symbol: 'R',
    name: 'Letter R',
    category: 'Alphabet',
    difficulty: 'Easy',
    tips: 'Cross index and middle finger (fingers crossed gesture).',
    description: 'Extend index and middle finger, crossing middle over index finger.',
    handShape: 'Crossed fingers'
  },
  {
    symbol: 'S',
    name: 'Letter S',
    category: 'Alphabet',
    difficulty: 'Easy',
    tips: 'Tight fist with thumb wrapped across front of fingers.',
    description: 'Make a tight fist and fold thumb across the front of index and middle fingers.',
    handShape: 'Fist thumb across front'
  },
  {
    symbol: 'T',
    name: 'Letter T',
    category: 'Alphabet',
    difficulty: 'Easy',
    tips: 'Tuck thumb under index finger only.',
    description: 'Make a fist with thumb popping up between index and middle fingers.',
    handShape: 'Thumb under index'
  },
  {
    symbol: 'U',
    name: 'Letter U',
    category: 'Alphabet',
    difficulty: 'Easy',
    tips: 'Index and middle fingers extended straight up together.',
    description: 'Hold index and middle finger together upright, other fingers folded.',
    handShape: 'Two fingers up together'
  },
  {
    symbol: 'V',
    name: 'Letter V',
    category: 'Alphabet',
    difficulty: 'Easy',
    tips: 'Peace sign - index and middle fingers extended apart in a V.',
    description: 'Extend index and middle fingers spread apart into a V shape.',
    handShape: 'Peace sign V'
  },
  {
    symbol: 'W',
    name: 'Letter W',
    category: 'Alphabet',
    difficulty: 'Easy',
    tips: 'Three fingers (index, middle, ring) extended apart.',
    description: 'Extend index, middle, and ring fingers upright and separated.',
    handShape: 'Three fingers up W'
  },
  {
    symbol: 'X',
    name: 'Letter X',
    category: 'Alphabet',
    difficulty: 'Medium',
    tips: 'Hook index finger like a pirate hook, rest of fist closed.',
    description: 'Make a fist and bend your index finger into a hook shape.',
    handShape: 'Index hook'
  },
  {
    symbol: 'Y',
    name: 'Letter Y',
    category: 'Alphabet',
    difficulty: 'Easy',
    tips: 'Hang loose sign - thumb and pinky extended, middle 3 fingers folded.',
    description: 'Extend thumb and pinky out while holding middle three fingers down.',
    handShape: 'Hang loose / phone gesture'
  },
  {
    symbol: 'Z',
    name: 'Letter Z',
    category: 'Alphabet',
    difficulty: 'Hard',
    tips: 'Extend index finger and draw a dynamic Z shape in the air.',
    description: 'Point index finger and trace out a Z pattern in mid-air.',
    handShape: 'Dynamic Z pointer'
  },
  {
    symbol: 'del',
    name: 'Backspace / Delete',
    category: 'Action',
    difficulty: 'Medium',
    tips: 'Swipe hand to the left across view to delete last character.',
    description: 'Open hand sweeping leftwards command signal for removing character.',
    handShape: 'Leftward sweep'
  },
  {
    symbol: 'space',
    name: 'Space Bar',
    category: 'Action',
    difficulty: 'Medium',
    tips: 'Flat hand pushed downward horizontally to add a space.',
    description: 'Palm flat pushed downward horizontally to separate words.',
    handShape: 'Flat palm push'
  },
  {
    symbol: 'nothing',
    name: 'Neutral / No Hand',
    category: 'Action',
    difficulty: 'Easy',
    tips: 'No active hand gesture detected in ROI camera area.',
    description: 'Background state with no sign gesture present.',
    handShape: 'Rest position'
  }
];

// Helper to lookup sign detail by symbol
export function getSignInfo(symbol) {
  const match = ASL_DICTIONARY.find(item => item.symbol.toLowerCase() === symbol.toLowerCase());
  if (match) return match;
  return {
    symbol: symbol.toUpperCase(),
    name: `Sign ${symbol.toUpperCase()}`,
    category: 'Alphabet',
    difficulty: 'Medium',
    tips: `ASL Gesture representation for ${symbol.toUpperCase()}`,
    description: `Fingerspelling gesture for ${symbol.toUpperCase()}`,
    handShape: 'Standard hand posture'
  };
}

// Generate realistic simulated prediction probabilities for camera demo
export function generateSimulatedPrediction(detectedChar = null) {
  const target = detectedChar || ASL_CLASSES[Math.floor(Math.random() * 26)];
  const confidence = (88 + Math.random() * 11.5).toFixed(1); // 88.0% - 99.5%
  
  // Pick top 2 alternate predictions with smaller probabilities
  const alternates = ASL_CLASSES
    .filter(c => c !== target && c !== 'nothing')
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
    
  const rem = (100 - parseFloat(confidence));
  const alt1 = (rem * 0.65).toFixed(1);
  const alt2 = (rem * 0.35).toFixed(1);

  return {
    topClass: target,
    confidence: parseFloat(confidence),
    predictions: [
      { class: target, probability: parseFloat(confidence) },
      { class: alternates[0], probability: parseFloat(alt1) },
      { class: alternates[1], probability: parseFloat(alt2) }
    ]
  };
}
