import { useEffect } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { getNextIndex, type ProjectItem } from '../data/portfolio';

export interface LightboxSelection {
  project: ProjectItem;
  index: number;
}

interface LightboxModalProps {
  selection: LightboxSelection | null;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

export function LightboxModal({
  selection,
  onClose,
  onChangeIndex,
}: LightboxModalProps) {
  const total = selection?.project.i.length ?? 0;
  const currentIndex = selection ? Math.min(selection.index, Math.max(0, total - 1)) : 0;

  useEffect(() => {
    if (!selection || total === 0) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.playUiTick('click');
        onClose();
      } else if (e.key === 'ArrowLeft') {
        soundEngine.playCardSlide('next');
        onChangeIndex(getNextIndex(currentIndex, 'next', total));
      } else if (e.key === 'ArrowRight') {
        soundEngine.playCardSlide('prev');
        onChangeIndex(getNextIndex(currentIndex, 'prev', total));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selection, total, currentIndex, onChangeIndex, onClose]);

  const activeSrc =
    selection && total > 0 ? selection.project.i[currentIndex] : '';

  return (
    <div
      id="lb"
      role="dialog"
      aria-modal="true"
      aria-hidden={!selection}
      aria-label={selection ? `گالری ${selection.project.n}` : 'گالری'}
      className={selection ? 'on' : ''}
      onClick={() => {
        soundEngine.playUiTick('click');
        onClose();
      }}
    >
      {selection && activeSrc && (
        <div className="lb-frame" onClick={(e) => e.stopPropagation()}>
          <img
            src={activeSrc}
            alt={`${selection.project.n} — تصویر ${currentIndex + 1}`}
            referrerPolicy="no-referrer"
            onPointerEnter={(e) => {
              const pan = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
              soundEngine.playPhotoHoverGlide(pan, 20);
            }}
            onClick={() => {
              soundEngine.playUiTick('click');
              onClose();
            }}
          />
          <div className="lb-bar">
            {total > 1 && (
              <button
                type="button"
                className="lb-nav"
                onClick={() => {
                  soundEngine.playCardSlide('prev');
                  onChangeIndex(getNextIndex(currentIndex, 'prev', total));
                }}
              >
                قبلی
              </button>
            )}
            <span className="bdi-ltr">
              {selection.project.n} · {currentIndex + 1} / {total}
            </span>
            {total > 1 && (
              <button
                type="button"
                className="lb-nav"
                onClick={() => {
                  soundEngine.playCardSlide('next');
                  onChangeIndex(getNextIndex(currentIndex, 'next', total));
                }}
              >
                بعدی
              </button>
            )}
            <button
              type="button"
              className="lb-nav"
              onClick={() => {
                soundEngine.playUiTick('click');
                onClose();
              }}
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
