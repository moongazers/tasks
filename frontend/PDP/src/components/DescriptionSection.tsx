import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { prepare, layout } from "@chenglou/pretext";
import { track } from "../analytics";

interface Props {
  text: string;
}

const FONT =
  "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const LINE_HEIGHT = 24;
const MIN_WIDTH = 200;
const MAX_WIDTH = 800;

// Two small inline product images — fixed height, so their contribution to
// total block height is known without any DOM measurement.
const FEATURE_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%231a1a2e' width='80' height='80' rx='12'/%3E%3Ctext fill='%23fff' x='40' y='46' text-anchor='middle' font-size='28' font-family='sans-serif'%3E🎧%3C/text%3E%3C/svg%3E";
const BOX_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60' viewBox='0 0 100 60'%3E%3Crect fill='%23e8e8e8' width='100' height='60' rx='8'/%3E%3Ctext fill='%23333' x='50' y='36' text-anchor='middle' font-size='22' font-family='sans-serif'%3E📦%3C/text%3E%3C/svg%3E";

// Fixed height of image elements that sit between text blocks (images + gaps)
const IMAGE_CONTRIBUTION = 80 + 60 + 24; // feature img 80px + box img 60px + gaps

interface Metrics {
  height: number;
  lineCount: number;
  time: number;
}

export default function DescriptionSection({ text }: Props) {
  const [width, setWidth] = useState(500);
  const [usePretext, setUsePretext] = useState(true);
  const [pretextFailed, setPretextFailed] = useState(false);
  const [domMetrics, setDomMetrics] = useState<Metrics | null>(null);
  const domRef = useRef<HTMLDivElement>(null);

  // Pretext: cold path — prepare once
  const prepared = useMemo(() => {
    if (pretextFailed) return null;
    try {
      const t0 = performance.now();
      const p = prepare(text, FONT);
      return { prepared: p, coldTime: performance.now() - t0 };
    } catch {
      setPretextFailed(true);
      return null;
    }
  }, [text, pretextFailed]);

  // Pretext: hot path — re-layout instantly at every width change
  const pretextMetrics = useMemo((): Metrics | null => {
    if (!prepared) return null;
    const t0 = performance.now();
    const { height, lineCount } = layout(
      prepared.prepared,
      width,
      LINE_HEIGHT
    );
    return { height, lineCount, time: performance.now() - t0 };
  }, [prepared, width]);

  // Measure actual DOM height (runs after paint in both modes)
  useEffect(() => {
    const el = domRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      if (!domRef.current) return;
      const t0 = performance.now();
      const { height } = domRef.current.getBoundingClientRect();
      setDomMetrics({
        height,
        lineCount: 0,
        time: performance.now() - t0,
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [width, text]);

  // Predicted total: pretext text height + known image contributions
  const predictedTotal = pretextMetrics
    ? pretextMetrics.height + IMAGE_CONTRIBUTION
    : null;

  const handleModeToggle = useCallback(() => {
    setUsePretext((v) => {
      const next = !v;
      track("desc_mode_toggled", { mode: next ? "pretext" : "dom" });
      return next;
    });
  }, []);

  const lastResizeTracked = useRef(width);
  const handleResizeEnd = useCallback(() => {
    if (width !== lastResizeTracked.current) {
      track("desc_resized", { width, from: lastResizeTracked.current });
      lastResizeTracked.current = width;
    }
  }, [width]);

  const paragraphs = text.split("\n\n");

  return (
    <div className="desc-section">
      {/* Controls */}
      <div className="desc-controls">
        <label className="desc-slider-label">
          Container width: <strong>{width}px</strong>
          <input
            type="range"
            className="desc-slider"
            min={MIN_WIDTH}
            max={MAX_WIDTH}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            onMouseUp={handleResizeEnd}
            onKeyUp={handleResizeEnd}
          />
        </label>

        <button
          type="button"
          className="desc-toggle"
          onClick={handleModeToggle}
        >
          {usePretext ? "Switch to DOM Mode" : "Switch to Pretext Mode"}
        </button>
      </div>

      {/* Metrics panel */}
      <div className="desc-metrics">
        {usePretext && pretextMetrics && (
          <span className="desc-metric desc-metric--pretext">
            Pretext: text {pretextMetrics.lineCount} lines,{" "}
            {pretextMetrics.height.toFixed(1)}px + images {IMAGE_CONTRIBUTION}px
            = <strong>{predictedTotal?.toFixed(0)}px</strong>
            <span className="desc-metric-time">
              {" "}(calculated in {pretextMetrics.time.toFixed(4)}ms)
            </span>
          </span>
        )}
        {domMetrics && (
          <span className="desc-metric desc-metric--dom">
            DOM measured: {Math.round(domMetrics.height)}px
            <span className="desc-metric-time">
              {" "}(in {domMetrics.time.toFixed(2)}ms)
            </span>
          </span>
        )}
      </div>

      {/* The actual description (text + images) */}
      <div
        className="desc-container"
        style={{ maxWidth: `${width}px` }}
      >
        <div ref={domRef} className="desc-text">
          {paragraphs.map((para, i) => {
            const lines = para.split("\n");
            if (lines.length > 1) {
              const heading = lines[0];
              const body = lines.slice(1).join(" ");

              // Insert a small image row before "Key Features" and "What's in the Box"
              const isFeatures = heading === "Key Features";
              const isBox = heading === "What's in the Box";

              return (
                <div key={i}>
                  {isFeatures && (
                    <div className="desc-img-row">
                      <img
                        className="desc-inline-img"
                        src={FEATURE_IMG}
                        width="80"
                        height="80"
                        alt=""
                        loading="lazy"
                      />
                      <span className="desc-img-caption">
                        Engineered for immersive sound
                      </span>
                    </div>
                  )}
                  {isBox && (
                    <div className="desc-img-row">
                      <img
                        className="desc-inline-img"
                        src={BOX_IMG}
                        width="100"
                        height="60"
                        alt=""
                        loading="lazy"
                      />
                      <span className="desc-img-caption">
                        Everything you need, included
                      </span>
                    </div>
                  )}
                  <h3 className="desc-heading">{heading}</h3>
                  <p>{body}</p>
                </div>
              );
            }
            return <p key={i}>{para}</p>;
          })}
        </div>
      </div>

      {/* Performance comparison */}
      {!usePretext && pretextMetrics && domMetrics && (
        <p className="desc-comparison">
          At {width}px, Pretext measures the text in{" "}
          {pretextMetrics.time.toFixed(4)}ms + known image heights
          ({IMAGE_CONTRIBUTION}px) → total prediction without any DOM reflow.
          DOM measurement took{" "}
          <strong>{domMetrics.time.toFixed(2)}ms</strong> — that's{" "}
          <strong>
            ~{(domMetrics.time / pretextMetrics.time).toFixed(0)}x slower
          </strong>{" "}
          and required a full layout pass including image decode.
        </p>
      )}
    </div>
  );
}
