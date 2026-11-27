import { useState } from 'react';
import type { PointerEvent } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { ENGINE_TELEMETRY_NODES, type TelemetryNode } from '../data/portfolio';

const EQ_BAR_HEIGHTS = [36, 72, 52, 92, 64, 84, 42, 76, 58, 96, 48, 68];

export function EngineTelemetryBar() {
  const [selectedId, setSelectedId] = useState<string>(ENGINE_TELEMETRY_NODES[0].id);
  const [eqTilt, setEqTilt] = useState(0);

  const activeNode: TelemetryNode =
    ENGINE_TELEMETRY_NODES.find((node) => node.id === selectedId) ??
    ENGINE_TELEMETRY_NODES[0];

  const handleSelect = (node: TelemetryNode, e: PointerEvent<HTMLButtonElement> | null) => {
    setSelectedId(node.id);
    soundEngine.playUiTick('click');
    if (e) {
      const pan = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      soundEngine.playPhotoHoverGlide(pan, 28);
    }
  };

  const handleDeckMove = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const rel = (e.clientX - rect.left) / rect.width;
    setEqTilt(Math.round((rel - 0.5) * 20));
  };

  return (
    <section
      id="engine-deck"
      className="telemetry-deck"
      aria-label="مشخصات فنی موتور و سیستم‌های بازی"
      onPointerMove={handleDeckMove}
      onPointerLeave={() => setEqTilt(0)}
    >
      <div className="telemetry-top">
        <div className="telemetry-brand" dir="ltr">
          <span className="telemetry-dot" aria-hidden="true" />
          <span className="telemetry-ch">CH-01 // UNITY ENGINE TELEMETRY</span>
          <div className="telemetry-eq" aria-hidden="true">
            {EQ_BAR_HEIGHTS.map((h, i) => (
              <span
                key={i}
                style={{
                  height: `${Math.max(22, Math.min(100, h + (i % 2 === 0 ? eqTilt : -eqTilt)))}%`,
                  animationDelay: `${i * 0.09}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="telemetry-nodes" role="tablist" aria-label="ماژول‌های موتور بازی‌سازی">
          {ENGINE_TELEMETRY_NODES.map((node) => {
            const active = node.id === activeNode.id;
            return (
              <button
                key={node.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`telemetry-node${active ? ' is-active' : ''}`}
                onClick={(e) => {
                  setSelectedId(node.id);
                  soundEngine.playUiTick('click');
                  const pan = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
                  soundEngine.playPhotoHoverGlide(pan, 28);
                }}
                onPointerEnter={(e) => handleSelect(node, e)}
              >
                <span className="telemetry-node-code">{node.code}</span>
                <span className="telemetry-node-label">{node.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="telemetry-readout" aria-live="polite">
        <span className="telemetry-metric bdi-ltr">{activeNode.metric}</span>
        <p className="telemetry-text">{activeNode.readout}</p>
        <span className="telemetry-code-tag bdi-ltr">{activeNode.code} · ACTIVE</span>
      </div>
    </section>
  );
}
