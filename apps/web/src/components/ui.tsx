import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  useEffect,
  useRef,
} from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { environment } from '../config/environment';
export const Button = ({
  className = '',
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={`button ${className}`} {...p} />
);
export const IconButton = ({
  children,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <Button className="icon-button" {...p}>
    {children}
  </Button>
);
export const LinkButton = ({ className = '', ...p }: LinkProps) => (
  <Link className={`button ${className}`} {...p} />
);
export const Card = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => <article className={`card ${className}`}>{children}</article>;
export const Badge = ({ children }: { children: ReactNode }) => (
  <span className="badge">{children}</span>
);
export const StatusBadge = ({ status }: { status: string }) => (
  <span className={`status status-${status}`}>
    <span aria-hidden="true">●</span> {status}
  </span>
);
export function TextInput({
  label,
  ...p
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = p.id ?? p.name;
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} {...p} />
    </label>
  );
}
export function Select({
  label,
  children,
  ...p
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: ReactNode;
}) {
  const id = p.id ?? p.name;
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <select id={id} {...p}>
        {children}
      </select>
    </label>
  );
}
export function Checkbox({
  label,
  ...p
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="choice">
      <input type="checkbox" {...p} />
      <span>{label}</span>
    </label>
  );
}
export function RadioGroup({
  legend,
  name,
  options,
}: {
  legend: string;
  name: string;
  options: string[];
}) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      {options.map((o) => (
        <label className="choice" key={o}>
          <input type="radio" name={name} value={o} />
          <span>{o}</span>
        </label>
      ))}
    </fieldset>
  );
}
export function Dialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (open && !d?.open) d?.showModal();
    if (!open && d?.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="dialog-title">
      <h2 id="dialog-title">{title}</h2>
      {children}
      <Button onClick={onClose}>Close</Button>
    </dialog>
  );
}
export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} title={title} onClose={onClose}>
      <div className="drawer">{children}</div>
    </Dialog>
  );
}
export const Alert = ({ children }: { children: ReactNode }) => (
  <div className="alert" role="status">
    {children}
  </div>
);
export const EmptyState = ({ message }: { message: string }) => (
  <div className="state">
    <h2>No results</h2>
    <p>{message}</p>
  </div>
);
export const LoadingState = () => (
  <div className="state" role="status">
    Loading demo marketplace…
  </div>
);
export const ErrorState = ({ message }: { message: string }) => (
  <div className="state error" role="alert">
    <h2>Something went wrong</h2>
    <p>{message}</p>
  </div>
);
export const PageHeader = ({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) => (
  <header className="page-header">
    <div>
      <p className="eyebrow">Golfer Goodies</p>
      <h1>{title}</h1>
    </div>
    {children}
  </header>
);
export const SectionHeader = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => (
  <header className="section-header">
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </header>
);
export const EnvironmentBadge = () =>
  !environment.production ? (
    <span
      className="environment-badge"
      aria-label={`Application environment: ${environment.mode}`}
    >
      {environment.mode} environment
    </span>
  ) : null;
