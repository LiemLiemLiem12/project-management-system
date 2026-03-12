import type { InputTypeProps } from "./InputTypeProps";

export default function TextInput(props: InputTypeProps) {
  return (
    <>
      <div className="flex flex-col gap-1 w-full">
        {props.label && (
          <label htmlFor={props.id} className="font-bold">
            {props.label}{" "}
            {props.compulsory && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          id={props.id}
          type={props.type}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          disabled={props.disabled}
          className={`w-full px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${props.disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
        />
      </div>
    </>
  );
}
