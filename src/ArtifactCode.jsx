import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const GlideSlopeCalculator = () => {
  const [mode, setMode] = useState('tch');
  const [glideSlopeAngle, setGlideSlopeAngle] = useState(3);
  const [groundSpeed, setGroundSpeed] = useState(55);
  const [verticalSpeed, setVerticalSpeed] = useState(0);
  const [tchHeight, setTchHeight] = useState(50);
  const [aimPoint, setAimPoint] = useState(1000);

  // View constants
  const RUNWAY_LENGTH = 2000;
  const RUNWAY_WIDTH = 40;
  const THRESHOLD_COUNT = 4;
  const THRESHOLD_WIDTH = RUNWAY_WIDTH / (2 * THRESHOLD_COUNT - 1);
  const VIEW_HEIGHT = 600;
  const VIEW_WIDTH = 600;
  const PIXELS_PER_FOOT_HORIZ = 0.3;
  const PIXELS_PER_FOOT_VERT = 1.5;
  
  // Calculate vertical speed
  useEffect(() => {
    const gs = groundSpeed * 101.269;
    const vs = Math.round(gs * Math.tan(glideSlopeAngle * Math.PI / 180));
    setVerticalSpeed(vs);
  }, [groundSpeed, glideSlopeAngle]);

  // Calculate derived values
  useEffect(() => {
    if (mode === 'tch') {
      const ap = tchHeight / Math.tan(glideSlopeAngle * Math.PI / 180);
      setAimPoint(Math.round(ap));
    } else {
      const tch = aimPoint * Math.tan(glideSlopeAngle * Math.PI / 180);
      setTchHeight(Math.round(tch));
    }
  }, [mode, glideSlopeAngle, tchHeight, aimPoint]);

  const RunwayMarkings = () => (
    <g>
      {/* Main runway surface */}
      <rect 
        x={0} 
        y={VIEW_HEIGHT - 100}
        width={RUNWAY_LENGTH * PIXELS_PER_FOOT_HORIZ} 
        height="40" 
        fill="#333333" 
      />
      
      {/* Threshold stripes */}
      {[...Array(THRESHOLD_COUNT)].map((_, i) => (
        <rect
          key={i}
          x={0}
          y={VIEW_HEIGHT - 100 + 2 * THRESHOLD_WIDTH * i}
          width="40"
          height={THRESHOLD_WIDTH}
          fill="white"
        />
      ))}
      
      {/* Centerline */}
      <line
        x1={300 * PIXELS_PER_FOOT_HORIZ}
        y1={VIEW_HEIGHT - 80}
        x2={RUNWAY_LENGTH * PIXELS_PER_FOOT_HORIZ}
        y2={VIEW_HEIGHT - 80}
        stroke="white"
        strokeWidth="2"
        strokeDasharray="36,24"
      />

      {/* Aim point marker top */}
      <rect
        x={1000 * PIXELS_PER_FOOT_HORIZ}
        y={VIEW_HEIGHT - 100}
        width={150 * PIXELS_PER_FOOT_HORIZ}
        height={15}
        fill="white"
      />

      {/* Aim point marker bottom */}
      <rect
        x={1000 * PIXELS_PER_FOOT_HORIZ}
        y={VIEW_HEIGHT - 75}
        width={150 * PIXELS_PER_FOOT_HORIZ}
        height={15}
        fill="white"
      />

      {/* Distance markers */}
      {[0, 250, 500, 750, 1000, 1250, 1500].map(dist => (
        <text
          key={dist}
          x={dist * PIXELS_PER_FOOT_HORIZ}
          y={VIEW_HEIGHT - 40}
          fill="black"
          fontSize="12"
          textAnchor="middle"
        >
          {dist}'
        </text>
      ))}
    </g>
  );

  const GlideSlopeLine = () => {
    const angle = glideSlopeAngle * Math.PI / 180;
    
    // Calculate TCH point (at threshold)
    const thresholdX = 0;
    const thresholdY = tchHeight;
    
    // Calculate aim point
    const aimPointX = aimPoint;
    const aimPointY = 0;
    
    // Calculate approach path start point (2000ft before threshold)
    const approachStartX = -500;
    const approachStartY = thresholdY + Math.abs(approachStartX) * Math.tan(angle);
    
    return (
      <>
        {/* Reference height lines */}
        {[0, 50, 100, 150, 200, 250, 300].map(height => (
          <g key={height}>
            <line
              x1={-500 * PIXELS_PER_FOOT_HORIZ}
              y1={VIEW_HEIGHT - 100 - (height * PIXELS_PER_FOOT_VERT)}
              x2={RUNWAY_LENGTH * PIXELS_PER_FOOT_HORIZ}
              y2={VIEW_HEIGHT - 100 - (height * PIXELS_PER_FOOT_VERT)}
              stroke="#eee"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
            <text
              x="-40"
              y={VIEW_HEIGHT - 100 - (height * PIXELS_PER_FOOT_VERT)}
              fill="black"
              fontSize="12"
              dominantBaseline="middle"
            >
              {height}'
            </text>
          </g>
        ))}

        {/* Approach path */}
        <path
          d={`M ${approachStartX * PIXELS_PER_FOOT_HORIZ} ${VIEW_HEIGHT - 100 - (approachStartY * PIXELS_PER_FOOT_VERT)}
              L ${thresholdX * PIXELS_PER_FOOT_HORIZ} ${VIEW_HEIGHT - 100 - (thresholdY * PIXELS_PER_FOOT_VERT)}
              L ${aimPointX * PIXELS_PER_FOOT_HORIZ} ${VIEW_HEIGHT - 100}`}
          stroke="red"
          strokeWidth="2"
          fill="none"
        />
        
        {/* TCH indicator */}
        <line
          x1={0}
          y1={VIEW_HEIGHT - 100 - (tchHeight * PIXELS_PER_FOOT_VERT)}
          x2={20}
          y2={VIEW_HEIGHT - 100 - (tchHeight * PIXELS_PER_FOOT_VERT)}
          stroke="blue"
          strokeWidth="2"
        />

        {/* Aim Point indicator */}
        <line
          x1={aimPointX * PIXELS_PER_FOOT_HORIZ}
          y1={VIEW_HEIGHT - 100}
          x2={aimPointX * PIXELS_PER_FOOT_HORIZ}
          y2={VIEW_HEIGHT - 60}
          stroke="blue"
          strokeWidth="2"
        />
      </>
    );
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Glide Slope Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Selection */}
        <div className="space-y-2">
          <Label>Mode</Label>
          <RadioGroup
            defaultValue={mode}
            onValueChange={setMode}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="tch" id="tch" />
              <Label htmlFor="tch">Fixed TCH</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="aimpoint" id="aimpoint" />
              <Label htmlFor="aimpoint">Fixed Aim Point</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Glide Slope Angle: {glideSlopeAngle}°</Label>
            <Slider
              value={[glideSlopeAngle]}
              onValueChange={([value]) => setGlideSlopeAngle(value)}
              min={2}
              max={7}
              step={0.1}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Ground Speed: {groundSpeed} kts</Label>
            <Slider
              value={[groundSpeed]}
              onValueChange={([value]) => setGroundSpeed(value)}
              min={40}
              max={70}
              step={1}
            />
          </div>

          {mode === 'tch' ? (
            <div className="space-y-2">
              <Label>TCH: {tchHeight} ft</Label>
              <Slider
                value={[tchHeight]}
                onValueChange={([value]) => setTchHeight(value)}
                min={20}
                max={100}
                step={1}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Aim Point: {aimPoint} ft</Label>
              <Slider
                value={[aimPoint]}
                onValueChange={([value]) => setAimPoint(value)}
                min={500}
                max={1500}
                step={100}
              />
            </div>
          )}
        </div>

        {/* Derived Values */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>
              {mode === 'tch' ? 
                `Calculated Aim Point: ${aimPoint} ft` :
                `Calculated TCH: ${tchHeight} ft`}
            </Label>
          </div>
          <div>
            <Label>Vertical Speed: {verticalSpeed} fpm</Label>
          </div>
        </div>

        {/* Visualization */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <svg
            width="100%"
            height={VIEW_HEIGHT}
            viewBox={`-100 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            preserveAspectRatio="xMidYMin meet"
            className="bg-white"
          >
            <RunwayMarkings />
            <GlideSlopeLine />
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlideSlopeCalculator;
