/**
 * A modern phone (the screenshots come from a 20:9 Android device): brushed
 * frame, thin black bezel, punch-hole camera and a faint glass reflection.
 * All `screens` stay mounted and cross-fade, so switching never waits on a
 * download.
 */
export default function Phone({ screens, active = 0, className = '', style, glow, eager = true, label }) {
  return (
    <div className={`phone ${className}`} style={{ ...style, '--glow': glow }} role="img" aria-label={label}>
      <span className="phone-key phone-key-power" aria-hidden="true" />
      <span className="phone-key phone-key-volume" aria-hidden="true" />
      <div className="phone-bezel">
        <div className="phone-screen">
          {screens.map((screen, i) => (
            <img
              key={screen.src}
              src={screen.src}
              alt=""
              width="780"
              height="1751"
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              draggable="false"
              className={`phone-shot ${i === active ? 'is-active' : ''}`}
            />
          ))}
          <span className="phone-camera" aria-hidden="true" />
          <span className="phone-glass" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
