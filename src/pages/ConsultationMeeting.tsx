import React, { useState, useRef } from 'react';
import { X, Minus, Maximize2, Square, Edit2 } from 'lucide-react';
import PrescriptionWriterForm from '@/components/forms/PrescriptionWriterForm';
import { cn } from '@/lib/utils';

// Example meeting link (replace with real link from API/props)
const MEETING_LINK = 'https://meet.jit.si/YourMeetingRoom';

const PANEL_MIN_WIDTH = 340;
const PANEL_MIN_HEIGHT = 220;
const PANEL_DEFAULT_WIDTH = 480;
const PANEL_DEFAULT_HEIGHT = 600;

// Add handle positions and cursor types for all edges and corners
const RESIZE_HANDLES = [
  { pos: 'top', style: { top: -6, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize' },
  { pos: 'bottom', style: { bottom: -6, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize' },
  { pos: 'left', style: { left: -6, top: '50%', transform: 'translateY(-50%)' }, cursor: 'ew-resize' },
  { pos: 'right', style: { right: -6, top: '50%', transform: 'translateY(-50%)' }, cursor: 'ew-resize' },
  { pos: 'top-left', style: { top: -6, left: -6 }, cursor: 'nwse-resize' },
  { pos: 'top-right', style: { top: -6, right: -6 }, cursor: 'nesw-resize' },
  { pos: 'bottom-left', style: { bottom: -6, left: -6 }, cursor: 'nesw-resize' },
  { pos: 'bottom-right', style: { bottom: -6, right: -6 }, cursor: 'nwse-resize' },
];

// Edge and corner handles for full-edge resizing
const EDGE_HANDLES = [
  { pos: 'top', style: { top: -6, left: 0, width: '100%', height: 12 }, cursor: 'ns-resize' },
  { pos: 'bottom', style: { bottom: -6, left: 0, width: '100%', height: 12 }, cursor: 'ns-resize' },
  { pos: 'left', style: { left: -6, top: 0, width: 12, height: '100%' }, cursor: 'ew-resize' },
  { pos: 'right', style: { right: -6, top: 0, width: 12, height: '100%' }, cursor: 'ew-resize' },
];
const CORNER_HANDLES = [
  { pos: 'top-left', style: { top: -6, left: -6, width: 12, height: 12 }, cursor: 'nwse-resize' },
  { pos: 'top-right', style: { top: -6, right: -6, width: 12, height: 12 }, cursor: 'nesw-resize' },
  { pos: 'bottom-left', style: { bottom: -6, left: -6, width: 12, height: 12 }, cursor: 'nesw-resize' },
  { pos: 'bottom-right', style: { bottom: -6, right: -6, width: 12, height: 12 }, cursor: 'nwse-resize' },
];

const ConsultationMeeting: React.FC = () => {
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelMinimized, setPanelMinimized] = useState(false);
  const [panelMaximized, setPanelMaximized] = useState(false);
  // Remove panelSize and resizing state
  const [panelPos, setPanelPos] = useState({ x: 40, y: 40 });
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number } | null>(null);

  // Drag handlers (unchanged)
  const onDragStart = (e: React.MouseEvent) => {
    if (!panelRef.current) return;
    dragOffset.current = {
      x: e.clientX - panelPos.x,
      y: e.clientY - panelPos.y,
    };
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onDragEnd);
  };
  const onDrag = (e: MouseEvent) => {
    if (!dragOffset.current) return;
    setPanelPos({
      x: Math.max(0, e.clientX - dragOffset.current.x),
      y: Math.max(0, e.clientY - dragOffset.current.y),
    });
  };
  const onDragEnd = () => {
    dragOffset.current = null;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onDragEnd);
  };

  // Panel controls (unchanged)
  const handleMinimize = () => setPanelMinimized(true);
  const handleMaximize = () => {
    setPanelMaximized(true);
    setPanelPos({ x: 40, y: 40 });
  };
  const handleRestore = () => {
    setPanelMaximized(false);
    setPanelPos({ x: 40, y: 40 });
  };
  const handleClose = () => setPanelOpen(false);
  const handleRestoreFromMin = () => setPanelMinimized(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100 font-sans">
      {/* Video call iframe as background */}
      <iframe
        src={MEETING_LINK}
        title="Video Consultation"
        className="absolute inset-0 w-full h-full border-0 z-0 bg-black"
        allow="camera; microphone; fullscreen; display-capture"
        style={{ filter: 'none', transition: 'filter 0.3s' }}
      />

      {/* Floating Prescription Panel */}
      {panelOpen && !panelMinimized && (
        <div
          ref={panelRef}
          className={cn(
            'fixed z-20 bg-white shadow-2xl rounded-2xl border border-blue-200 flex flex-col transition-all duration-300',
            panelMaximized ? 'animate-scalein' : 'animate-floatin'
          )}
          style={{
            width: panelMaximized ? window.innerWidth - 80 : 480,
            height: panelMaximized ? window.innerHeight - 80 : 600,
            left: panelPos.x,
            top: panelPos.y,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
            transition: 'width 0.3s, height 0.3s, left 0.3s, top 0.3s',
            userSelect: undefined,
            pointerEvents: undefined,
          }}
        >
          {/* Panel Header */}
          <div
            className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-2xl cursor-move select-none"
            style={{ userSelect: 'none', pointerEvents: 'auto' }}
            onMouseDown={onDragStart}
          >
            <div className="flex items-center gap-2 text-white font-semibold">
              <Edit2 className="w-5 h-5" /> Prescription
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleMinimize} title="Minimize" className="hover:bg-blue-500/30 rounded p-1 transition"><Minus className="w-5 h-5 text-white" /></button>
              {panelMaximized ? (
                <button onClick={handleRestore} title="Restore" className="hover:bg-blue-500/30 rounded p-1 transition"><Square className="w-5 h-5 text-white" /></button>
              ) : (
                <button onClick={handleMaximize} title="Maximize" className="hover:bg-blue-500/30 rounded p-1 transition"><Maximize2 className="w-5 h-5 text-white" /></button>
              )}
              <button onClick={handleClose} title="Close" className="hover:bg-red-500/30 rounded p-1 transition"><X className="w-5 h-5 text-white" /></button>
            </div>
          </div>
          {/* Panel Content */}
          <div className="flex-1 overflow-auto p-4 bg-gradient-to-br from-blue-50 to-white" style={{ pointerEvents: 'auto' }}>
            <PrescriptionWriterForm />
          </div>
        </div>
      )}

      {/* Minimized Panel Icon */}
      {panelMinimized && (
        <div
          className="fixed bottom-8 left-8 z-30 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg cursor-pointer animate-floatin"
          onClick={handleRestoreFromMin}
          style={{ boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.18)' }}
        >
          <Edit2 className="w-5 h-5 mr-1" /> Prescription
        </div>
      )}
    </div>
  );
};

export default ConsultationMeeting;

// Animations (add to global CSS or Tailwind config)
// .animate-floatin { animation: floatin 0.4s cubic-bezier(0.4,0,0.2,1); }
// .animate-scalein { animation: scalein 0.3s cubic-bezier(0.4,0,0.2,1); }
// @keyframes floatin { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: none; } }
// @keyframes scalein { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } } 