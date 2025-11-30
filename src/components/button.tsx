interface ButtonProps {
  title?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Button(props: ButtonProps) {
  const {
    title = '',
    onClick = () => { },
    disabled = false,
    children,
    label = '',
    className = '',
    style = {}
  } = props;
  return <button style={style} className={"bg-white text-black px-4 py-2 rounded border-2 cursor-pointer"} title={title} onClick={onClick} disabled={disabled}>{children ?? label}</button>
}