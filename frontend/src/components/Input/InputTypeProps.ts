export type InputTypeProps = {
  id: string;
  type: "text" | "email" | "password" | "number" | "search" | "tel" | "url";
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  compulsory?: boolean;
};
