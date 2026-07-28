import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function ModalOverlay({
  children,
  labelledBy,
  onClose,
  returnFocus,
  className,
  dataAttributes,
}: {
  children: ReactNode;
  labelledBy: string;
  onClose: () => void;
  returnFocus?: HTMLElement | null;
  className: string;
  dataAttributes?: Record<string, string>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = panel?.querySelectorAll<HTMLElement>(focusableSelector);
    (focusables?.[0] ?? panel)?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const available = [
        ...panel.querySelectorAll<HTMLElement>(focusableSelector),
      ].filter((element) => !element.hasAttribute('disabled'));
      if (!available.length) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = available[0];
      const last = available[available.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.body.style.overflow = previousOverflow;
      window.setTimeout(() => returnFocus?.focus(), 0);
    };
  }, [returnFocus]);
  const backdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };
  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={backdropClick}
      {...dataAttributes}
    >
      <div
        ref={panelRef}
        className={`modal-panel ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
