import React, { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  accentColor: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<ButtonProps> = ({
  accentColor,
  children,
  className,
  disabled,
  ...allProps
}) => {
  return (
    <button
      className={`flex items-center justify-center text-white text-sm border rounded-md shadow-lg transition-transform ${
        disabled
          ? "pointer-events-none opacity-50 bg-gray-300"
          : `bg-${accentColor}-500 hover:bg-${accentColor}-600 focus:outline-none focus:ring-2 focus:ring-${accentColor}-500 focus:ring-opacity-50 hover:scale-105 active:scale-95`
      } px-6 py-3 ${className}`}
      {...allProps}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
