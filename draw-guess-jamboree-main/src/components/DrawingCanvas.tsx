import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, RotateCcw, Brush } from 'lucide-react';

interface DrawingCanvasProps {
  isDrawing: boolean;
  onClearCanvas: () => void;
  onDrawingData?: (data: any) => void;
  drawingData?: Array<{
    type: 'stroke' | 'clear';
    data: any;
    timestamp: number;
  }>;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ isDrawing, onClearCanvas, onDrawingData, drawingData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [brushSize, setBrushSize] = useState(4);
  const [brushColor, setBrushColor] = useState('#000000');
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsMouseDown(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  }, [isDrawing]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMouseDown || !isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = brushColor;
      }
      
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    
    // Send drawing data for real-time sync
    if (onDrawingData) {
      onDrawingData({
        x: x,
        y: y,
        brushSize,
        brushColor,
        tool,
        action: 'draw'
      });
    }
  }, [isMouseDown, isDrawing, brushSize, brushColor, tool, onDrawingData]);

  const stopDrawing = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onClearCanvas();
  }, [onClearCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500'];

  return (
    <div className="flex flex-col space-y-4">
      {/* Drawing Tools */}
      {isDrawing && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border">
          <div className="flex items-center space-x-2">
            <Button
              variant={tool === 'brush' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('brush')}
            >
              <Brush className="w-4 h-4 mr-1" />
              Brush
            </Button>
            <Button
              variant={tool === 'eraser' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('eraser')}
            >
              <Eraser className="w-4 h-4 mr-1" />
              Eraser
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm">Size:</span>
            <input
              type="range"
              min="2"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm w-6">{brushSize}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm">Color:</span>
            <div className="flex space-x-1">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded border-2 ${
                    brushColor === color ? 'border-primary' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setBrushColor(color)}
                />
              ))}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      )}
      
      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className={`border-2 rounded-lg bg-game-canvas ${
            isDrawing 
              ? 'border-game-primary cursor-crosshair' 
              : 'border-game-canvas-border cursor-not-allowed opacity-50'
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        {!isDrawing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
            <p className="text-white text-xl font-semibold">Waiting for your turn...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawingCanvas;