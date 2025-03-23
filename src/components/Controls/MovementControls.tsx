import React, { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { moveRobot } from '../../services/api';

interface MovementControlsProps {
  disabled?: boolean;
}

type Direction = 'up' | 'down' | 'left' | 'right' | 'look-up' | 'look-down';

export const MovementControls: React.FC<MovementControlsProps> = ({ disabled = false }) => {
  const [activeButton, setActiveButton] = useState<Direction | null>(null);

  const handleMove = async (direction: Direction) => {
    if (disabled) return;
    try {
      setActiveButton(direction);
      await moveRobot(direction);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Movement error:', errorMessage);
    } finally {
      setActiveButton(null);
    }
  };

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let direction: Direction | null = null;

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          direction = 'up';
          break;
        case 's':
        case 'arrowdown':
          direction = 'down';
          break;
        case 'a':
        case 'arrowleft':
          direction = 'left';
          break;
        case 'd':
        case 'arrowright':
          direction = 'right';
          break;
        case 'z':
          direction = 'look-up';
          break;
        case 'x':
          direction = 'look-down';
          break;
        default:
          return;
      }

      e.preventDefault();
      handleMove(direction);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['w', 's', 'a', 'd', 'z', 'x', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
        setActiveButton(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [disabled]);

  const getButtonStyles = (direction: Direction) => {
    const baseStyles = "p-2 rounded-lg transition-all duration-150 transform";
    const activeStyles = activeButton === direction ? "scale-95 shadow-inner" : "";
    const colorStyles = disabled
      ? "bg-gray-100 cursor-not-allowed"
      : activeButton === direction
      ? "bg-blue-200"
      : "bg-blue-100 hover:bg-blue-200 cursor-pointer active:bg-blue-200 active:scale-95";

    return `${baseStyles} ${activeStyles} ${colorStyles}`;
  };

  const getIconStyles = (direction: Direction) => {
    return `h-6 w-6 ${disabled ? 'text-gray-400' : activeButton === direction ? 'text-blue-700' : 'text-blue-600'}`;
  };

  return (
    <div className="p-4">
      <div className="text-center mb-2">
        <h3 className="text-sm font-medium text-gray-900">Movement Controls</h3>
        <p className="text-xs text-gray-500 mt-1">Use WASD or arrow keys for movement</p>
        <p className="text-xs text-gray-500">Use Z/X for looking up/down</p>
      </div>
      
      <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
        <button
          onClick={() => handleMove('look-up')}
          className={getButtonStyles('look-up')}
          disabled={disabled}
          aria-label="Look Up"
        >
          <ArrowUp className={getIconStyles('look-up')} />
          <span className="text-[10px] text-gray-500 mt-0.5 block">Z</span>
        </button>
        <button
          onClick={() => handleMove('up')}
          className={getButtonStyles('up')}
          disabled={disabled}
          aria-label="Move Up"
        >
          <ChevronUp className={getIconStyles('up')} />
          <span className="text-[10px] text-gray-500 mt-0.5 block">W / ↑</span>
        </button>
        <button
          onClick={() => handleMove('look-down')}
          className={getButtonStyles('look-down')}
          disabled={disabled}
          aria-label="Look Down"
        >
          <ArrowDown className={getIconStyles('look-down')} />
          <span className="text-[10px] text-gray-500 mt-0.5 block">X</span>
        </button>

        <button
          onClick={() => handleMove('left')}
          className={getButtonStyles('left')}
          disabled={disabled}
          aria-label="Move Left"
        >
          <ChevronLeft className={getIconStyles('left')} />
          <span className="text-[10px] text-gray-500 mt-0.5 block">A / ←</span>
        </button>
        <button
          onClick={() => handleMove('down')}
          className={getButtonStyles('down')}
          disabled={disabled}
          aria-label="Move Down"
        >
          <ChevronDown className={getIconStyles('down')} />
          <span className="text-[10px] text-gray-500 mt-0.5 block">S / ↓</span>
        </button>
        <button
          onClick={() => handleMove('right')}
          className={getButtonStyles('right')}
          disabled={disabled}
          aria-label="Move Right"
        >
          <ChevronRight className={getIconStyles('right')} />
          <span className="text-[10px] text-gray-500 mt-0.5 block">D / →</span>
        </button>
      </div>

      {disabled && (
        <p className="text-xs text-gray-400 text-center mt-2">
          Controls disabled in review mode
        </p>
      )}
    </div>
  );
};